import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CreateMonitorDto, UpdateMonitorDto } from '@monitoring/shared';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertService } from '../alerts/alert.service';
import { MonitorEntity } from './monitor.entity';
import { PingResultEntity } from './ping-result.entity';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  constructor(
    @InjectRepository(MonitorEntity)
    private readonly monitorRepo: EntityRepository<MonitorEntity>,
    @InjectRepository(PingResultEntity)
    private readonly pingRepo: EntityRepository<PingResultEntity>,
    private readonly em: EntityManager,
    private readonly alertService: AlertService,
  ) {}

  findAll() {
    return this.monitorRepo.findAll({ orderBy: { createdAt: 'ASC' } });
  }

  async findOne(id: string) {
    const monitor = await this.monitorRepo.findOne({ id });
    if (!monitor) throw new NotFoundException('Monitor non trouvé');
    return monitor;
  }

  async create(dto: CreateMonitorDto) {
    const monitor = this.monitorRepo.create(dto);
    await this.em.persistAndFlush(monitor);
    // Ping immédiat à la création
    await this.pingOne(monitor);
    return monitor;
  }

  async update(id: string, dto: UpdateMonitorDto) {
    const monitor = await this.findOne(id);
    this.monitorRepo.assign(monitor, dto);
    await this.em.flush();
    return monitor;
  }

  async remove(id: string) {
    const monitor = await this.findOne(id);
    await this.em.removeAndFlush(monitor);
  }

  async getHistory(monitorId: string, limit = 100) {
    return this.pingRepo.find(
      { monitor: monitorId },
      { orderBy: { checkedAt: 'DESC' }, limit },
    );
  }

  async getStats(monitorId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const results = await this.pingRepo.find(
      { monitor: monitorId, checkedAt: { $gte: since } },
      { orderBy: { checkedAt: 'ASC' } },
    );

    const total = results.length;
    const upCount = results.filter((r) => r.status === 'up').length;
    const downCount = total - upCount;
    const uptimePercent =
      total > 0 ? Math.round((upCount / total) * 1000) / 10 : 0;
    const latencies = results
      .filter((r) => r.latencyMs != null)
      .map((r) => r.latencyMs!);
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : null;

    return { total, upCount, downCount, uptimePercent, avgLatency, results };
  }

  async pingOne(monitor: MonitorEntity): Promise<PingResultEntity> {
    const start = Date.now();
    let status: 'up' | 'down' = 'down';
    let statusCode: number | undefined;
    let latencyMs: number | undefined;
    let errorMessage: string | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const response = await fetch(monitor.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'MonitoringApp/1.0' },
      });
      clearTimeout(timeout);
      latencyMs = Date.now() - start;
      statusCode = response.status;
      status = response.ok ? 'up' : 'down';
      if (!response.ok)
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
    } catch (err: any) {
      latencyMs = Date.now() - start;
      errorMessage = err.name === 'AbortError' ? 'Timeout (10s)' : err.message;
    }

    const result = this.pingRepo.create({
      monitor,
      status,
      statusCode,
      latencyMs,
      errorMessage,
    });

    const wasUp = monitor.status === 'up';
    const wasDown = monitor.status === 'down';

    monitor.status = status;
    monitor.lastCheckedAt = new Date();
    monitor.lastLatencyMs = latencyMs;
    monitor.consecutiveFailures =
      status === 'down' ? monitor.consecutiveFailures + 1 : 0;

    await this.em.persistAndFlush(result);

    // Alertes uniquement au changement de statut
    if (monitor.alertEnabled) {
      if (status === 'down' && (wasUp || monitor.consecutiveFailures === 0)) {
        await this.alertService.sendDownAlert(monitor, errorMessage);
      } else if (status === 'up' && wasDown) {
        await this.alertService.sendRecoveryAlert(monitor);
      }
    }

    this.logger.log(
      `[${monitor.name}] ${status.toUpperCase()} — ${latencyMs}ms${statusCode ? ` · HTTP ${statusCode}` : ''}`,
    );

    return result;
  }

  @Cron('* * * * *')
  async pingAll() {
    const em = this.em.fork(); // ← fork() crée un contexte isolé
    const monitors = await em.find(MonitorEntity, { active: true });

    for (const monitor of monitors) {
      const shouldPing =
        !monitor.lastCheckedAt ||
        Date.now() - monitor.lastCheckedAt.getTime() >=
          monitor.intervalSeconds * 1000;

      if (shouldPing) {
        this.pingOne(monitor).catch((err) =>
          this.logger.error(`Ping error for ${monitor.name}: ${err.message}`),
        );
      }
    }
  }
}
