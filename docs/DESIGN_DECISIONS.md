# Návrhové rozhodnutia a otvorené otázky

Nezrovnalosti nájdené v GDD a ich riešenie. Stav: **otvorené** = čaká na rozhodnutie,
**rozhodnuté** = platí a implementuje sa v príslušnom míľniku, **ladí sa** = čísla sa upravia podľa playtestu.

| #   | Téma                      | Stav                 |
| --- | ------------------------- | -------------------- |
| D1  | Názov hry                 | rozhodnuté           |
| D2  | Technológia               | rozhodnuté           |
| D3  | Jazyky                    | rozhodnuté           |
| D4  | Prah Hostile Takeover     | rozhodnuté           |
| D5  | Výplaty                   | rozhodnuté           |
| D6  | Herný čas a kalendár      | rozhodnuté           |
| D7  | Rýchlosti úbytku potrieb  | rozhodnuté (ladí sa) |
| D8  | Sila DRAMA_QUEEN AoE      | rozhodnuté           |
| D9  | Pravdepodobnosti pranku   | rozhodnuté           |
| D10 | Chýbajúce objekty potrieb | rozhodnuté           |
| D11 | Vzorec skóre a tikety     | rozhodnuté           |
| D12 | Bankrot a debet           | rozhodnuté (ladí sa) |
| D13 | Bankový úver              | rozhodnuté (ladí sa) |

## D1 – Názov hry · rozhodnuté

**Burnout Inc.: Disrupt or Die** (pôvodný pracovný názov „Underdog Inc.“ sa nepoužíva).

## D2 – Technológia · rozhodnuté

Vanilla JavaScript + Canvas 2D + Vite, bez herného enginu, UI v DOM. Zdôvodnenie v `CLAUDE.md`.
Android cez Capacitor neskôr (Vite `dist/` sa dá zabaliť priamo).

## D3 – Jazyky · rozhodnuté

Slovenčina primárne, angličtina ako druhá mutácia od prvého dňa (`src/i18n/`).
Predvolený jazyk: uložená voľba → jazyk prehliadača (sk/cs → SK) → EN.

## D4 – Prah Hostile Takeover · rozhodnuté

2. hviezda: podiel rivala **< 15 %**. Hostile Takeover sa odomkne pri podiele rivala **< 10 %**
   (GDD 7.4 sa v tomto bode upravuje). Konštanty: `MARKET.TWO_STAR_RIVAL_SHARE`, `MARKET.TAKEOVER_RIVAL_SHARE`.

## D5 – Výplaty · rozhodnuté

Mzdy sa **vyplácajú mesačne** pri mesačnej uzávierke (spolu s nájmom a splátkami úverov).
Pri nábore sa uchádzačovi zobrazuje **mesačný plat**. Orientačné rozpätie 400–2 400 €/mesiac
(prepočet GDD 9.3: 20–120 €/deň × 20 pracovných dní). Štartovací kapitál a ceny sa
prebalansujú v M4.

## D6 – Herný čas a kalendár · rozhodnuté

Problém: ak by herný deň trval 45 s a mesiac mal reálnych ~20 pracovných dní, mesiac by
trval 15 minút pri 1x. Mesačná slučka (výplaty, uzávierka, rozhodnutia) by bola príliš pomalá.

Žánrové hry to riešia **oddelením dvoch hodín**:

- **Život postáv** beží v reálnom čase. Chôdza, káva, záchod a hádky musia vyzerať prirodzene
  a dať sa sledovať.
- **Kalendár** je skomprimovaný a slúži na rytmus ekonomiky. Napr. _Game Dev Tycoon_ ukazuje
  týždne len ako bodky, ktoré rýchlo ubiehajú. Hráč neočakáva, že zamestnanec za „deň“
  stihne presne 8 hodín práce.

**Model v hre:**

| Jednotka          | Pri 1x | Pri 3x | Čo sa v nej deje                                      |
| ----------------- | ------ | ------ | ----------------------------------------------------- |
| Pracovný deň      | 9 s    | 3 s    | kozmetické hodiny 09:00–17:00, deň v týždni v HUD     |
| Týždeň (5 dní)    | 45 s   | 15 s   | eventová karta (každý 1.–2. týždeň), týždenný report  |
| Mesiac (4 týždne) | 3 min  | 1 min  | výplaty, nájom, splátky, uzávierka, kontrola bankrotu |
| Rok (12 mesiacov) | 36 min | 12 min | ročné hodnotenie, trendy trhu                         |

- Pôvodných 45 s z GDD ostáva ako základný rytmus: je to **týždeň**, nie deň.
- Kampaň s cieľom ~2–4 herné roky trvá rádovo 1–2 hodiny hrania pri mixe rýchlostí.
- Potreby postáv (D7) sa počítajú v **reálnych sekundách pri 1x**, nezávisle od kalendára.
  Cieľ: zamestnanec si dá kávu zhruba raz za 1–2 herné dni (~10–20 s), aby kancelária žila.
- HUD: `Ut 13:20 · 2. týždeň` / `Marec, rok 1`.
- Všetky dĺžky sú v `src/data/balance.js` (`TIME`) a budú sa ladiť podľa playtestu.

Overené len zčasti: presné časy iných hier (Two Point Hospital, Project Highrise) sa
z verejných zdrojov nepodarilo spoľahlivo zistiť. Model je preto postavený na princípe,
nie na kopírovaní konkrétnych čísel.

## D7 – Rýchlosti úbytku potrieb · rozhodnuté (ladí sa)

Hodnoty z GDD 4.1 sú v reálnych sekundách pri 1x (D6). Pri -0.2/s by Energia klesla
na 25 % až za ~6 minút, čo je pri novom kalendári ~2 mesiace. Hodnoty sa preto v M2
prepočítajú na cieľ z D6 (prestávka každých ~10–20 s) a doladia sa headless simuláciou.
Hygiena: platí tabuľka (-0.15 ako východisko). Úbytok Morálky (-0.05/s pri dlho nízkych
potrebách) sa implementuje.

## D8 – Sila DRAMA_QUEEN AoE · rozhodnuté

Jednorazový zásah podľa tabuľky 4.2: -30 % Pokoj a -15 % Morálka v okruhu 4 dlaždíc
(kód v GDD 4.4 neplatí).

## D9 – Pravdepodobnosti pranku · rozhodnuté

60 % bežný prank / 30 % vyliata káva / 10 % obeť vybuchne. Všeobecné pravidlo 70/30 je orientačné.

## D10 – Chýbajúce objekty potrieb · rozhodnuté

SMOKE_BREAK: zamestnanec ide do **fajčiarskeho kútika** (lacný objekt, dostupný aj v suteréne).
Ak neexistuje, **fajčí na WC**: obsadí toaletu, nad hlavou má emotikon cigarety a zníži
Hygienu v miestnosti.

Všeobecný fallback pre iné chýbajúce objekty: pomalé dopĺňanie pri stole, rýchlejší pád
Morálky a ikona nad hlavou, ktorá ukazuje, čo chýba.

## D11 – Vzorec skóre a tikety · rozhodnuté

Skóre produktu sa oreže na 0–10. Vplyv tiketov sa obmedzí, napr. `min(3, tikety / 50)`.
Presné čísla sa doladia v M3.

## D12 – Bankrot a debet · rozhodnuté (ladí sa)

- Zostatok môže klesnúť pod 0 €. Pod **-2 000 €** sa nedá nič kupovať ani najímať.
- Ak je pri mesačnej uzávierke zostatok záporný, spustí sa varovanie a **lehota do ďalšej
  uzávierky** (1 mesiac = 3 min pri 1x).
- Ak je zostatok záporný aj pri ďalšej uzávierke, nastáva **bankrot**.
- Dĺžka lehoty je v `ECONOMY.BANKRUPTCY_GRACE_MONTHS` a doladí sa spolu s D6 počas playtestu.

## D13 – Bankový úver · rozhodnuté (ladí sa)

Úrok je **5 % mesačne**. Samotný úrok (250 €/mesiac z 5 000 €) by bol popri mzdách malý,
preto má úver aj **povinné splácanie**:

- Splatnosť **6 mesiacov**, anuitná splátka ≈ **985 €/mesiac**. Spolu sa vráti ~5 910 €.
  Pri malej firme so 4 ľuďmi je to citeľná záťaž, nie zadarmo peniaze.
- Každý ďalší súbežný úver má úrok o **2 percentuálne body vyšší** (7 %, 9 % …), aby
  sa nedalo donekonečna žiť na dlh.
- Nesplatená splátka sa počíta ako záporný zostatok (D12).
- Alternatíva bez splátok je Venture Capital (GDD 9.2) s trvalou stratou podielu zo zisku.

## Ďalšie drobnosti

- Kampaň 5 (Zbrojárstvo) chýba v Tech Matrixe (6.3).
- V kapitole 10 chýbajú podkapitoly 10.1 a 10.2.
- `Infiltrator` má „dediť z Employee“ (7.5), no ukážka kódu nededí – pri implementácii
  vytvoriť spoločnú triedu `Agent` (pohyb, pathfinding) pre zamestnancov aj votrelcov.
