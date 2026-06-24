/**
 * Resources — the two currencies of the federation.
 *
 * Shinies:  tangible baubles (buttons, coins, glass shards) — boost scheme success.
 * Secrets: intangible lore fragments whispered by dead poets — unlock new schemes.
 */

export type Resource = "shinies" | "secrets";

export interface ResourceState {
  shinies: number;
  secrets: number;
  /** Lifetime totals for statistics & ascension */
  lifetime: {
    shinies: number;
    secrets: number;
  };
}

export const initialResources: ResourceState = {
  shinies: 0,
  secrets: 0,
  lifetime: { shinies: 0, secrets: 0 },
};

/**
 * Per-tick rate from the federation (passive income).
 * Crow count scales both via {@link lib/game/crows}.
 */
export function passiveRate(crows: number): { shinies: number; secrets: number } {
  return {
    shinies: crows * 0.5,
    secrets: crows * 0.05,
  };
}

export function add(state: ResourceState, kind: Resource, amount: number): ResourceState {
  if (amount <= 0) return state;
  const lifetimeKey = `lifetime.${kind}` as const;
  return {
    ...state,
    [kind]: state[kind] + amount,
    lifetime: {
      ...state.lifetime,
      [kind]: state.lifetime[kind] + amount,
    },
  };
}

export function spend(state: ResourceState, kind: Resource, amount: number): ResourceState | null {
  if (state[kind] < amount) return null;
  return {
    ...state,
    [kind]: state[kind] - amount,
  };
}