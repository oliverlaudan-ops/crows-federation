"use client";

import { useGame } from "@/lib/store";
import { useEffect, useState } from "react";

export function OwlPanel() {
  const owl = useGame((s) => s.state.owl);
  const ire = Math.round(owl.ire);
  const label =
    owl.phase === "distant"
      ? "Distant"
      : owl.phase === "watching"
        ? "Watching"
        : owl.phase === "striking"
          ? "Striking"
          : "Defeated";
  const color =
    owl.phase === "distant"
      ? "text-crow-boneDim"
      : owl.phase === "watching"
        ? "text-crow-owl"
        : owl.phase === "striking"
          ? "text-crow-blood"
          : "text-crow-crowblue";

  return (
    <section className="rounded-lg border border-crow-ash bg-crow-feather/40 p-5">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-2xl text-crow-bone">The Owl</h2>
        <span className={`text-xs uppercase tracking-widest ${color}`}>{label}</span>
      </header>
      <IreMeter value={ire} />
      <p className="mt-3 text-sm italic text-crow-boneDim">
        {owl.defeated
          ? "His feathers drift on the wind. The federation is safe. For now."
          : owl.phase === "distant"
            ? "He hunts elsewhere tonight. The bell-tower belfry is silent."
            : owl.phase === "watching"
              ? "His amber eyes follow your shadow. Each failed scheme tightens his grip."
              : "He is coming. The air above the chimney has gone still."}
      </p>
    </section>
  );
}

function IreMeter({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-crow-ash">
      <div
        className="h-full bg-gradient-to-r from-crow-rust to-crow-blood transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}