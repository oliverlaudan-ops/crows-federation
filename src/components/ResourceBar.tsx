"use client";

import { useGame } from "@/lib/store";
import { formatNumber } from "@/lib/format";

export function ResourceBar() {
  const shinies = useGame((s) => Math.floor(s.state.resources.shinies));
  const secrets = useGame((s) => Math.floor(s.state.resources.secrets));
  const crows = useGame((s) => s.state.flock.total);

  return (
    <div className="border-b border-crow-ash bg-crow-feather/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-3 text-sm">
        <Stat label="Crows" value={crows} accent="text-crow-bone" />
        <Stat label="Shinies" value={shinies} accent="text-crow-owl" />
        <Stat label="Secrets" value={secrets} accent="text-crow-blood" />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-[10px] uppercase tracking-[0.25em] text-crow-boneDim">{label}</span>
      <span className={`text-xl font-semibold tabular-nums ${accent}`}>
        {formatNumber(value)}
      </span>
    </div>
  );
}