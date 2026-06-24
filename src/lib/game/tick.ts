/**
 * Game tick — the heartbeat that turns time into progress.
 *
 * Runs in the browser via the React effect in the root page. Each tick:
 *   - Adds passive resources (per crow)
 *   - Decays owl ire slowly
 *   - Checks for completed schemes
 */

import type { GameState } from "./save";
import { add as addResource, passiveRate } from "./resources";
import { schemes as schemeDefs, resolve as resolveScheme, type SchemeResult, type ActiveScheme } from "./schemes";
import { tickOwl, owlStrikeSeverity } from "./owl";

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

  // 1. Passive resource income
  const rate = passiveRate(next.flock.total);
  const seconds = elapsedMs / 1000;
  next = {
    ...next,
    resources: addResource(next.resources, "shinies", rate.shinies * seconds),
  };
  next = {
    ...next,
    resources: addResource(next.resources, "secrets", rate.secrets * seconds),
  };

  // 2. Owl ire decay
  next = { ...next, owl: tickOwl(next.owl, elapsedMs) };

  // 3. Owl auto-strike if ire is at max
  if (next.owl.phase === "striking" && !next.owl.defeated) {
    // Each tick the owl may carry off a crow. Heavy penalty — drives action.
    const severity = owlStrikeSeverity(next.owl);
    if (severity > 0 && rand() < 0.1) {
      events.push({ kind: "owl_strike", crowsLost: severity });
    }
  }

  // 4. Resolve completed schemes
  const stillRunning: RunningScheme[] = [];
  for (const active of running) {
    if (Date.now() >= active.completesAt) {
      const def = schemeDefs[active.id];
      const result = resolveScheme(def, active, rand);
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
      // Crows lost on failure handled by the event consumer
    } else {
      stillRunning.push(active);
    }
  }

  next = { ...next, lastTickAt: Date.now() };

  return { next, events };
}