import { create } from "zustand";
import { apiClient } from "../api/client";
import {
  MonitorResponse,
  PingResult,
  MonitorStats,
  CreateMonitorDto,
  UpdateMonitorDto,
} from "@monitoring/shared";

type MonitorState = {
  monitors: MonitorResponse[];
  loading: boolean;
  error: string | null;

  fetchMonitors: () => Promise<void>;
  createMonitor: (dto: CreateMonitorDto) => Promise<MonitorResponse | undefined>;
  updateMonitor: (id: string, dto: UpdateMonitorDto) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  pingNow: (id: string) => Promise<PingResult | undefined>;
  getHistory: (id: string, limit?: number) => Promise<PingResult[]>;
  getStats: (id: string) => Promise<MonitorStats | undefined>;
};

export const useMonitorStore = create<MonitorState>((set, get) => ({
  monitors: [],
  loading: false,
  error: null,

  fetchMonitors: async () => {
    set({ loading: true, error: null });
    try {
      const { status, body } = await apiClient.monitors.findAll();
      if (status === 200) {
        set({ monitors: body, loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createMonitor: async (dto) => {
    set({ loading: true, error: null });
    try {
      const { status, body } = await apiClient.monitors.create({ body: dto });
      if (status === 201) {
        await get().fetchMonitors();
        return body;
      }
      return undefined;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return undefined;
    }
  },

  updateMonitor: async (id, dto) => {
    set({ loading: true, error: null });
    try {
      const { status, body } = await apiClient.monitors.update({
        params: { id },
        body: dto,
      });
      if (status === 200) {
        set((s) => ({
          monitors: s.monitors.map((m) => (m.id === id ? (body as MonitorResponse) : m)),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteMonitor: async (id) => {
    set({ loading: true, error: null });
    try {
      const { status } = await apiClient.monitors.delete({
        params: { id },
        body: {},
      });
      if (status === 200) {
        set((s) => ({
          monitors: s.monitors.filter((m) => m.id !== id),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  pingNow: async (id) => {
    try {
      const { status, body } = await apiClient.monitors.pingNow({
        params: { id },
        body: {},
      });
      if (status === 201) {
        const result = body as PingResult;
        // Met à jour le monitor dans le store directement
        set((s) => ({
          monitors: s.monitors.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: result.status,
                  lastLatencyMs: result.latencyMs,
                  lastCheckedAt: result.checkedAt,
                }
              : m,
          ),
        }));
        return result;
      }
      return undefined;
    } catch (error) {
      set({ error: (error as Error).message });
      return undefined;
    }
  },

  getHistory: async (id, limit = 100) => {
    try {
      const { status, body } = await apiClient.monitors.getHistory({
        params: { id },
        query: { limit },
      });
      if (status === 200) return body as PingResult[];
      return [];
    } catch {
      return [];
    }
  },

  getStats: async (id) => {
    try {
      const { status, body } = await apiClient.monitors.getStats({
        params: { id },
      });
      if (status === 200) return body as MonitorStats;
      return undefined;
    } catch {
      return undefined;
    }
  },
}));
