"use client";

import { GameBoot } from "@/components/GameBoot";
import { ResourceBar } from "@/components/ResourceBar";
import { SchemesPanel } from "@/components/SchemesPanel";
import { OwlPanel } from "@/components/OwlPanel";
import { RecruitPanel } from "@/components/RecruitPanel";
import { EventLog } from "@/components/EventLog";
import { WorldBackground } from "@/components/WorldBackground";
import { VictoryModal } from "@/components/VictoryModal";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <WorldBackground />
      <GameBoot />

      <header className="relative z-10 border-b border-crow-ash">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-crow-boneDim">
            A gothic idle game
          </p>
          <h1 className="mt-2 text-5xl text-crow-bone md:text-6xl">
            The Crow Federation
          </h1>
          <p className="mt-3 max-w-xl text-sm italic text-crow-boneDim">
            You are the leader of a single murder. Gather shinies. Hatch schemes.
            Defy the Owl in his tower.
          </p>
        </div>
      </header>

      <div className="relative z-10">
        <ResourceBar />
      </div>

      <div className="relative z-10 mx-auto grid max-w-5xl gap-5 px-6 py-8 md:grid-cols-2">
        <SchemesPanel />
        <div className="space-y-5">
          <RecruitPanel />
          <OwlPanel />
          <EventLog />
        </div>
      </div>

      <footer className="relative z-10 border-t border-crow-ash">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-crow-boneDim">
          v0.3 — endgame + belfry corruption · <a
            href="https://github.com/oliverlaudan-ops/crows-federation"
            className="underline hover:text-crow-bone"
          >
            source
          </a>
        </div>
      </footer>
      <VictoryModal />
    </main>
  );
}