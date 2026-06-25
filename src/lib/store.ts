"use client";

import { create } from "zustand";
import {
  initialState,
  type GameState,
  save,
  load,
  reset,
} from "@/lib/game/save";
import { tick, type RunningScheme, type GameEvent } from "@/lib/game/tick";
import {
  schemes as schemeDefs,
  schemeStartCost,
  type SchemeId,
} from "@/lib/game/schemes";
import { currentPhase } from "@/lib/game/time";
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

  /** Start a scheme if affordable & unlocked & at the right hour */
  startScheme: (id: SchemeId, extraInvestment?: number) => boolean;

  /**
   * Unlock a locked scheme by spending secrets.
   * Returns true on success, false if already unlocked or not enough secrets
   * (or the scheme id is unknown).
   */
  unlockScheme: (id: SchemeId) => boolean;

  /** Reset everything (debug / new game) */
  newGame: () => void;

  /**
   * Begin a new cycle after defeating the owl.
   * Resets most state, keeps +1% prestige bonus per owl slain.
   */
  newCycle: () => void;

  /** Clear the event queue after the UI has rendered them */
  clearEvents: () => void;

  /** Manual save */
  persist: () => void;
}

const TICK_MS = 500;
const CONFRONT_UNLOCK_CORRUPTION = 3;

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
    const stillRunning = running.filter((r) => Date.now() < r.completesAt);
    set({ state: withStrikes, running: stillRunning, events });
    save(withStrikes);
  },

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
    const phase = currentPhase(state.world);
    if (!def.activePhases.includes(phase)) return false;
    // Endgame scheme has an extra unlock condition
    if (def.isEndgame) {
      if (state.owl.defeated) return false;
      if (state.belfryCorruption < CONFRONT_UNLOCK_CORRUPTION) return false;
    }
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

  unlockScheme: (id) => {
    const { state } = get();
    const def = schemeDefs[id];
    if (!def) return false;
    if (state.unlockedSchemes.includes(id)) return false;
    // Endgame scheme is gated by belfry corruption, not secrets — refuse here.
    if (def.isEndgame) return false;
    const cost = def.unlockCost.secrets;
    const after = spendResource(state.resources, "secrets", cost);
    if (!after) return false;
    set({
      state: {
        ...state,
        resources: after,
        unlockedSchemes: [...state.unlockedSchemes, id],
      },
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

  newCycle: () => {
    const { state } = get();
    // Add +1% passive income per owl slain, keep it.
    const prestigeBonus = 1 + 0.01 * state.owlSlainCount;
    // Reset everything except prestige.
    set({
      state: {
        ...initialState(),
        prestigeBonus,
        owlSlainCount: state.owlSlainCount,
      },
      running: [],
      events: [],
    });
    save(get().state);
  },

  clearEvents: () => set({ events: [] }),

  persist: () => {
    save(get().state);
  },
}));

export function startHeartbeat(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handle = window.setInterval(() => {
    useGame.getState().pulse(TICK_MS);
  }, TICK_MS);
  return () => window.clearInterval(handle);
}

// Re-exports for UI convenience
export { schemeDefs, angerOwl, defeatOwl, initialResources, CONFRONT_UNLOCK_CORRUPTION };