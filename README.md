# The Crow Federation

> A gothic idle game about leading a federation of crows.
> Collect shinies, hatch schemes, topple the owl.

**Status:** v0.1 — singleplayer, browser-only, local save.

Live: <https://crows.future-pulse.de> (planned)

---

## Vision

You begin as a single crow. Recruit others, gather shinies, uncover secrets.
Run schemes — small thefts, picnics raided, belfries haunted. The deeper schemes
risk the Owl's attention. If he grows weary of your federation's audacity, he
will strike. Drive him from the tower and the federation is safe.

Mechanics in v0.1 are intentionally tiny. The loop is:

1. **Recruit** crows (10 shinies per recruit).
2. **Run** a scheme (costs 5 shinies, takes seconds-to-minutes, may cost crows on failure).
3. **Gather** passive shinies + secrets from your flock.
4. **Watch** the Owl's ire grow if you fail too boldly.
5. **Endgame:** defeat the Owl in the bell-tower, then ascend.

## Stack

- **Next.js 14** (App Router, RSC, standalone output)
- **TypeScript** (strict, `noUncheckedIndexedAccess`)
- **Tailwind CSS** (custom gothic palette)
- **Zustand** for client state
- **LocalStorage** for save
- **Docker** (multi-stage, ~150MB image) for deploy

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # strict TS check
npm run build        # production build
```

## Project layout

```
src/
├── app/             # Next.js App Router (layout, page, globals.css)
├── components/      # React UI (SchemesPanel, OwlPanel, ResourceBar, …)
└── lib/
    ├── game/        # Pure logic — no React, no DOM
    │   ├── resources.ts   # Shinies + secrets, passive income
    │   ├── crows.ts       # Flock growth + casualties
    │   ├── schemes.ts     # Scheme definitions + resolution
    │   ├── owl.ts         # The antagonist: phases, ire, strike
    │   ├── tick.ts        # Heartbeat — turns time into progress
    │   └── save.ts        # localStorage persist + version
    ├── store.ts     # Zustand store wrapping game state
    └── format.ts    # Number / duration helpers
```

The `lib/game/` layer is **pure TypeScript** — no React, no DOM. This keeps the
core loop testable and lets us port it to a Node worker or Web Worker later
without rewrites.

## Deploy

```bash
# On the VPS, alongside messenger and prompt-factory-v2:
cd /opt/crows-federation
docker compose up -d --build
```

Nginx config in `deploy/nginx-crows-future-pulse.conf` — drop into
`/etc/nginx/sites-available/` and symlink. Uses the shared `web` Docker network
already in use by the other future-pulse services.

SSL via the existing certbot setup:

```bash
sudo certbot --nginx -d crows.future-pulse.de
```

## Roadmap

### v0.1 (now)
- [x] Skeleton: Next.js + TS strict + Tailwind + Zustand
- [x] Core loop: shinies, secrets, flock, schemes, owl ire
- [x] 4 schemes: steal pennies, raid picnic, haunt belfry, steal owl egg
- [x] Owl phases: distant → watching → striking → defeated
- [x] Local save / load with version
- [x] Docker + nginx deploy artifacts

### v0.2
- [ ] More schemes (churchyard theft, scarecrows, fox patrols)
- [ ] Per-crow specializations (scout, thief, mystic)
- [ ] Day/night cycle affecting scheme outcomes
- [ ] Prestige / ascension reset

### v0.3
- [ ] Light lore fragments discovered via secrets
- [ ] Sound design (caws, wind, distant bell)
- [ ] Pixel-art / SVG crow portraits for the federation

### v1.0
- [ ] Multiplayer federations (real-time)
- [ ] PvP: raid other players' schemes
- [ ] Persistent cross-device save

## License

MIT © Oliver Laudan