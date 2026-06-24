"use client";

import { useGame } from "@/lib/store";
import { formatNumber } from "@/lib/format";
import { WorldClock } from "./WorldClock";

export function ResourceBar() {
  const shinies = useGame((s) => Math.floor(s.state.resources.shinies));
  const secrets = useGame((s) => Math.floor(s.state.resources.secrets));
  const crows = useGame((s) => s.state.flock.total);

  return (
    <div className="border-b border-crow-ash bg-crow-feather/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3 text-sm">
        <div className="flex items-center gap-4">
          <Stat label="Crows" value={crows} accent="text-crow-bone" />
          <Stat label="Shinies" value={shinies} accent="text-crow-owl" />
          <Stat label="Secrets" value={secrets} accent="text-crow-blood" />
        </div>
        <WorldClock />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex flex-col items-start leading-tight">
      <span className="text-[10px] uppercase tracking-[0.25em] text-crow-boneDim">{label}</span>
      <span className={`text-xl font-semibold tabular-nums ${accent}`}>
        {formatNumber(value)}
      </span>
    </div>
  );
}