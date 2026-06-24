"use client";

import { useGame } from "@/lib/store";
import { formatDuration } from "@/lib/format";
import { schemes as schemeDefs, type SchemeId } from "@/lib/game/schemes";
import { currentPhase, PHASE_LABELS, type DayPhase } from "@/lib/game/time";

export function SchemesPanel() {
  const state = useGame((s) => s.state);
  const running = useGame((s) => s.running);
  const startScheme = useGame((s) => s.startScheme);

  const entries = (Object.values(schemeDefs) as Array<typeof schemeDefs[SchemeId]>).filter((s) => {
    // Unlocked if in unlockedSchemes, OR if it's the endgame scheme and
    // the player has built enough belfry corruption to attempt it.
    if (state.unlockedSchemes.includes(s.id)) return true;
    if (s.isEndgame) return state.belfryCorruption >= 3;
    return false;
  });

  // We re-derive the phase from the world clock — same source of truth.
  // (Reading it on every render keeps the cards in sync with the WorldClock.)
  const phase: DayPhase = currentPhase(state.world);

  return (
    <section className="rounded-lg border border-crow-ash bg-crow-feather/40 p-5">
      <header className="mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl text-crow-bone">Schemes</h2>
        <span className="text-xs uppercase tracking-widest text-crow-boneDim">
          {running.length} underway · {PHASE_LABELS[phase]}
        </span>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((def) => {
          const active = running.find((r) => r.id === def.id);
          const remaining = active ? active.completesAt - Date.now() : null;
          const canAfford = state.resources.shinies >= 5;
          const phaseOk = def.activePhases.includes(phase);
          const corruptionOk = !def.isEndgame || state.belfryCorruption >= 3;
          const owlAlive = !def.isEndgame || !state.owl.defeated;
          return (
            <SchemeCard
              key={def.id}
              name={def.name}
              description={def.description}
              chance={def.baseSuccessChance}
              duration={def.baseDurationMs}
              rewardShiny={`${def.reward.shinies[0]}–${def.reward.shinies[1]}`}
              rewardSecret={`${def.reward.secrets[0]}–${def.reward.secrets[1]}`}
              remaining={remaining}
              phaseOk={phaseOk}
              activePhases={def.activePhases}
              phase={phase}
              canAfford={canAfford}
              corruptionOk={corruptionOk}
              belfryCorruption={state.belfryCorruption}
              owlAlive={owlAlive}
              isEndgame={Boolean(def.isEndgame)}
              onStart={() => startScheme(def.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

interface SchemeCardProps {
  name: string;
  description: string;
  chance: number;
  duration: number;
  rewardShiny: string;
  rewardSecret: string;
  remaining: number | null;
  phaseOk: boolean;
  activePhases: DayPhase[];
  phase: DayPhase;
  canAfford: boolean;
  corruptionOk: boolean;
  belfryCorruption: number;
  owlAlive: boolean;
  isEndgame: boolean;
  onStart: () => void;
}

function SchemeCard({
  name,
  description,
  chance,
  duration,
  rewardShiny,
  rewardSecret,
  remaining,
  phaseOk,
  activePhases,
  phase,
  canAfford,
  corruptionOk,
  belfryCorruption,
  owlAlive,
  isEndgame,
  onStart,
}: SchemeCardProps) {
  const isRunning = remaining !== null;
  const disabled = isRunning || !phaseOk || !canAfford || !corruptionOk || !owlAlive;

  const phaseHint = phaseOk
    ? null
    : `Only at ${activePhases.map((p) => p.toLowerCase()).join(" / ")} — current hour: ${phase}`;

  const corruptionHint =
    isEndgame && !corruptionOk
      ? `Requires belfry corruption 3/3 — currently ${belfryCorruption}/3`
      : null;

  const owlDeadHint = isEndgame && !owlAlive ? "The owl is already slain." : null;

  const borderAccent = isEndgame
    ? "border-crow-owl/40 hover:border-crow-owl"
    : phaseOk
      ? "border-crow-ash hover:border-crow-crowblue/60"
      : "border-crow-ash/40";
  const bgAccent = isEndgame
    ? "bg-crow-ink/70"
    : phaseOk
      ? "bg-crow-ink/50"
      : "bg-crow-ink/20 opacity-60";

  return (
    <article
      className={`flex flex-col gap-2 rounded border p-4 transition ${borderAccent} ${bgAccent}`}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-lg leading-snug text-crow-bone">{name}</h3>
        {isEndgame ? (
          <span className="shrink-0 rounded border border-crow-owl/60 bg-crow-owl/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-crow-owl">
            Endgame
          </span>
        ) : null}
        {isRunning ? (
          <span className="shrink-0 rounded bg-crow-crowblue/20 px-2 py-0.5 text-xs text-crow-crowblue">
            {formatDuration(remaining ?? 0)}
          </span>
        ) : null}
      </header>
      <p className="text-sm italic text-crow-boneDim">{description}</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-crow-boneDim">
        <dt>Chance</dt>
        <dd className="text-crow-bone">{Math.round(chance * 100)}%</dd>
        <dt>Duration</dt>
        <dd className="text-crow-bone">{formatDuration(duration)}</dd>
        <dt>Reward</dt>
        <dd className="text-crow-owl">
          {rewardShiny} ✦ &nbsp; {rewardSecret} ☽
        </dd>
      </dl>
      {phaseHint ? (
        <p className="text-[11px] italic text-crow-owl/80">{phaseHint}</p>
      ) : null}
      {corruptionHint ? (
        <p className="text-[11px] italic text-crow-blood/90">{corruptionHint}</p>
      ) : null}
      {owlDeadHint ? (
        <p className="text-[11px] italic text-crow-boneDim">{owlDeadHint}</p>
      ) : null}
      <button
        type="button"
        onClick={onStart}
        disabled={disabled}
        className="mt-2 rounded border border-crow-rust/60 bg-crow-rust/10 px-3 py-1.5 text-sm text-crow-bone transition hover:bg-crow-rust/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-crow-rust/10"
      >
        {isRunning
          ? "Underway"
          : !owlAlive
            ? "Owl is slain"
            : !corruptionOk
              ? "Belfry not yet ours"
              : !phaseOk
                ? "Wrong hour"
                : !canAfford
                  ? "Need 5 ✦"
                  : "Dispatch"}
      </button>
    </article>
  );
}