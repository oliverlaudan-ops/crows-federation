/**
 * Game tick — the heartbeat that turns time into progress.
 *
 * Runs in the browser via the React effect in the root page. Each tick:
 *   - Adds passive resources (per crow)
 *   - Decays owl ire (faster by day, slower at night)
 *   - Possibly auto-strikes the owl at night
 *   - Resolves completed schemes, gating on world phase
 *   - Bumps belfry corruption on successful belfry runs
 *   - Defeats the owl on a successful Confront scheme
 */

import type { GameState } from "./save";
import { add as addResource, passiveRate } from "./resources";
import { schemes as schemeDefs, resolve as resolveScheme, type SchemeResult, type ActiveScheme } from "./schemes";
import { tickOwl, owlStrikeChance, owlStrikeSeverity, defeatOwl } from "./owl";
import { currentPhase, type DayPhase } from "./time";

export interface TickResult {
  next: GameState;
  events: GameEvent[];
}

export type GameEvent =
  | { kind: "scheme_complete"; result: SchemeResult }
  | { kind: "owl_strike"; crowsLost: number }
  | { kind: "owl_slain" }
  | { kind: "belfry_corrupted"; level: number };

export interface RunningScheme extends ActiveScheme {
  definition: import("./schemes").SchemeDefinition;
}

const MAX_BELFRY_CORRUPTION = 3;

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
  const rateMul =
    phase === "day"
      ? 1
      : phase === "dusk" || phase === "dawn"
        ? 1.15
        : 1.3;
  // Apply permanent prestige bonus on top
  const rate = {
    shinies: baseRate.shinies * rateMul * next.prestigeBonus,
    secrets: baseRate.secrets * rateMul * next.prestigeBonus,
  };
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

  // 4. Resolve completed schemes
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
        // Build belfry corruption on successful haunt
        if (def.buildsBelfryCorruption && next.belfryCorruption < MAX_BELFRY_CORRUPTION) {
          const newLevel = next.belfryCorruption + 1;
          next = { ...next, belfryCorruption: newLevel };
          events.push({ kind: "belfry_corrupted", level: newLevel });
        }
        // Defeat the owl on a successful Confront
        if (def.isEndgame) {
          next = {
            ...next,
            owl: defeatOwl(next.owl),
            owlSlainCount: next.owlSlainCount + 1,
          };
          events.push({ kind: "owl_slain" });
        }
      } else if (def.isEndgame) {
        // Failed Confront resets corruption — the federation was driven out
        next = { ...next, belfryCorruption: 0 };
      }
    } else {
      stillRunning.push(active);
    }
  }

  next = { ...next, lastTickAt: Date.now() };

  return { next, events };
}