# Roadmap

Prvý cieľ je **vertical slice kampane 1** (GDD kap. 10): jedna suterénna kancelária, pár
zamestnancov, jeden produkt a rozhodnutie Ship it / Polish. Až keď je táto slučka zábavná,
pokračujú poschodia, rival, Black Ops a meta-progres.

## M0 – Kostra projektu ✅

- Vite + vanilla JS, ESLint, Prettier, Vitest, CI, deploy na GitHub Pages
- Herná slučka s pevným krokom, rýchlosti pauza/1x/2x/3x
- Kalendár: deň 9 s, týždeň 45 s, mesiac 3 min, rok 36 min pri 1x (D6)
- Canvas s celočíselným škálovaním, placeholder suterén 12×10
- HUD (hotovosť, deň, trh, škandál), i18n SK/EN

## M1 – Mriežka & stavanie (GDD fáza 1)

- Kamera: posun (ťahanie / WASD), zoom (koliesko / pinch)
- Výber dlaždice myšou aj dotykom (Pointer Events)
- Objekty s rozmermi, kolíziou a `interactionTile`: stôl s PC, kávovar, toaleta
- Režim stavania: náhľad, umiestnenie, cena, predaj
- Y-sorting objektov (GDD 2.5)
- Dev Cheat Menu (GDD 10.3) – základ na ladenie

## M2 – Zamestnanci & AI (GDD fáza 2)

- A* pathfinding na mriežke
- Trieda zamestnanca so 6 potrebami (dáta v `src/data/`)
- FSM: WORKING → COFFEE_BREAK / TOILET / … → návrat k stolu
- DRAMA_QUEEN s AoE efektom, ikony nad hlavou
- Karta zamestnanca (inšpekcia)

## M3 – Produkt & Support (GDD fáza 3)

- Projekt „Garážová appka“, modré body vs. červené bugy
- Rozhodnutie Ship it / Polish, tržby s útlmom
- Tikety, zvoniaci stôl podpory, hluk

## M4 – Ekonomika & uloženie (GDD fáza 4)

- Mesačná uzávierka: mzdy (D5), nájom, splátky úverov (D13), bankrot s lehotou (D12)
- Škandál meter a jeho dôsledky
- Save/Load do localStorage (verziovaný formát)

## Neskôr

Eventové karty (Reigns-style), Chaos Engine, poschodia a výťahy, rival a trhový podiel,
Black Ops, sabotéri, Hostile Takeover, kampane 2–5, prestíž, zvuk, Capacitor APK.
