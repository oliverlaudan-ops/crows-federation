/**
 * Save / load — pure localStorage for v0.2.
 *
 * The whole game state is a single JSON blob. Versioned so future
 * migrations can run cleanly. v2 introduces the world-time field; v1
 * saves are detected and migrated.
 */

import type { ResourceState } from "./resources";
import type { FlockState } from "./crows";
import type { OwlState } from "./owl";
import type { WorldTime } from "./time";
import { initialResources } from "./resources";
import { initialFlock } from "./crows";
import { initialOwl } from "./owl";
import { initialWorldTime } from "./time";

export const SAVE_KEY = "crows-federation:v2";
export const SAVE_KEY_V1 = "crows-federation:v1";
export const SAVE_VERSION = 2;

export interface GameState {
  version: number;
  resources: ResourceState;
  flock: FlockState;
  owl: OwlState;
  world: WorldTime;
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

/**
 * Load a save, migrating from v1 (no world-time) if found.
 * v1 keeps everything the player earned — only the missing world field
 * is filled in with the current state. Then it is promoted to v2.
 */
export function load(): GameState | null {
  if (typeof window === "undefined") return null;
  // Try v2 first
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed.version === SAVE_VERSION) return parsed;
    }
  } catch (err) {
    console.warn("[crows-federation] v2 load failed", err);
  }
  // Migration: v1
  try {
    const raw = window.localStorage.getItem(SAVE_KEY_V1);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState> & { version?: number };
    if (parsed.version !== 1) return null;
    const migrated: GameState = {
      ...initialState(),
      resources: parsed.resources ?? initialResources,
      flock: parsed.flock ?? initialFlock,
      owl: parsed.owl ?? initialOwl,
      unlockedSchemes: parsed.unlockedSchemes ?? ["steal_pennies", "raid_picnic"],
      schemesCompleted: parsed.schemesCompleted ?? 0,
      strikesSurvived: parsed.strikesSurvived ?? 0,
    };
    // Promote to v2 and remove the v1 key
    save(migrated);
    window.localStorage.removeItem(SAVE_KEY_V1);
    return migrated;
  } catch (err) {
    console.warn("[crows-federation] v1 migration failed", err);
    return null;
  }
}

export function reset(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_KEY);
  window.localStorage.removeItem(SAVE_KEY_V1);
}