/**
 * World time — the day/night cycle that frames everything.
 *
 * 1 in-game day = 4 phases × 1 minute real time = 4 minutes/day
 * - day:    warm light, humans out, owl rests
 * - dusk:   transition, owl wakes
 * - night:  owl hunts, federation's hour
 * - dawn:   transition, owl returns
 *
 * The cycle is monotonic and based on real wall-clock time so the game
 * doesn't drift if the tab is backgrounded.
 */

export type DayPhase = "day" | "dusk" | "night" | "dawn";

export interface WorldTime {
  /** Real-time ms timestamp at which the current cycle started */
  cycleStartedAt: number;
}

export const PHASE_DURATION_MS = 60_000; // 1 minute per phase
export const CYCLE_DURATION_MS = PHASE_DURATION_MS * 4; // 4 minutes per day

export const PHASE_LABELS: Record<DayPhase, string> = {
  day: "Day",
  dusk: "Dusk",
  night: "Night",
  dawn: "Dawn",
};

/** Color accent for the world-clock UI, in our crow palette */
export const PHASE_TINT: Record<DayPhase, string> = {
  day: "text-crow-owl",       // warm gold
  dusk: "text-crow-rust",     // blood-rust
  night: "text-crow-crowblue",// crow blue, moon
  dawn: "text-crow-bone",     // pale bone
};

export const initialWorldTime: WorldTime = {
  cycleStartedAt: Date.now(),
};

/**
 * Compute the current phase given when the cycle started and the wall clock now.
 */
export function currentPhase(wt: WorldTime, now: number = Date.now()): DayPhase {
  const elapsed = now - wt.cycleStartedAt;
  // Wrap elapsed into [0, CYCLE_DURATION_MS) so the cycle is truly endless
  const t = ((elapsed % CYCLE_DURATION_MS) + CYCLE_DURATION_MS) % CYCLE_DURATION_MS;
  const phaseIndex = Math.floor(t / PHASE_DURATION_MS);
  // 0 = day, 1 = dusk, 2 = night, 3 = dawn
  const phases: DayPhase[] = ["day", "dusk", "night", "dawn"];
  const phase = phases[phaseIndex];
  return phase ?? "day";
}

/**
 * Time remaining (ms) in the current phase.
 */
export function msUntilNextPhase(wt: WorldTime, now: number = Date.now()): number {
  const elapsed = now - wt.cycleStartedAt;
  const t = ((elapsed % CYCLE_DURATION_MS) + CYCLE_DURATION_MS) % CYCLE_DURATION_MS;
  return PHASE_DURATION_MS - (t % PHASE_DURATION_MS);
}

/**
 * Time of night as 0..1 — useful for UI animations (moon arc, etc.)
 */
export function cycleProgress(wt: WorldTime, now: number = Date.now()): number {
  const elapsed = now - wt.cycleStartedAt;
  const t = ((elapsed % CYCLE_DURATION_MS) + CYCLE_DURATION_MS) % CYCLE_DURATION_MS;
  return t / CYCLE_DURATION_MS;
}

/**
 * Whether a given phase is "dark" — used to gate nocturnal schemes
 * and to make the owl feel present.
 */
export function isDark(phase: DayPhase): boolean {
  return phase === "night" || phase === "dusk" || phase === "dawn";
}
