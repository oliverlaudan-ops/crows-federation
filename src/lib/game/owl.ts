/**
 * The Owl — the federation's ancient enemy.
 *
 * Each failed "Steal an Egg" scheme draws his gaze. When his patience runs out,
 * he strikes back. Defeat him in the bell-tower climax to ascend.
 */

export type OwlPhase = "distant" | "watching" | "striking" | "defeated";

export interface OwlState {
  phase: OwlPhase;
  /** 0..100 — increases when stealing his egg fails; decreases slowly over time */
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
const IRE_DECAY_PER_MIN = 1;

export function ireDelta(elapsedMs: number): number {
  // Decays slowly with time
  const minutes = elapsedMs / 60_000;
  return -minutes * IRE_DECAY_PER_MIN;
}

export function tickOwl(state: OwlState, elapsedMs: number): OwlState {
  if (state.defeated) return state;
  const ire = Math.max(0, Math.min(100, state.ire + ireDelta(elapsedMs)));
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