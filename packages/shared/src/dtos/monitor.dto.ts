import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const MonitorStatusSchema = z.enum(["up", "down", "pending"]);
export type MonitorStatus = z.infer<typeof MonitorStatusSchema>;

// ── Monitor ────────────────────────────────────────────────────────────────

export const MonitorResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().url(),
  status: MonitorStatusSchema,
  intervalSeconds: z.number().int(),
  lastCheckedAt: z.string().nullable(),
  lastLatencyMs: z.number().nullable(),
  consecutiveFailures: z.number().int(),
  alertEnabled: z.boolean(),
  alertEmail: z.string().email().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
});
export type MonitorResponse = z.infer<typeof MonitorResponseSchema>;

export const CreateMonitorDtoSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  url: z.string().url("URL invalide"),
  intervalSeconds: z.number().int().min(30).max(3600).optional().default(60),
  alertEnabled: z.boolean().optional().default(true),
  alertEmail: z.string().email().optional(),
});
export type CreateMonitorDto = z.infer<typeof CreateMonitorDtoSchema>;

export const UpdateMonitorDtoSchema = CreateMonitorDtoSchema.partial();
export type UpdateMonitorDto = z.infer<typeof UpdateMonitorDtoSchema>;

// ── Ping Result ────────────────────────────────────────────────────────────

export const PingResultSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["up", "down"]),
  statusCode: z.number().nullable(),
  latencyMs: z.number().nullable(),
  errorMessage: z.string().nullable(),
  checkedAt: z.string(),
});
export type PingResult = z.infer<typeof PingResultSchema>;

// ── Stats ──────────────────────────────────────────────────────────────────

export const MonitorStatsSchema = z.object({
  total: z.number(),
  upCount: z.number(),
  downCount: z.number(),
  uptimePercent: z.number(),
  avgLatency: z.number().nullable(),
  results: z.array(PingResultSchema),
});
export type MonitorStats = z.infer<typeof MonitorStatsSchema>;
