"use client";

import { create } from "zustand";
import { initialState, type GameState, save, load, reset } from "@/lib/game/save";
import { tick, type RunningScheme, type GameEvent } from "@/lib/game/tick";
import {
  schemes as schemeDefs,
  schemeStartCost,
  type SchemeId,
} from "@/lib/game/schemes";
import {
  initialResources,
  spend as spendResource,
} from "@/lib/game/resources";
import { recruit, fall } from "@/lib/game/crows";
import { angerOwl, defeatOwl } from "@/lib/game/owl";

interface Store {
  state: GameState;
  running: RunningScheme[];
  events: GameEvent[];
  hasHydrated: boolean;

  hydrate: () => void;

  /** Apply a tick — called by the heartbeat loop */
  pulse: (elapsedMs: number) => void;

  /** Recruit new crows by spending shinies (10 = 1 crow) */
  recruitCrows: () => void;

  /** Start a scheme if affordable & unlocked */
  startScheme: (id: SchemeId, extraInvestment?: number) => boolean;

  /** Reset everything (debug / new game) */
  newGame: () => void;

  /** Clear the event queue after the UI has rendered them */
  clearEvents: () => void;

  /** Manual save */
  persist: () => void;
}

const TICK_MS = 500;

export const useGame = create<Store>((set, get) => ({
  state: initialState(),
  running: [],
  events: [],
  hasHydrated: false,

  hydrate: () => {
    if (get().hasHydrated) return;
    const loaded = load();
    if (loaded) {
      set({ state: loaded, hasHydrated: true });
    } else {
      set({ hasHydrated: true });
    }
  },

  pulse: (elapsedMs) => {
    const { state, running } = get();
    const { next, events } = tick(state, running, elapsedMs);
    // Apply owl strikes immediately
    let withStrikes = next;
    for (const ev of events) {
      if (ev.kind === "owl_strike") {
        withStrikes = {
          ...withStrikes,
          flock: fall(withStrikes.flock, ev.crowsLost),
          strikesSurvived: withStrikes.strikesSurvived + 1,
        };
      }
      if (ev.kind === "scheme_complete" && !ev.result.success) {
        withStrikes = {
          ...withStrikes,
          flock: fall(withStrikes.flock, ev.result.crowsLost),
        };
      }
    }
    // Remove completed schemes from running list
    const stillRunning = running.filter(
      (r) => Date.now() < r.completesAt,
    );
    set({ state: withStrikes, running: stillRunning, events });
    save(withStrikes);
  },

  clearEvents: () => set({ events: [] }),

  recruitCrows: () => {
    const { state } = get();
    const { flock, spent } = recruit(state.flock, state.resources.shinies);
    if (spent === 0) return;
    const updated = spendResource(state.resources, "shinies", spent);
    if (!updated) return;
    set({
      state: {
        ...state,
        resources: updated,
        flock,
      },
    });
    save(get().state);
  },

  startScheme: (id, extraInvestment = 0) => {
    const { state } = get();
    const def = schemeDefs[id];
    if (!state.unlockedSchemes.includes(id)) return false;
    const cost = schemeStartCost(def, extraInvestment);
    const after = spendResource(state.resources, "shinies", cost);
    if (!after) return false;
    const now = Date.now();
    const active: RunningScheme = {
      id,
      startedAt: now,
      completesAt: now + def.baseDurationMs,
      invested: extraInvestment,
      definition: def,
    };
    set({
      state: { ...state, resources: after },
      running: [...get().running, active],
    });
    save(get().state);
    return true;
  },

  newGame: () => {
    reset();
    set({
      state: initialState(),
      running: [],
      events: [],
    });
  },

  persist: () => {
    save(get().state);
  },
}));

/** Heartbeat — drives the passive game loop */
export function startHeartbeat(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handle = window.setInterval(() => {
    useGame.getState().pulse(TICK_MS);
  }, TICK_MS);
  return () => window.clearInterval(handle);
}

// Re-exports for UI convenience
export { schemeDefs, angerOwl, defeatOwl, initialResources };