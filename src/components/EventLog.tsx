"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

export function EventLog() {
  const events = useGame((s) => s.events);
  const [feed, setFeed] = useState<string[]>([]);

  useEffect(() => {
    if (events.length === 0) return;
    for (const ev of events) {
      const line = formatEvent(ev);
      if (line) setFeed((prev) => [line, ...prev].slice(0, 8));
    }
    useGame.getState().clearEvents();
  }, [events]);

  return (
    <section className="rounded-lg border border-crow-ash bg-crow-feather/40 p-5">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl text-crow-bone">Chronicle</h2>
      </header>
      <ul className="space-y-1 text-sm text-crow-boneDim">
        {feed.length === 0 ? (
          <li className="italic">No news. The wind is quiet.</li>
        ) : (
          feed.map((line, i) => (
            <li key={i} className="border-l-2 border-crow-ash pl-3 leading-tight">
              {line}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function formatEvent(ev: { kind: string } & Record<string, unknown>): string | null {
  if (ev.kind === "scheme_complete") {
    const result = ev.result as { success: boolean; reward: { shinies: number; secrets: number }; crowsLost: number; scheme: string };
    if (result.success) {
      return `✓ Scheme succeeded — +${result.reward.shinies} ✦, +${result.reward.secrets} ☽`;
    }
    return `✗ Scheme failed — ${result.crowsLost} crow${result.crowsLost === 1 ? "" : "s"} lost`;
  }
  if (ev.kind === "owl_strike") {
    const lost = ev.crowsLost as number;
    return `⚠ The Owl struck — ${lost} crow${lost === 1 ? "" : "s"} carried off`;
  }
  return null;
}