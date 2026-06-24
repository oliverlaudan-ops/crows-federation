"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { currentPhase, type DayPhase } from "@/lib/game/time";

/**
 * Background tint that shifts with the day phase. Subtle — the world is
 * still mostly black, but a soft radial gradient at the top changes colour
 * to convey time of day.
 */
export function WorldBackground() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const handle = window.setInterval(() => setTick((n) => n + 1), 10_000);
    return () => window.clearInterval(handle);
  }, []);

  const world = useGame((s) => s.state.world);
  const phase: DayPhase = currentPhase(world);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-colors duration-[3000ms]"
      style={{
        background: backgroundForPhase(phase),
      }}
    />
  );
}

function backgroundForPhase(phase: DayPhase): string {
  // radial-gradient at the top, plus a subtle base tone
  switch (phase) {
    case "day":
      return "radial-gradient(ellipse at 50% -10%, rgba(201, 169, 97, 0.10) 0%, transparent 55%), #0a0a0d";
    case "dusk":
      return "radial-gradient(ellipse at 50% -10%, rgba(122, 62, 29, 0.18) 0%, transparent 55%), #0a0a0d";
    case "night":
      return "radial-gradient(ellipse at 50% -10%, rgba(59, 110, 143, 0.18) 0%, transparent 55%), #050509";
    case "dawn":
      return "radial-gradient(ellipse at 50% -10%, rgba(232, 225, 208, 0.10) 0%, transparent 55%), #0a0a0d";
  }
}