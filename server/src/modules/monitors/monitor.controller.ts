import { Controller } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { apiContract } from "@monitoring/shared";
import { MonitorService } from "./monitor.service";

@Controller()
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @TsRestHandler(apiContract.monitors.findAll)
  async findAll() {
    return tsRestHandler(apiContract.monitors.findAll, async () => {
      const monitors = await this.monitorService.findAll();
      return { status: 200 as const, body: monitors as any };
    });
  }

  @TsRestHandler(apiContract.monitors.findOne)
  async findOne() {
    return tsRestHandler(apiContract.monitors.findOne, async ({ params }) => {
      const monitor = await this.monitorService.findOne(params.id);
      return { status: 200 as const, body: monitor as any };
    });
  }

  @TsRestHandler(apiContract.monitors.create)
  async create() {
    return tsRestHandler(apiContract.monitors.create, async ({ body }) => {
      const monitor = await this.monitorService.create(body);
      return { status: 201 as const, body: monitor as any };
    });
  }

  @TsRestHandler(apiContract.monitors.update)
  async update() {
    return tsRestHandler(apiContract.monitors.update, async ({ params, body }) => {
      const monitor = await this.monitorService.update(params.id, body);
      return { status: 200 as const, body: monitor as any };
    });
  }

  @TsRestHandler(apiContract.monitors.delete)
  async delete() {
    return tsRestHandler(apiContract.monitors.delete, async ({ params }) => {
      await this.monitorService.remove(params.id);
      return { status: 200 as const, body: { message: "Monitor supprimé" } };
    });
  }

  @TsRestHandler(apiContract.monitors.getHistory)
  async getHistory() {
    return tsRestHandler(apiContract.monitors.getHistory, async ({ params, query }) => {
      const history = await this.monitorService.getHistory(params.id, query.limit);
      return { status: 200 as const, body: history as any };
    });
  }

  @TsRestHandler(apiContract.monitors.getStats)
  async getStats() {
    return tsRestHandler(apiContract.monitors.getStats, async ({ params }) => {
      const stats = await this.monitorService.getStats(params.id);
      return { status: 200 as const, body: stats as any };
    });
  }

  @TsRestHandler(apiContract.monitors.pingNow)
  async pingNow() {
    return tsRestHandler(apiContract.monitors.pingNow, async ({ params }) => {
      const monitor = await this.monitorService.findOne(params.id);
      const result = await this.monitorService.pingOne(monitor);
      return { status: 201 as const, body: result as any };
    });
  }
}
