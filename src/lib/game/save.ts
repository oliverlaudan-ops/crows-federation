/**
 * Save / load — pure localStorage for v0.3.
 *
 * The whole game state is a single JSON blob. Versioned so future
 * migrations can run cleanly. v3 adds belfry corruption.
 * v2 is migrated transparently — belfry corruption starts at 0.
 */

import type { ResourceState } from "./resources";
import type { FlockState } from "./crows";
import type { OwlState } from "./owl";
import type { WorldTime } from "./time";
import { initialResources } from "./resources";
import { initialFlock } from "./crows";
import { initialOwl } from "./owl";
import { initialWorldTime } from "./time";

export const SAVE_KEY = "crows-…n:v3";
export const SAVE_KEY_V2 = "crows-federation:v2";
export const SAVE_KEY_V1 = "crows-federation:v1";
export const SAVE_VERSION = 3;

export interface GameState {
  version: number;
  resources: ResourceState;
  flock: FlockState;
  owl: OwlState;
  world: WorldTime;
  /** How many times the belfry has been successfully haunted. 0..3. */
  belfryCorruption: number;
  /** Number of times the federation has slain the owl (across cycles) */
  owlSlainCount: number;
  /** Lifetime prestige multiplier — permanent +x% passive income */
  prestigeBonus: number;
  /** Timestamps for offline progress */
  lastSavedAt: number;
  lastTickAt: number;
  /** Schemes the player has unlocked */
  unlockedSchemes: string[];
  /** Total schemes completed (success or failure) */
  schemesCompleted: number;
  /** Total owl strikes survived */
  strikesSurvived: number;
}

export function initialState(): GameState {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    resources: initialResources,
    flock: initialFlock,
    owl: initialOwl,
    world: initialWorldTime,
    belfryCorruption: 0,
    owlSlainCount: 0,
    prestigeBonus: 1,
    lastSavedAt: now,
    lastTickAt: now,
    unlockedSchemes: ["steal_pennies", "raid_picnic"],
    schemesCompleted: 0,
    strikesSurvived: 0,
  };
}

export function save(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: GameState = { ...state, lastSavedAt: Date.now() };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn("[crows-federation] save failed", err);
  }
}

function migrateV2(parsed: Partial<GameState> & { version?: number }): GameState {
  return {
    ...initialState(),
    resources: parsed.resources ?? initialResources,
    flock: parsed.flock ?? initialFlock,
    owl: parsed.owl ?? initialOwl,
    world: parsed.world ?? initialWorldTime,
    unlockedSchemes: parsed.unlockedSchemes ?? ["steal_pennies", "raid_picnic"],
    schemesCompleted: parsed.schemesCompleted ?? 0,
    strikesSurvived: parsed.strikesSurvived ?? 0,
  };
}

function migrateV1(parsed: Partial<GameState> & { version?: number }): GameState {
  return {
    ...initialState(),
    resources: parsed.resources ?? initialResources,
    flock: parsed.flock ?? initialFlock,
    owl: parsed.owl ?? initialOwl,
    unlockedSchemes: parsed.unlockedSchemes ?? ["steal_pennies", "raid_picnic"],
    schemesCompleted: parsed.schemesCompleted ?? 0,
    strikesSurvived: parsed.strikesSurvived ?? 0,
  };
}

/**
 * Load a save, migrating from v1 or v2 if needed.
 * v1 → v3 and v2 → v3 both run, but only the matching one fires.
 */
export function load(): GameState | null {
  if (typeof window === "undefined") return null;
  // Try v3 first
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed.version === SAVE_VERSION) return parsed;
    }
  } catch (err) {
    console.warn("[crows-federation] v3 load failed", err);
  }
  // Migration: v2
  try {
    const raw = window.localStorage.getItem(SAVE_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState> & { version?: number };
      if (parsed.version === 2) {
        const migrated = migrateV2(parsed);
        save(migrated);
        window.localStorage.removeItem(SAVE_KEY_V2);
        return migrated;
      }
    }
  } catch (err) {
    console.warn("[crows-federation] v2 migration failed", err);
  }
  // Migration: v1
  try {
    const raw = window.localStorage.getItem(SAVE_KEY_V1);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState> & { version?: number };
      if (parsed.version === 1) {
        const migrated = migrateV1(parsed);
        save(migrated);
        window.localStorage.removeItem(SAVE_KEY_V1);
        return migrated;
      }
    }
  } catch (err) {
    console.warn("[crows-federation] v1 migration failed", err);
  }
  return null;
}

export function reset(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_KEY);
  window.localStorage.removeItem(SAVE_KEY_V2);
  window.localStorage.removeItem(SAVE_KEY_V1);
}