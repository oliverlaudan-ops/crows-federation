/**
 * Game tick — the heartbeat that turns time into progress.
 *
 * Runs in the browser via the React effect in the root page. Each tick:
 *   - Adds passive resources (per crow)
 *   - Decays owl ire (faster by day, slower at night)
 *   - Possibly auto-strikes the owl at night
 *   - Resolves completed schemes using the *current* world phase
 */

import type { GameState } from "./save";
import { add as addResource, passiveRate } from "./resources";
import { schemes as schemeDefs, resolve as resolveScheme, type SchemeResult, type ActiveScheme } from "./schemes";
import { tickOwl, owlStrikeChance, owlStrikeSeverity } from "./owl";
import { currentPhase, type DayPhase } from "./time";

export interface TickResult {
  next: GameState;
  events: GameEvent[];
}

export type GameEvent =
  | { kind: "scheme_complete"; result: SchemeResult }
  | { kind: "owl_strike"; crowsLost: number };

export interface RunningScheme extends ActiveScheme {
  definition: import("./schemes").SchemeDefinition;
}

export function tick(
  state: GameState,
  running: ReadonlyArray<RunningScheme>,
  elapsedMs: number,
  rand: () => number = Math.random,
): TickResult {
  let next: GameState = { ...state };
  const events: GameEvent[] = [];

  const phase: DayPhase = currentPhase(state.world);

  // 1. Passive resource income — slightly better at dusk/night (the federation's hour)
  const baseRate = passiveRate(next.flock.total);
  const rateMul = phase === "day" ? 1 : phase === "dusk" || phase === "dawn" ? 1.15 : 1.3;
  const rate = { shinies: baseRate.shinies * rateMul, secrets: baseRate.secrets * rateMul };
  const seconds = elapsedMs / 1000;
  next = {
    ...next,
    resources: addResource(next.resources, "shinies", rate.shinies * seconds),
  };
  next = {
    ...next,
    resources: addResource(next.resources, "secrets", rate.secrets * seconds),
  };

  // 2. Owl ire decay — faster by day, slower at night
  next = { ...next, owl: tickOwl(next.owl, elapsedMs, phase) };

  // 3. Owl auto-strike — more likely at night when he's awake
  if (!next.owl.defeated) {
    const strikeChance = owlStrikeChance(next.owl, phase);
    if (strikeChance > 0 && rand() < strikeChance) {
      const severity = owlStrikeSeverity(next.owl);
      if (severity > 0) {
        events.push({ kind: "owl_strike", crowsLost: severity });
      }
    }
  }

  // 4. Resolve completed schemes — use the phase *at the moment of resolution*
  const stillRunning: RunningScheme[] = [];
  for (const active of running) {
    if (Date.now() >= active.completesAt) {
      const def = schemeDefs[active.id];
      const result = resolveScheme(def, active, phase, rand);
      events.push({ kind: "scheme_complete", result });
      next = {
        ...next,
        schemesCompleted: next.schemesCompleted + 1,
      };
      if (result.success) {
        next = {
          ...next,
          resources: addResource(next.resources, "shinies", result.reward.shinies),
        };
        next = {
          ...next,
          resources: addResource(next.resources, "secrets", result.reward.secrets),
        };
      }
    } else {
      stillRunning.push(active);
    }
  }

  next = { ...next, lastTickAt: Date.now() };

  return { next, events };
}