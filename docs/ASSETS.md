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

## Platené balíky (LimeZu) – nie sú v tomto repe

| Súbor (pri deployi) | Balík                                                               | Licencia                                                    | Použitie                    |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------- |
| `limezu/office.png` | [LimeZu – Modern Office](https://limezu.itch.io/modernoffice) 16×16 | použitie v hre áno, **šírenie nie**, uvedenie autora vítané | stôl s PC, kávovar, automat |
| `limezu/room.png`   | LimeZu – Room Builder Office 16×16 (súčasť Modern Office)           | dtto                                                        | tehlová stena, podlaha      |

Licencia (z `LICENSE.txt` v balíku): „YOU CAN edit and use the asset in any commercial or
non commercial project. YOU CAN'T resell or distribute the asset to others.“

Preto:

- `public/assets/limezu/` je v `.gitignore` – **nikdy ho necommituj**.
- Súbory sú v súkromnom repe `dzizka/burnout-inc-assets` (priečinok `limezu/`).
- Workflow `pages.yml` ich s tokenom `ASSETS_TOKEN` (fine-grained, Contents: Read na
  `burnout-inc-assets`) stiahne a pribalí do nasadenej hry – to je použitie v hre.
- Bez súborov (lokálne, CI, fork) hra použije Kenney grafiku a grafiku kreslenú kódom.
- Lokálne si ich môžeš nakopírovať do `public/assets/limezu/` (office.png =
  `Modern_Office_16x16.png`, room.png = `1_Room_Builder_Office/Room_Builder_Office_16x16.png`).
- Výrezy (pixelové súradnice) sú v `src/render/sprites.js` (`LIMEZU`) a `tileset.js`.
- V titulkoch hry uvedieme „Graphics: LimeZu, Kenney.nl“.

## Postup pri pridávaní

1. Stiahni balík, prečítaj licenciu, zapíš ju sem (aj s odkazom).
2. Do `public/assets/<autor>/` daj len potrebné spritesheety + licenčný súbor.
3. Mapovanie dlaždíc (čísla snímok) patrí do `src/render/`, rozmery do `SHEETS`
   v `src/render/assets.js`.
4. Drž jednotnú veľkosť 16×16 a podobnú paletu, inak bude scéna pôsobiť nesúrodo.
