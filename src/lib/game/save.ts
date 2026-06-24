/**
 * Save / load — pure localStorage for v0.1.
 *
 * The whole game state is a single JSON blob. Versioned so future
 * migrations can run cleanly.
 */

import type { ResourceState } from "./resources";
import type { FlockState } from "./crows";
import type { OwlState } from "./owl";
import { initialResources } from "./resources";
import { initialFlock } from "./crows";
import { initialOwl } from "./owl";

export const SAVE_KEY = "crows-federation:v1";
export const SAVE_VERSION = 1;

export interface GameState {
  version: number;
  resources: ResourceState;
  flock: FlockState;
  owl: OwlState;
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

export function load(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== SAVE_VERSION) {
      console.info("[crows-federation] save version mismatch, starting fresh");
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn("[crows-federation] load failed", err);
    return null;
  }
}

export function reset(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_KEY);
}