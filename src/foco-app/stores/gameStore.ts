// ─────────────────────────────────────────────
// Game Store — 任務、農場、背包
// ─────────────────────────────────────────────
import { create } from 'zustand';
import type { Mission, FarmPlot, BackpackItem } from '@/types';

interface GameState {
  // Missions
  missions: Mission[];
  activeMission: Mission | null;
  accomplishedMissions: Mission[];

  // Farm
  farmPlots: FarmPlot[];

  // Backpack
  backpackItems: BackpackItem[];

  // Mission Actions
  setMissions: (missions: Mission[]) => void;
  startMission: (mission: Mission) => void;
  tickMission: () => void;           // 每秒呼叫，倒數 -1
  completeMission: () => void;
  failMission: () => void;

  // Farm Actions
  setFarmPlots: (plots: FarmPlot[]) => void;
  plantCrop: (plotId: string, crop: string, durationMs: number) => void;
  harvestPlot: (plotId: string) => void;

  // Backpack Actions
  setBackpackItems: (items: BackpackItem[]) => void;
  addBackpackItem: (item: BackpackItem) => void;
  useBackpackItem: (itemId: string, quantity?: number) => void;

  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  missions: [],
  activeMission: null,
  accomplishedMissions: [],
  farmPlots: [],
  backpackItems: [],

  // ── Mission ──────────────────────────────────

  setMissions: (missions) => set({ missions }),

  startMission: (mission) => {
    const active: Mission = { ...mission, status: 'active' };
    set({ activeMission: active });
  },

  tickMission: () => {
    const { activeMission } = get();
    if (!activeMission || activeMission.status !== 'active') return;

    const remaining = activeMission.remainingSeconds - 1;
    if (remaining <= 0) {
      set({
        activeMission: { ...activeMission, remainingSeconds: 0, status: 'accomplished' },
      });
    } else {
      set({ activeMission: { ...activeMission, remainingSeconds: remaining } });
    }
  },

  completeMission: () => {
    const { activeMission, accomplishedMissions } = get();
    if (!activeMission) return;
    const done: Mission = { ...activeMission, status: 'accomplished' };
    set({
      accomplishedMissions: [done, ...accomplishedMissions],
      activeMission: null,
    });
  },

  failMission: () => {
    const { activeMission } = get();
    if (!activeMission) return;
    set({ activeMission: { ...activeMission, status: 'failed' } });
    setTimeout(() => set({ activeMission: null }), 2000);
  },

  // ── Farm ─────────────────────────────────────

  setFarmPlots: (farmPlots) => set({ farmPlots }),

  plantCrop: (plotId, crop, durationMs) => {
    const now = new Date().toISOString();
    const harvestAt = new Date(Date.now() + durationMs).toISOString();
    set({
      farmPlots: get().farmPlots.map((p) =>
        p.id === plotId
          ? { ...p, crop, plantedAt: now, harvestAt, state: 'growing' }
          : p,
      ),
    });
  },

  harvestPlot: (plotId) => {
    set({
      farmPlots: get().farmPlots.map((p) =>
        p.id === plotId
          ? { ...p, crop: null, plantedAt: null, harvestAt: null, state: 'empty' }
          : p,
      ),
    });
  },

  // ── Backpack ──────────────────────────────────

  setBackpackItems: (backpackItems) => set({ backpackItems }),

  addBackpackItem: (item) => {
    const existing = get().backpackItems.find((i) => i.id === item.id);
    if (existing) {
      set({
        backpackItems: get().backpackItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        ),
      });
    } else {
      set({ backpackItems: [...get().backpackItems, item] });
    }
  },

  useBackpackItem: (itemId, quantity = 1) => {
    set({
      backpackItems: get()
        .backpackItems.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i,
        )
        .filter((i) => i.quantity > 0),
    });
  },

  reset: () =>
    set({
      missions: [],
      activeMission: null,
      accomplishedMissions: [],
      farmPlots: [],
      backpackItems: [],
    }),
}));
