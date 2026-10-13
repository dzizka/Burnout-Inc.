# Burnout Inc.: Disrupt or Die

Satirický 2D (3/4 top-down) korporátny tycoon v pixel arte. Vediete malý startup v suteréne,
ktorý musí prežiť proti bezohľadnému monopolu – vlastnými produktmi, ale hlavne nečistou hrou.
_The Office_ stretáva _Two Point Hospital_ a _RimWorld_.

- **Platformy:** webový prehliadač (PC aj mobil), neskôr Android APK cez Capacitor
- **Jazyky:** slovenčina (primárne), angličtina
- **Dizajn:** [docs/GDD.md](docs/GDD.md) · otvorené otázky: [docs/DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) · plán: [docs/ROADMAP.md](docs/ROADMAP.md)

## Spustenie

Potrebuješ Node.js 20.19+ (odporúčané 22).

```bash
npm install
npm run dev      # vývojový server s hot reloadom (http://localhost:5173)
npm test         # unit testy simulácie (Vitest)
npm run check    # lint + formát + testy + build (to isté ako CI)
npm run build    # produkčný build do dist/
npm run sim      # balansová simulácia kancelárie bez prehliadača
```

Na mobile v rovnakej sieti: `npm run dev -- --host` a otvor zobrazenú IP adresu.

## Ovládanie (zatiaľ)

| Akcia                 | PC              | Mobil          |
| --------------------- | --------------- | -------------- |
| Pauza / pokračovať    | `Space`         | tlačidlo ❚❚    |
| Rýchlosť 1x / 2x / 3x | `1` / `2` / `3` | tlačidlá ▶     |
| Prepnúť jazyk         | tlačidlo SK/EN  | tlačidlo SK/EN |

## Technológie

Čistý JavaScript (ES moduly) + HTML5 Canvas 2D, bez herného enginu. Build a dev server: Vite.
Dôvody a štruktúra kódu sú v [CLAUDE.md](CLAUDE.md).
