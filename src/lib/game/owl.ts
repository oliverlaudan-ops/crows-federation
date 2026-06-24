/**
 * The Owl — the federation's ancient enemy.
 *
 * Each failed "Steal an Egg" scheme draws his gaze. When his patience runs out,
 * he strikes back. Defeat him in the bell-tower climax to ascend.
 *
 * The owl is a creature of dusk and night. During the day his ire drains
 * faster. At night — and especially when the federation is raiding his belfry —
 * he hunts back.
 */

import type { DayPhase } from "./time";
import { isDark } from "./time";

export type OwlPhase = "distant" | "watching" | "striking" | "defeated";

export interface OwlState {
  phase: OwlPhase;
  /** 0..100 — increases when stealing his egg fails; decreases faster by day */
  ire: number;
  /** Set true once the federation has driven him off — opens ascension */
  defeated: boolean;
}

export const initialOwl: OwlState = {
  phase: "distant",
  ire: 0,
  defeated: false,
};

const IRE_FROM_EGG_THEFT = 25;
const IRE_DECAY_PER_MIN_DAY = 1.5;
const IRE_DECAY_PER_MIN_NIGHT = 0.4; // he broods in the dark

export function ireDecayPerMin(phase: DayPhase): number {
  return isDark(phase) ? IRE_DECAY_PER_MIN_NIGHT : IRE_DECAY_PER_MIN_DAY;
}

export function ireDelta(elapsedMs: number, phase: DayPhase): number {
  // Decays slowly with time, rate depends on time of day
  const minutes = elapsedMs / 60_000;
  return -minutes * ireDecayPerMin(phase);
}

export function tickOwl(state: OwlState, elapsedMs: number, phase: DayPhase): OwlState {
  if (state.defeated) return state;
  const ire = Math.max(0, Math.min(100, state.ire + ireDelta(elapsedMs, phase)));
  return {
    ...state,
    ire,
    phase: phaseFromIre(ire),
  };
}

export function angerOwl(state: OwlState, amount = IRE_FROM_EGG_THEFT): OwlState {
  if (state.defeated) return state;
  const ire = Math.min(100, state.ire + amount);
  return {
    ...state,
    ire,
    phase: phaseFromIre(ire),
  };
}

export function defeatOwl(state: OwlState): OwlState {
  return { phase: "defeated", ire: 0, defeated: true };
}

function phaseFromIre(ire: number): OwlPhase {
  if (ire < 25) return "distant";
  if (ire < 75) return "watching";
  return "striking";
}

export function owlStrikeSeverity(state: OwlState): number {
  // Number of crows the owl will carry off if you fail to appease him
  if (state.phase === "distant") return 0;
  if (state.phase === "watching") return 1;
  return 3; // striking
}

/**
 * Probability (per tick) that the owl will strike unprovoked.
 * Doubles at night, plus a small bonus when he's already annoyed.
 */
export function owlStrikeChance(state: OwlState, phase: DayPhase): number {
  if (state.defeated) return 0;
  const base = state.phase === "striking" ? 0.15 : state.phase === "watching" ? 0.05 : 0;
  return isDark(phase) ? base * 2 : base;
}