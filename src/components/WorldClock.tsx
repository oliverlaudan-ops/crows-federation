"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import {
  currentPhase,
  cycleProgress,
  msUntilNextPhase,
  PHASE_LABELS,
  PHASE_TINT,
  type DayPhase,
} from "@/lib/game/time";
import { formatDuration } from "@/lib/format";

/**
 * A live world clock in the resource bar — shows the current day phase,
 * a circular progress indicator, and how long until the next phase.
 */
export function WorldClock() {
  // Re-render every 5s — phases are 60s long, so this is plenty.
  const [, setTick] = useState(0);
  useEffect(() => {
    const handle = window.setInterval(() => setTick((n) => n + 1), 5000);
    return () => window.clearInterval(handle);
  }, []);

  const world = useGame((s) => s.state.world);
  const phase: DayPhase = currentPhase(world);
  const progress = cycleProgress(world);
  const remaining = msUntilNextPhase(world);
  const tint = PHASE_TINT[phase];

  return (
    <div className="flex items-center gap-2" title="Time of day">
      <PhaseIcon phase={phase} />
      <div className="flex flex-col leading-tight">
        <span className={`text-[10px] uppercase tracking-[0.25em] text-crow-boneDim`}>
          {PHASE_LABELS[phase]}
        </span>
        <span className={`text-sm font-semibold ${tint}`}>
          {formatDuration(remaining)} to {nextPhaseLabel(phase)}
        </span>
      </div>
      <svg width="22" height="22" viewBox="0 0 22 22" className="ml-1">
        <circle
          cx="11"
          cy="11"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="2"
        />
        <circle
          cx="11"
          cy="11"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={`${progress * 56.5} 56.5`}
          transform="rotate(-90 11 11)"
          className={tint}
        />
      </svg>
    </div>
  );
}

function nextPhaseLabel(phase: DayPhase): string {
  switch (phase) {
    case "day": return "dusk";
    case "dusk": return "night";
    case "night": return "dawn";
    case "dawn": return "day";
  }
}

function PhaseIcon({ phase }: { phase: DayPhase }) {
  if (phase === "day") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" className="text-crow-owl">
        <circle cx="10" cy="10" r="4" fill="currentColor" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="10"
            y1="2"
            x2="10"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${deg} 10 10)`}
          />
        ))}
      </svg>
    );
  }
  if (phase === "night") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" className="text-crow-crowblue">
        <path
          d="M16 11.5A6 6 0 0 1 8.5 4 7 7 0 1 0 16 11.5z"
          fill="currentColor"
        />
      </svg>
    );
  }
  // dusk / dawn — a horizon
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className={phase === "dusk" ? "text-crow-rust" : "text-crow-bone"}>
      <circle cx="10" cy="13" r="5" fill="currentColor" />
      <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}