import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { MonitorEntity } from "../monitors/monitor.entity";

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly defaultAlertEmail: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>("RESEND_API_KEY"));
    this.fromEmail = this.config.get<string>("EMAIL_FROM") ?? "onboarding@resend.dev";
    this.defaultAlertEmail = this.config.get<string>("ALERT_EMAIL") ?? "";
  }

  async sendDownAlert(monitor: MonitorEntity, errorMessage?: string): Promise<void> {
    const to = monitor.alertEmail || this.defaultAlertEmail;
    if (!to) return;
    const now = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `🔴 [DOWN] ${monitor.name} est inaccessible`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:40px auto;">
          <div style="background:#c62828;padding:24px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:18px;">🔴 Service inaccessible</h1>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #eee;border-radius:0 0 8px 8px;">
            <h2 style="color:#c62828;margin-top:0;">${monitor.name}</h2>
            <p><strong>URL :</strong> ${monitor.url}</p>
            <p><strong>Détecté à :</strong> ${now}</p>
            ${errorMessage ? `<p><strong>Erreur :</strong> <code>${errorMessage}</code></p>` : ""}
            <p style="color:#666;font-size:13px;">Vous recevrez un email de rétablissement dès que le service revient.</p>
          </div>
        </div>`,
      });
      this.logger.warn(`Down alert sent → ${to} for "${monitor.name}"`);
    } catch (err) {
      this.logger.error(`Failed to send down alert: ${err.message}`);
    }
  }

  async sendRecoveryAlert(monitor: MonitorEntity): Promise<void> {
    const to = monitor.alertEmail || this.defaultAlertEmail;
    if (!to) return;
    const now = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `✅ [UP] ${monitor.name} est de nouveau accessible`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:40px auto;">
          <div style="background:#2e7d32;padding:24px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:18px;">✅ Service rétabli</h1>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #eee;border-radius:0 0 8px 8px;">
            <h2 style="color:#2e7d32;margin-top:0;">${monitor.name}</h2>
            <p><strong>URL :</strong> ${monitor.url}</p>
            <p><strong>Rétabli à :</strong> ${now}</p>
            <p><strong>Latence :</strong> ${monitor.lastLatencyMs}ms</p>
          </div>
        </div>`,
      });
      this.logger.log(`Recovery alert sent → ${to} for "${monitor.name}"`);
    } catch (err) {
      this.logger.error(`Failed to send recovery alert: ${err.message}`);
    }
  }
}
