# Assety a licencie

Každý asset v repozitári musí byť zapísaný tu, s licenciou a zdrojom.
**Repozitár je verejný** – necommitujeme nič, čo licencia nedovoľuje ďalej šíriť.

## V hre (`public/assets/`)

| Súbor               | Balík                                                                                   | Licencia | Použitie                                    |
| ------------------- | --------------------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| `kenney/urban.png`  | [Kenney – RPG Urban Pack 1.0](https://opengameart.org/content/rpg-urban-pack)           | CC0      | postavy (6 typov, 4 smery, chôdza), podlaha |
| `kenney/indoor.png` | [Kenney – Roguelike Indoor pack](https://opengameart.org/content/roguelike-indoor-pack) | CC0      | stôl, kuchynská linka pod kávovarom         |
| `kenney/emotes.png` | [Kenney – Emotes Pack](https://opengameart.org/content/emotes-pack) (pixel, štýl 1)     | CC0      | bubliny a ikony nad hlavami                 |

Licenčný text je v `public/assets/kenney/LICENSE.txt`. Uvedenie autora nie je povinné,
v titulkoch hry ho napriek tomu uvedieme („Graphics: Kenney.nl“).

### Kreslené kódom (zatiaľ)

Kenney nemá kancelárske predmety ani 3/4 tehlovú fasádu, preto sú v
`src/render/sprites.js` a `src/render/tileset.js` kreslené kódom v podobnej palete:
CRT monitor, kávovar, automat na snacky, toaleta, fajčiarsky kútik, steny, dvere,
emotikony káva/jedlo. Ak sa spritesheety nenačítajú, kódom sa nakreslí všetko.

## Platené balíky (LimeZu) – ako na to

[Modern Interiors](https://limezu.itch.io/moderninteriors) a
[Modern Office – Revamped](https://limezu.itch.io/modernoffice) majú licenciu, ktorá
podľa dostupných informácií povoľuje použitie v hre (aj komerčnej), ale **zakazuje
ďalšie šírenie súborov**. Vymazanie nepoužitých častí to nerieši – aj použité výrezy by
vo verejnom repe boli šírením.

Plán, ak sa balík kúpi:

1. Súbory pôjdu do **súkromného** repozitára (napr. `dzizka/burnout-inc-assets`).
2. Workflow pre GitHub Pages si ho pri builde stiahne (deploy token v secrets) a pribalí
   do hry. Hotová hra ich obsahuje – to licencia dovoľuje.
3. Verejné repo ostane bez nich; lokálne a v CI sa hra spustí s Kenney grafikou
   a grafikou kreslenou kódom.

Pred kúpou over licenčný súbor v stiahnutom balíku.

## Postup pri pridávaní

1. Stiahni balík, prečítaj licenciu, zapíš ju sem (aj s odkazom).
2. Do `public/assets/<autor>/` daj len potrebné spritesheety + licenčný súbor.
3. Mapovanie dlaždíc (čísla snímok) patrí do `src/render/`, rozmery do `SHEETS`
   v `src/render/assets.js`.
4. Drž jednotnú veľkosť 16×16 a podobnú paletu, inak bude scéna pôsobiť nesúrodo.
