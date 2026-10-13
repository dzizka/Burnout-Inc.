# Assety a licencie

Každý asset v repozitári musí byť zapísaný tu, s licenciou a zdrojom.
**Pred commitom over licenciu na stránke autora** – najmä či dovoľuje redistribúciu
súborov vo verejnom repozitári a komerčné použitie.

## Aktuálne v hre

| Asset                                       | Zdroj                                    | Licencia | Poznámka |
| ------------------------------------------- | ---------------------------------------- | -------- | -------- |
| Placeholder tileset (podlaha, stena, dvere) | kreslené kódom v `src/render/tileset.js` | vlastné  | dočasné  |

## Kandidáti (GDD 2.4)

| Balík                                              | Zdroj     | Licencia (overiť!)                             | Použitie                                   |
| -------------------------------------------------- | --------- | ---------------------------------------------- | ------------------------------------------ |
| Kenney – Roguelike Modern City, 1-Bit Pack, Emotes | kenney.nl | CC0 – bez obmedzení                            | bezpečná voľba na štart, ikony nad hlavami |
| LimeZu – Modern Interiors (free verzia)            | itch.io   | vlastná licencia autora, free verzia obmedzená | najlepšie sedí štýlom (kancelária 16×16)   |
| Pipoya – Free RPG Character Sprites 16×16          | itch.io   | vlastná licencia autora                        | postavy so 4-smernou chôdzou               |

### Postup pri pridávaní

1. Stiahni balík, prečítaj licenciu, zapíš ju sem (aj s odkazom a dátumom).
2. Ak licencia nedovoľuje redistribúciu surových súborov, assety necommituj do verejného
   repa – buď repo nastav ako súkromné, alebo použi CC0 alternatívu.
3. Spritesheet daj do `public/assets/<balík>/`, mapovanie snímok do `src/render/`.
4. Pri mixovaní balíkov drž jednotnú paletu a veľkosť 16×16, inak bude scéna pôsobiť nesúrodo.
