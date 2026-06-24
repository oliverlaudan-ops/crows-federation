"use client";

import { useGame } from "@/lib/store";
import { useEffect } from "react";

const TICK_MS = 500;

/**
 * Drives the passive game loop on the client.
 * Subscribes to the store directly via getState() to avoid React rerenders on every tick.
 */
export function GameHeartbeat() {
  const pulse = useGame((s) => s.pulse);

  useEffect(() => {
    const handle = window.setInterval(() => {
      pulse(TICK_MS);
    }, TICK_MS);
    return () => window.clearInterval(handle);
  }, [pulse]);

  return null;
}