# Návrhové rozhodnutia a otvorené otázky

Nezrovnalosti nájdené v GDD a ich riešenie. Stav: **otvorené** = čaká na rozhodnutie,
**rozhodnuté** = platí a je zapracované v kóde.

| #   | Téma                      | Stav       |
| --- | ------------------------- | ---------- |
| D1  | Názov hry                 | rozhodnuté |
| D2  | Technológia               | rozhodnuté |
| D3  | Jazyky                    | rozhodnuté |
| D4  | Prah Hostile Takeover     | otvorené   |
| D5  | Frekvencia výplat         | otvorené   |
| D6  | Mierka herného času       | otvorené   |
| D7  | Rýchlosti úbytku potrieb  | otvorené   |
| D8  | Sila DRAMA_QUEEN AoE      | otvorené   |
| D9  | Pravdepodobnosti pranku   | otvorené   |
| D10 | Chýbajúce objekty potrieb | otvorené   |
| D11 | Vzorec skóre a tikety     | otvorené   |
| D12 | Bankrot a debet           | otvorené   |
| D13 | Úrok z úveru              | otvorené   |

## D1 – Názov hry · rozhodnuté

**Burnout Inc.: Disrupt or Die** (pôvodný pracovný názov „Underdog Inc.“ sa nepoužíva).

## D2 – Technológia · rozhodnuté

Vanilla JavaScript + Canvas 2D + Vite, bez herného enginu, UI v DOM. Zdôvodnenie v `CLAUDE.md`.
Android cez Capacitor neskôr (Vite `dist/` sa dá zabaliť priamo).

## D3 – Jazyky · rozhodnuté

Slovenčina primárne, angličtina ako druhá mutácia od prvého dňa (`src/i18n/`).
Predvolený jazyk: uložená voľba → jazyk prehliadača (sk/cs → SK) → EN.

## D4 – Prah Hostile Takeover

GDD 3.3D hovorí o odomknutí pri podiele rivala **< 10 %**, GDD 7.4 o **< 15 %**. Zároveň 2. hviezda (1.4) vyžaduje rivala < 15 %, takže by 2. hviezda a takeover nastali naraz.
**Návrh:** 2. hviezda < 15 %, takeover < 10 %.

## D5 – Frekvencia výplat

Mzdy a nájom: denne (9.3, kód 9.6) vs. každých 5 dní (3.3C) vs. mesačná uzávierka (3.1).
**Návrh:** náklady sa _účtujú_ denne (plynulý cashflow v grafe), mzdy sa _vyplácajú_ pri
mesačnej uzávierke (dramatický moment „máme na výplaty?“). Alternatíva: všetko denne.

## D6 – Mierka herného času

„1 herná sekunda = 1 reálna sekunda“, no 8-hodinový deň trvá 45 s. **Návrh:** rýchlosti
v GDD (napr. -0.2/s) sú v _reálnych sekundách pri 1x_; hodiny v HUD sú len kozmetické
(1 herná hodina ≈ 5,6 s). Takto je to implementované v `sim/clock.js`.

## D7 – Rýchlosti úbytku potrieb

Hygiena: -0.15/s (tabuľka 4.1) vs. -0.08/s (kód 4.4). Úbytok Morálky (-0.05/s pri dlho nízkych
potrebách) v kóde chýba. Pri -0.2/s Energia klesne zo 100 na 25 za ~6 minút (~8 dní) –
treba overiť, či je to žiadané tempo. **Návrh:** začať hodnotami z tabuľky a ladiť cez
headless simuláciu.

## D8 – Sila DRAMA_QUEEN AoE

Tabuľka 4.2: jednorazovo -30 % Pokoj / -15 % Morálka v okruhu 4 dlaždíc. Kód 4.4: `-25 * dt`
každú sekundu počas 8 s = až -200 → reťazový kolaps celej kancelárie.
**Návrh:** jednorazový zásah podľa tabuľky (prípadne rozložený na trvanie, ale so súčtom -30).

## D9 – Pravdepodobnosti pranku

Všeobecné pravidlo 70/30 (4.3), diagram 60/40, kód 60/30/10. **Návrh:** 60 % bežný /
30 % vyliata káva / 10 % obeť vybuchne (podľa kódu); všeobecné pravidlo 70/30 brať ako orientačné.

## D10 – Chýbajúce objekty potrieb

SMOKE_BREAK vyžaduje balkón/okno, no Tier 1 (suterén) nemá okná. Všeobecne: čo robí
zamestnanec, ak objekt na doplnenie potreby neexistuje? **Návrh:** fallback – pomalé
dopĺňanie pri stole + výrazne rýchlejší pád Morálky a ikona nad hlavou, ktorá hráčovi
povie, čo chýba. Pre suterén: „fajčiarsky kút pri vchode“ ako lacný objekt.

## D11 – Vzorec skóre a tikety

`tikety = bugy × 20` a skóre `… - tikety × 0.1` → 10 bugov = -20 bodov zo škály 0–10.
Zmeškaný hovor: +0.2 % škandálu (6.2) vs. `0.1 * dt` (kód 6.6).
**Návrh:** skóre orezať na 0–10 a tikety v ňom škálovať (napr. `min(3, tikety / 50)`).

## D12 – Bankrot a debet

Diagram 9.5: pri -2 000 € začne 3-dňový odpočet. Kód 9.6: pri < -2 000 € okamžitý bankrot.
**Návrh:** pod 0 € začne 3-dňový odpočet; pod -2 000 € sa nedá nič kupovať (tvrdý limit
pre nákupy), bankrot až po vypršaní odpočtu.

## D13 – Úrok z úveru

Bankový úver 5 000 € s **5 % denným** úrokom (9.2) = 25 % za herný mesiac (5 dní).
Je to zámer (úver ako zúfalé riešenie), alebo preklep (5 % mesačne)?

## Ďalšie drobnosti

- Kampaň 5 (Zbrojárstvo) chýba v Tech Matrixe (6.3).
- V kapitole 10 chýbajú podkapitoly 10.1 a 10.2.
- `Infiltrator` má „dediť z Employee“ (7.5), no ukážka kódu nededí – pri implementácii
  vytvoriť spoločnú triedu `Agent` (pohyb, pathfinding) pre zamestnancov aj votrelcov.
