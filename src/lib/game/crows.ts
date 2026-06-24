/**
 * Crows — the federation's population.
 *
 * More crows = more shinies and secrets gathered passively.
 * Crows die in failed schemes (and against the owl). Grow slowly.
 */

export interface FlockState {
  total: number;       // Living crows
  lifetime: number;   // All crows that have ever existed
  lost: number;       // Total crows that have fallen
}

export const initialFlock: FlockState = {
  total: 1,     // You start as a single lone crow
  lifetime: 1,
  lost: 0,
};

export function recruit(state: FlockState, shinies: number): { flock: FlockState; spent: number } {
  // 10 shinies = 1 new crow, rounded down
  const recruitCount = Math.floor(shinies / 10);
  if (recruitCount === 0) return { flock: state, spent: 0 };
  return {
    flock: {
      total: state.total + recruitCount,
      lifetime: state.lifetime + recruitCount,
      lost: state.lost,
    },
    spent: recruitCount * 10,
  };
}

export function fall(state: FlockState, count: number): FlockState {
  const lost = Math.min(count, state.total);
  return {
    total: state.total - lost,
    lifetime: state.lifetime,
    lost: state.lost + lost,
  };
}

export function revivalCost(fallen: number): number {
  // 50 shinies per lost crow, capped at current flock lost count
  return fallen * 50;
}