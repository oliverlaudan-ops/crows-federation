/**
 * Schemes — the federation's covert operations.
 *
 * A scheme costs shinies to start, takes time to resolve, and yields rewards.
 * Secrets unlock new schemes. Shinies boost success chance.
 */

export type SchemeId =
  | "steal_pennies"      // From a blind man's cup
  | "raid_picnic"        // Picnic baskets in the meadow
  | "haunt_belfry"       // Drive the bats from the bell tower
  | "steal_owl_egg";     // RISKY — costs many shinies, may summon the owl

export interface SchemeDefinition {
  id: SchemeId;
  name: string;
  description: string;
  unlockCost: { secrets: number };
  /** Base duration in milliseconds before the scheme auto-resolves */
  baseDurationMs: number;
  /** Min & max reward on success */
  reward: { shinies: [number, number]; secrets: [number, number] };
  /** Failure penalty (crows lost) */
  failurePenalty: number;
  /** Base success chance, 0..1 — boosted by shinies invested beyond minimum */
  baseSuccessChance: number;
}

export const schemes: Record<SchemeId, SchemeDefinition> = {
  steal_pennies: {
    id: "steal_pennies",
    name: "Steal Pennies from the Blind Man",
    description: "A simple test of courage. His ears are sharp, but his eyes are dim.",
    unlockCost: { secrets: 0 },
    baseDurationMs: 8_000,
    reward: { shinies: [5, 15], secrets: [0, 1] },
    failurePenalty: 0,
    baseSuccessChance: 0.85,
  },
  raid_picnic: {
    id: "raid_picnic",
    name: "Raid the Sunday Picnic",
    description: "Pastries, cold meats, unguarded wine. Glory — and a swatting hand.",
    unlockCost: { secrets: 0 },
    baseDurationMs: 25_000,
    reward: { shinies: [40, 90], secrets: [1, 3] },
    failurePenalty: 1,
    baseSuccessChance: 0.65,
  },
  haunt_belfry: {
    id: "haunt_belfry",
    name: "Haunt the Old Belfry",
    description: "Drive the bats from the bell tower. Their squeaks betray us to the owl.",
    unlockCost: { secrets: 5 },
    baseDurationMs: 60_000,
    reward: { shinies: [120, 280], secrets: [3, 8] },
    failurePenalty: 2,
    baseSuccessChance: 0.55,
  },
  steal_owl_egg: {
    id: "steal_owl_egg",
    name: "Steal an Egg from the Owl",
    description:
      "An act of war. If discovered, the Owl himself may answer. But an egg — hatched in moonlight — would remake us.",
    unlockCost: { secrets: 25 },
    baseDurationMs: 180_000,
    reward: { shinies: [800, 1600], secrets: [15, 30] },
    failurePenalty: 5,
    baseSuccessChance: 0.35,
  },
};

export interface ActiveScheme {
  id: SchemeId;
  startedAt: number;     // ms timestamp
  completesAt: number;   // ms timestamp when it auto-resolves
  invested: number;      // Extra shinies invested beyond base cost — boosts chance
}

export interface SchemeResult {
  success: boolean;
  scheme: SchemeId;
  reward: { shinies: number; secrets: number };
  crowsLost: number;
}

const BASE_SCHEME_COST_SHINIES = 5;

export function schemeStartCost(scheme: SchemeDefinition, extraInvestment: number): number {
  return BASE_SCHEME_COST_SHINIES + extraInvestment;
}

/**
 * Boosted success chance from shinies invested.
 * Capped at 0.95 — never a certainty.
 */
export function adjustedChance(scheme: SchemeDefinition, extraInvestment: number): number {
  const boost = extraInvestment * 0.0025; // 2.5% per extra shiny
  return Math.min(0.95, scheme.baseSuccessChance + boost);
}

export function resolve(scheme: SchemeDefinition, active: ActiveScheme, rand: () => number): SchemeResult {
  const chance = adjustedChance(scheme, active.invested);
  const success = rand() < chance;
  if (success) {
    return {
      success: true,
      scheme: scheme.id,
      reward: {
        shinies: randInt(scheme.reward.shinies[0], scheme.reward.shinies[1], rand),
        secrets: randInt(scheme.reward.secrets[0], scheme.reward.secrets[1], rand),
      },
      crowsLost: 0,
    };
  }
  return {
    success: false,
    scheme: scheme.id,
    reward: { shinies: 0, secrets: 0 },
    crowsLost: scheme.failurePenalty,
  };
}

function randInt(min: number, max: number, rand: () => number): number {
  if (max <= min) return min;
  return Math.floor(rand() * (max - min + 1)) + min;
}