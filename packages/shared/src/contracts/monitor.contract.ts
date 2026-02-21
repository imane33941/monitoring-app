import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  CreateMonitorDtoSchema,
  MonitorResponseSchema,
  MonitorStatsSchema,
  PingResultSchema,
  UpdateMonitorDtoSchema,
} from "../dtos/monitor.dto";

const c = initContract();

export const monitorContract = c.router({
  findAll: {
    method: "GET",
    path: "/monitors",
    responses: {
      200: z.array(MonitorResponseSchema),
    },
    summary: "Lister tous les monitors",
  },

  findOne: {
    method: "GET",
    path: "/monitors/:id",
    pathParams: z.object({ id: z.string().uuid() }),
    responses: {
      200: MonitorResponseSchema,
      404: z.object({ message: z.string() }),
    },
    summary: "Récupérer un monitor par ID",
  },

  create: {
    method: "POST",
    path: "/monitors",
    body: CreateMonitorDtoSchema,
    responses: {
      201: MonitorResponseSchema,
      400: z.object({ message: z.string() }),
    },
    summary: "Créer un monitor",
  },

  update: {
    method: "PATCH",
    path: "/monitors/:id",
    pathParams: z.object({ id: z.string().uuid() }),
    body: UpdateMonitorDtoSchema,
    responses: {
      200: MonitorResponseSchema,
      404: z.object({ message: z.string() }),
    },
    summary: "Modifier un monitor",
  },

  delete: {
    method: "DELETE",
    path: "/monitors/:id",
    pathParams: z.object({ id: z.string().uuid() }),
    body: z.object({}),
    responses: {
      200: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Supprimer un monitor",
  },

  getHistory: {
    method: "GET",
    path: "/monitors/:id/history",
    pathParams: z.object({ id: z.string().uuid() }),
    query: z.object({
      limit: z.coerce.number().int().min(1).max(500).optional().default(100),
    }),
    responses: {
      200: z.array(PingResultSchema),
      404: z.object({ message: z.string() }),
    },
    summary: "Historique des pings",
  },

  getStats: {
    method: "GET",
    path: "/monitors/:id/stats",
    pathParams: z.object({ id: z.string().uuid() }),
    responses: {
      200: MonitorStatsSchema,
      404: z.object({ message: z.string() }),
    },
    summary: "Stats 24h (uptime, latence moyenne, incidents)",
  },

  pingNow: {
    method: "POST",
    path: "/monitors/:id/ping",
    pathParams: z.object({ id: z.string().uuid() }),
    body: z.object({}),
    responses: {
      201: PingResultSchema,
      404: z.object({ message: z.string() }),
    },
    summary: "Ping manuel immédiat",
  },
});

export type MonitorContract = typeof monitorContract;
