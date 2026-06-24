"use client";

import { useGame } from "@/lib/store";

export function RecruitPanel() {
  const crows = useGame((s) => s.state.flock.total);
  const shinies = useGame((s) => Math.floor(s.state.resources.shinies));
  const recruit = useGame((s) => s.recruitCrows);
  const canAfford = shinies >= 10;
  const nextCrow = Math.max(1, 10 - (shinies % 10));

  return (
    <section className="rounded-lg border border-crow-ash bg-crow-feather/40 p-5">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-2xl text-crow-bone">The Flock</h2>
        <span className="text-xs uppercase tracking-widest text-crow-boneDim">
          {crows} {crows === 1 ? "crow" : "crows"}
        </span>
      </header>
      <p className="mb-3 text-sm italic text-crow-boneDim">
        Recruit new crows from passing travelers. Each crow gathers shinies and whispers secrets.
      </p>
      <button
        type="button"
        onClick={recruit}
        disabled={!canAfford}
        className="w-full rounded border border-crow-crowblue/60 bg-crow-crowblue/10 px-3 py-2 text-sm text-crow-bone transition hover:bg-crow-crowblue/30 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {canAfford
          ? `Recruit ${Math.floor(shinies / 10)} new ${Math.floor(shinies / 10) === 1 ? "crow" : "crows"} (-${Math.floor(shinies / 10) * 10} ✦)`
          : `Need ${nextCrow} more ✦ for the next crow`}
      </button>
    </section>
  );
}