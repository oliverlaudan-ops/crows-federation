"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

/**
 * Victory modal that appears when the owl is slain.
 * Offers a "New Cycle" action which keeps the prestige bonus
 * (a small permanent multiplier on passive income).
 */
export function VictoryModal() {
  const owl = useGame((s) => s.state.owl);
  const slainCount = useGame((s) => s.state.owlSlainCount);
  const prestigeBonus = useGame((s) => s.state.prestigeBonus);
  const newCycle = useGame((s) => s.newCycle);
  const [dismissed, setDismissed] = useState(false);

  // Reset the "dismissed" flag when the owl dies again
  useEffect(() => {
    if (owl.defeated) {
      setDismissed(false);
    }
  }, [owl.defeated, slainCount]);

  if (!owl.defeated || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-w-lg rounded-lg border border-crow-owl/40 bg-crow-feather p-8 text-center shadow-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-crow-owl">
          A feather falls
        </p>
        <h2 className="mt-3 text-4xl text-crow-bone">The Owl is Slain</h2>
        <p className="mt-4 text-sm italic text-crow-boneDim">
          The bell tower is silent. The federation spreads across the rooftops,
          and crows from neighbouring parishes come to hear of it.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded border border-crow-ash bg-crow-ink/40 p-3">
            <dt className="text-[10px] uppercase tracking-widest text-crow-boneDim">
              Owls Slain
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-crow-bone">{slainCount}</dd>
          </div>
          <div className="rounded border border-crow-ash bg-crow-ink/40 p-3">
            <dt className="text-[10px] uppercase tracking-widest text-crow-boneDim">
              Passive Bonus
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-crow-crowblue">
              +{Math.round((prestigeBonus - 1) * 100)}%
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-crow-boneDim">
          Begin a new cycle: a new owl will rise, and the federation&apos;s deeds carry
          forward as a small permanent bonus.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded border border-crow-ash px-4 py-2 text-sm text-crow-boneDim transition hover:border-crow-boneDim hover:text-crow-bone"
          >
            Linger
          </button>
          <button
            type="button"
            onClick={newCycle}
            className="rounded border border-crow-crowblue/70 bg-crow-crowblue/20 px-4 py-2 text-sm text-crow-bone transition hover:bg-crow-crowblue/40"
          >
            Begin New Cycle
          </button>
        </div>
      </div>
    </div>
  );
}