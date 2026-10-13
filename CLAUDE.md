# Burnout Inc. – poznámky pre vývoj

Satirický pixel-art tycoon. Zdroj pravdy pre dizajn je `docs/GDD.md`; odchýlky a rozhodnutia
sa zapisujú do `docs/DESIGN_DECISIONS.md`.

## Príkazy

- `npm run dev` – vývojový server
- `npm run check` – lint, prettier, testy a build; musí prejsť pred každým commitom
- `npm test` – Vitest (testy v `tests/`, bežia v Node bez prehliadača)

## Architektúra

```
src/
  core/    herná slučka (pevný krok), seedovaný RNG, event bus – bez DOM
  sim/     herná logika a stav (Game, kalendár, mriežka, neskôr zamestnanci, ekonomika) – bez DOM
  data/    balansové čísla a katalógy (ceny, rýchlosti úbytku potrieb…) – bez DOM
  i18n/    preklady sk.js / en.js a funkcia t()
  render/  Canvas renderer, tileset, kamera
  ui/      HTML/DOM overlay (HUD, okná, karty), vstupy, nastavenia
```

Pravidlá:

- **Simulácia je oddelená od zobrazenia.** `core/`, `sim/`, `data/`, `i18n/` nesmú siahať na
  `window`/`document`/`localStorage` a nesmú volať `Math.random()` (vynúti ESLint). Náhoda ide
  cez `game.rng` (`core/rng.js`), aby boli incidenty reprodukovateľné a testovateľné.
- **Pevný simulačný krok** (`TIME.TICKS_PER_SECOND`). Rýchlosť 2x/3x = viac krokov, nie dlhší krok.
- **Žiadne magické čísla v logike** – balans patrí do `src/data/`, s odkazom na kapitolu GDD.
- **Žiadne texty natvrdo.** Všetko, čo vidí hráč, ide cez `t('kľúč')`; kľúč pridaj do `sk.js`
  aj `en.js` (test kontroluje zhodu). V HTML použi `data-i18n` / `data-i18n-title`. Výnimka: vývojárske menu (`ui/devMenu.js`).
- **UI je DOM nad canvasom** (GDD 8.4); canvas kreslí len herný svet. Interaktívne prvky min. 44×44 px.
- Virtuálne rozlíšenie ~480×270, dlaždica 16 px, celočíselné škálovanie, `image-rendering: pixelated`.

## Prečo bez herného enginu

Hra potrebuje dlaždicovú mriežku, Y-sorting, A*, sprite animácie a DOM UI – to je pár stoviek
riadkov vlastného kódu. Phaser/LittleJS by pridali váhu a vlastné UI/scény, ktoré sa bijú
s DOM overlayom. Free assety (LimeZu, Kenney, Pipoya) sú bežné 16×16 spritesheety, ktoré sa
kreslia priamo cez `drawImage`; mapy si stavia hráč za behu, takže Tiled loader netreba.

## Assety

Pred pridaním akéhokoľvek assetu skontroluj licenciu a zapíš ho do `docs/ASSETS.md`.

## Jazyk

UI a texty v hre: slovenčina (primárne) + angličtina. Komentáre v kóde a dokumentácia po slovensky.
