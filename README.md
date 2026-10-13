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

## Ovládanie

| Akcia                  | PC                           | Mobil                       |
| ---------------------- | ---------------------------- | --------------------------- |
| Pauza / pokračovať     | `Space`                      | tlačidlo ❚❚                 |
| Rýchlosť 1x / 2x / 3x  | `1` / `2` / `3`              | tlačidlá ▶                  |
| Posun kamery           | ťahanie myšou / WASD / šípky | ťahanie prstom              |
| Zoom                   | koliesko / `+` `-`           | dva prsty (pinch)           |
| Stavať / predať        | Stavať → predmet → klik      | Stavať → predmet → ťuknutie |
| Karta zamestnanca      | klik na postavu              | ťuknutie na postavu         |
| Nábor                  | Personál → Najať             | Personál → Najať            |
| Vývoj produktu         | Projekty                     | Projekty                    |
| Financie, úver, PR     | klik na hotovosť             | ťuknutie na hotovosť        |
| Uložiť / nová hra      | ☰                           | ☰                          |
| Prepnúť jazyk          | SK/EN                        | SK/EN                       |
| Zrušiť režim / zavrieť | `Esc`                        | ×                           |
| Vývojárske menu        | `~` alebo Ctrl+Shift+D       | 3× ťuknúť na dátum          |

Hra sa ukladá automaticky každý herný týždeň a pri zatvorení stránky.

## Technológie

Čistý JavaScript (ES moduly) + HTML5 Canvas 2D, bez herného enginu. Build a dev server: Vite.
Dôvody a štruktúra kódu sú v [CLAUDE.md](CLAUDE.md).
