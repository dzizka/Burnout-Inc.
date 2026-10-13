# Burnout Inc. — Game Design Document

> Prevedené z pôvodného `.docx` GDD. Otvorené návrhové otázky a nezrovnalosti sú v [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

## 1. Základný prehľad & Identita hry

### 1.1 Výkonné zhrnutie (Executive Summary)

- **Názov projektu:** *Underdog Inc.* (pracovný podtitul: *Disrupt or Die*)

- **Žáner:** 2D 3/4 Top-Down Manažmentový Tycoon / Satirická simulácia kolónie

- **Cieľové platformy:**

  - **PC:** Webový prehliadač / Desktop (myš a klávesnica)

  - **Mobil (Android):** Mobilný web / Zabalené ako natívna APK cez Capacitor (dotykové ovládanie)

- **Technologický základ:** Čistý HTML5, CSS3, JavaScript (Canvas API / LittleJS / Phaser 3), dáta ukladané v localStorage (JSON formát).

- **Vizuálny štýl:** 2D 3/4 Top-Down Pixel Art (mriežka 16×16 px, pre mobily škálované x3/x4 pre dokonalú ostrosť).

- **Tón hry:** Cynická korporátna satira, čierny humor, absurdná byrokracia (*The Office* stretáva *Two Point Hospital* a *RimWorld*).

### 1.2 Unikátny herný princíp (Core USP)

Väčšina tycoonov je len o pozeraní do tabuliek a zbieraní peňazí. V *Underdog Inc.*:

1.  **Svet je v neustálom pohybe:** Zamestnanci sú autonómne bytosti s vlastnými neurózami, chodia po kancelárii, pijú kávu, ohovárajú kolegov a zrútia sa, keď je toho priveľa.

2.  **Underdog verzus Monopol:** Hráč nezačína na zelenom trávniku, ale ako malý startup v suteréne, ktorý musí prežiť proti bezohľadnému gigantovi.

3.  **Víťazstvo nečistou hrou:** Hráč neporáža konkurenciu len lepším produktom, ale priemyselnou špionážou, podplácaním inšpekcií a vypúšťaním škandálov.

### 1.3 Štruktúra hry: Kampane ako samostatné trhy

Hra nie je jedna nekonečná mapa bez cieľa. Je rozdelená na **samostatné kampane (odvetvia)**. V každej kampani hráč prichádza do nového mesta/budovy a stojí proti inému špecifickému rivalovi:

| **Kampaň / Trh**                         | **Dominantný Rival** | **Špecifikum rivala**                                    | **Vlajkové produkty hráča**                                          |
|------------------------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------------------|
| **1. Garážové IT & Sociálne siete**      | *ZukerBot Inc.*      | Kradne nápady do 48 hodín; ovláda armádu trollov.        | Návykové mobilné aplikácie, predaj osobných dát, clickbaity.         |
| **2. Farmácia & Wellness medicína**      | *PharmaPill Global*  | Má podplatených inšpektorov; predáva predražené placebo. | Neoverené výživové doplnky, syntetický proteín, farebné pilulky.     |
| **3. Smart Home & Spotrebiče**           | *ApplianceMonolith*  | Vynucuje tvrdé predplatné a nútené zastarávanie tovaru.  | Inteligentné chladničky na predplatné, spotrebiče so samovznietením. |
| **4. Zdieľaná ekonomika (Gig-Economy)**  | *OverRide Corp.*     | Zneužíva lacnú silu; najíma armádu právnikov.            | Prenájom cudzích ľudí na minútu, extrémne kuriérske služby.          |
| **5. Zbrojárstvo & Privátna bezpečnosť** | *IronGrip Defense*   | Posiela do tvojej budovy skutočných sabotérov a rušičky. | Paranoické domáce drony, autonómne ploty, špionážny softvér.         |

### 1.4 Podmienky postupu a systém troch hviezd (Progression)

Každá kampaň sa hrá na trojhviezdičkový systém, ideálny pre krátke sedenia na mobile aj dlhé hranie na PC:

- ⭐ **1. Hviezda (Prežitie):** Dosiahni stabilný zisk a 20 % podiel na danom trhu. Odomkne ďalšiu kampaň v zozname.

- ⭐⭐ **2. Hviezdy (Disrupcia):** Zraz trhový podiel rivala pod 15 % a úspešne odraz aspoň 3 jeho útoky (inšpekcie/hoaxy).

- ⭐⭐⭐ **3. Hviezdy (Nepriateľské prevzatie / Hostile Takeover):** Úplné vytlačenie rivala do bankrotu alebo jeho odkúpenie na burze bez prekročenia limitu verejného škandálu.

### 1.5 Zlatý padák (Prestige / Meta-progres)

Po úspešnom zdolaní kampane hráč firmu **predá (Exit)** a zinkasuje **Zlaté padáky (Prestige body)**:

- Tieto body si prenáša do všetkých ďalších kampaní.

- Nakupuje za ne trvalé výhody v centrálnom rodokmeni (napr. *„Všetci zamestnanci vydržia o 25 % viac stresu“*, *„Káva je zadarmo“*, *„Právnici vyriešia žaloby o 50 % rýchlejšie“*).

## 2. Umelecký smer, Grafika & Kamera

### 2.1 Technická špecifikácia zobrazenia

- **Perspektíva:** 3/4 Top-Down (Oblique, uhol skosenia cca 45° až 60°).

  - Podlaha a pohyb postáv fungujú na štandardnej pravouhlej mriežke (os X a Y).

  - Zvislé objekty (steny, čelá stolov, telá postáv) majú vykreslenú prednú fasádu, čo dáva scéne hĺbku bez nutnosti izometrickej matematiky.

- **Rozlíšenie mriežky:** **16×16 pixelov na dlaždicu (tile)**.

  - *Interné vykresľovacie rozlíšenie (Virtual Canvas):* 480 × 270 px (čistý pomer 16:9).

  - *Škálovanie:* Canvas sa automaticky zväčšuje na plnú veľkosť okna/displeja pomocou celočíselného násobenia (Integer Scaling: 2x, 3x, 4x) so zapnutým CSS pravidlom image-rendering: pixelated; (alebo crisp-edges). Obraz zostáva dokonale ostrý bez rozmazania na PC monitoroch aj mobilných OLED displejoch.

- **Orientácia displeja:** **Landscape (na šírku)** pre PC aj mobilné zariadenia.

### 2.2 Kamera a ovládanie (Cross-Platform)

| **Funkcia**                 | **PC (Myš / Klávesnica)**                                      | **Mobil (Dotykový displej)**                     |
|-----------------------------|----------------------------------------------------------------|--------------------------------------------------|
| **Posun pohľadu (Pan)**     | Držanie pravého tlačidla myši a ťahanie / klávesy WASD / šípky | Ťahanie jedným prstom po voľnej ploche obrazovky |
| **Priblíženie (Zoom)**      | Koliesko myši (kroky 1x, 1.5x, 2x)                             | Gesto roztiahnutia dvoma prstami (Pinch-to-zoom) |
| **Výber objektu / postavy** | Kliknutie ľavým tlačidlom                                      | Ťuknutie prstom (Tap)                            |
| **Kontextová akcia**        | Kliknutie na ikonu nad hlavou postavy                          | Ťuknutie na ikonu nad hlavou postavy             |

*Pravidlo dotykového rozhrania:* Minimálna veľkosť interaktívnych UI tlačidiel musí na obrazovke mobilu zaberať aspoň **44×44 CSS pixelov**, aby sa predišlo preklikom.

### 2.3 Štruktúra grafických assetov (Čo presne hra potrebuje)

#### A. Podlahy a Steny (Environment Tileset)

- **Podlahové dlaždice (Floor):**

  - Suterénny betón (lacný, studený štart).

  - Linoleum (štandardná lacná kancelária).

  - Parkety / Drevo (stredná trieda, zvyšuje morálku).

  - Mramor / Koberce (luxus pre manažérske zóny).

- **Steny (Wall Autotile):**

  - Horná hrana steny (hrúbka 1 tile = 16 px).

  - Predná fasáda steny (výška 1–2 tily = 16–32 px) s textúrou tehál, tapiet alebo omietky.

  - Dvere: Automatické posuvné alebo klasické (animácia: zatvorené / otvorené).

#### B. Interaktívny nábytok a spotrebiče

Každý objekt má v kóde definovanú vlastnosť isWalkable: false (kolízia) a interactionPoint (miesto, kam sa postava postaví pri používaní):

- **Pracovné stoly:** Kancelársky stôl s CRT monitorom (Level 1) až moderný výškovo nastaviteľný stôl s duálnym displejom (Level 3).

- **Zdroje energie a morálky:**

  - Kávovar (základný generátor energie).

  - Chladnička a mikrovlnka (stravovanie).

  - Automat na vodu (miesto na klebety a redukciu stresu).

- **Hygiena:** Toaletná kabínka a umývadlo.

- **Technológie & Zábava:** Serverová skriňa (blikajúce diódy, vyžaruje hluk a teplo), gauč, stolný futbal.

#### C. Postavičky a Animácie (Spritesheet)

V 3/4 projekcii stačia **3 smerové pohľady** (Dole/Predok, Hore/Chrbát, Strana/Profil – ľavý a pravý profil sa rieši horizontálnym zrkadlením v kóde cez ctx.scale(-1, 1)):

- **Potrebné animácie (každá 2 až 4 snímky):**

  1.  IDLE – Mierne pohupovanie / dýchanie na mieste.

  2.  WALK – Plynulá chôdza.

  3.  SIT_WORK – Sedenie pri stole a ťukanie do klávesnice.

  4.  DRINK – Státie pri kávovare a pitie z hrnčeka.

  5.  BREAKDOWN – Chytanie sa za hlavu / búchanie do stola pri strese 100 %.

- **Plávajúce stavové emotikony (Floating Icons 8×8 alebo 16×16 px):**

  - Zobrazujú sa nad hlavou postavy: Šálka kávy (únava), Blesk (hnev/hádka), Kvapka potu (preťaženie), Žiarovka (nový nápad do R&D), Dolár (nespokojnosť s platom).

### 2.4 Zoznam voľne dostupných assetov (Free & CC0 balíčky)

Pre rýchly štart a funkčné MVP nie je potrebné kresliť grafiku od nuly. Všetky tieto balíčky sa dajú stiahnuť zadarmo a priamo integrovať:

1.  **Modern Interiors od LimeZu (itch.io):**

    - *Licencia:* Free verzia dostupná na stiahnutie.

    - *Obsah:* Kompletné kancelárske stoly, PC zostavy, kuchynky, servery, podlahy, steny a základné animované postavy v mriežke 16×16.

2.  **Kenney Game Assets (kenney.nl):**

    - *Balíčky:* Roguelike Modern, 1-Bit Pack (pre minimalistické testy), Emote Pack (hotové statusové ikony nad hlavy).

    - *Licencia:* **CC0 (Public Domain)** – 100 % voľné na akékoľvek komerčné aj nekomerčné použitie bez nutnosti uvádzať autora.

3.  **Pipoya Free RPG Character Sprites 16x16 (itch.io):**

    - *Obsah:* Desiatky postavičiek v rôznych oblečeniach (obleky, bežné šaty, technici) s hotovými 4-smerovými cyklami chôdze.

### 2.5 Princíp vrstvenia a Z-Orderingu v Canvas kóde

Aby postavičky nechodili „cez stoly“ alebo aby stôl nezakrýval postavu nesprávne, Canvas vykresľuje scénu v tomto poradí:

1.  **Vrstva 0 (Zem):** Podlahové dlaždice.

2.  **Vrstva 1 (Pod nohami):** Koberce, káble na zemi, tiene.

3.  **Vrstva 2 (Y-Sorting):** Všetky dynamické objekty (postavy, stoly, kávovary) sa zoradia podľa ich zvislej pozície na obrazovke (item.y). Objekty, ktoré sú nižšie na obrazovke, sa vykreslia neskôr a prirodzene prekryjú tie za nimi.

4.  **Vrstva 3 (Vysoké steny & Stropy):** Horné hrany stien a ventilačné šachty.

5.  **Vrstva 4 (UI & Emotikony):** Plávajúce bubliny nad postavami, HUD, texty a tlačidlá.

## 3. Herná slučka (Core Game Loop) & Časový manažment

### 3.1 Časový model a herný cyklus (Time Architecture)

Hra plynie v reálnom čase, no počíta sa na **pracovné dni**.

- **Prevod času:**

  - 1 herná sekunda = cca 1 reálna sekunda pri základnej rýchlosti (1x).

  - 1 pracovný deň trvá **45 reálnych sekúnd** (pracovná doba od 09:00 do 17:00, po nej nasleduje nočný interval alebo voliteľné nočné nadčasy).

  - 1 herný mesiac = 5 pracovných dní (končí sa mesačnou finančnou uzávierkou a výplatou miezd).

- **Ovládanie toku času (Time Controls):**

  - Tlačidlá v pravom hornom rohu obrazovky: **Pauza (Space / Ikona \|\|)**, **1x Rýchlosť**, **2x Rýchlosť**, **3x Rýchlosť**.

  - Pri otvorení dôležitých vyskakovacích dialógov (napr. náhla kontrola inšpektorátu práce) sa hra automaticky prepne do režimu Pauza, aby hráč na mobile nebol v strese z neprimeraného časového tlaku.

### 3.2 Štyri vrstvy hernej slučky

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. SEKUNDOVÁ VRSTVA (Okamžitá spätná väzba) │
│ Ťukanie na plávajúce emotikony, dopĺňanie kávovaru, │
│ hasenie drobných požiarov / čistenie rozliatej kávy │
└──────────────────────────────┬──────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MINÚTOVÁ VRSTVA (Vývojový cyklus produktu) │
│ Výber produktu ──► Generovanie bodov (Pokrok vs. Bugy) │
│ ──► Rozhodnutie o vydaní (Opraviť bugy vs. Crunch time) │
└──────────────────────────────┬──────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DENNÁ A MESAČNÁ VRSTVA (Financie a krízový manažment) │
│ Odpočet nájmu a miezd ──► Tržby z predajov ──► │
│ Náhodný event (útok rivala / inšpekcia / ponuka špióna) │
└──────────────────────────────┬──────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 4. METAGAME VRSTVA (Kampaň, porážka rivala, Prestige) │
│ Získanie 3 hviezdičiek ──► Nepriateľské prevzatie rivala │
│ ──► Zlatý padák (Prestige body) ──► Nové odvetvie │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Detail jednotlivých vrstiev

#### A. Sekundová vrstva (Mikrointerakcie a reflexy)

- **Bublinové stimuly (Micro-rewards):** Keď zamestnanec dosiahne stav inšpirácie, nad hlavou mu na 3 sekundy vyskočí žltá žiarovka. Ak na ňu hráč ťukne, tím okamžite získa bonusové body vývoja.

- **Priame zásahy:** Ak sa pokazí kávovar alebo pretečie záchod, hráč naň môže buď kliknúť sám (rýchle riešenie), alebo počkať, kým tam pomaly dôjde údržbár.

- **Udržiavanie tempa:** Zabezpečuje, že sa hráč nenudí ani vtedy, keď práve nestavia nové miestnosti.

#### B. Minútová vrstva (Cyklus produktu)

1.  **Výber zákazky / produktu:** Hráč zvolí kategóriu (napr. *Mobilná hra s manipulatívnou mikrotransakciou*).

2.  **Vývojová fáza:** Zamestnanci sedia za stolmi a pracujú. Z ich stolov stúpajú dva typy bodov:

    - **Modré body (Features/Kvalita):** Zvyšujú predajnú cenu a hodnotenie produktu.

    - **Červené body (Bugs/Chyby):** Znižujú spokojnosť zákazníkov a generujú škandály.

3.  **Fáza rozhodnutia:** Po naplnení lišty projektu má hráč voľbu:

    - *Vydať hneď:* Rýchle peniaze, no za každý neodstránený bug hrozí pokuta alebo strata reputácie.

    - *Ladiť chyby:* Odklad vydania, no produkt získa recenzie 9/10 a stabilný pasívny príjem.

#### C. Denná / Mesačná vrstva (Ekonomický tlak)

- **Pravidelné náklady:** Každých 5 dní odchádzajú platby:

> $$\text{Čistý~zisk} = \text{Tržby~z~predajov} - \left( \text{Mzdy} + \text{Nájomné} + \text{Káva/Elektrina} \right)$$

- **Eventová karta dňa:** Každý 3. až 5. deň príde náhodné dilematické okno v štýle hry *Reigns*:

  - *Príklad:* *"Štátny hygienik našiel v kancelárii plesnivé sendviče."*

    - **Možnosť A:** Zaplatiť pokutu 300 € (okamžitá strata peňazí).

    - **Možnosť B:** Podplatiť hygienika za 100 € (riziko škandálu +15 %).

    - **Možnosť C:** Hodiť vinu na stážistu a vyhodiť ho (morálka tímu -20 %).

#### D. Metagame vrstva (Kampaň a trh)

- Sledovanie ukazovateľa **Trhový podiel (Market Share)**. Rival začína napríklad na 85 %, hráč na 5 %, zvyšok tvoria bezvýznamné malé firmy.

- Každý úspešný launch alebo úspešná sabotáž odoberie rivalovi 2–8 % a pridá ich hráčovi.

- Po vytlačení rivala pod kritickú hranicu (10 %) sa odomkne tlačidlo **Hostile Takeover (Nepriateľské prevzatie)**.

### 3.4 Technická implementácia v JavaScripte (Canvas Loop)

V HTML5 sa celá slučka riadi štandardným vzorom requestAnimationFrame s oddelenou logikou (update) a vykresľovaním (render):

```js
// Koncept hlavného herného cyklu
let lastTime = 0;
let dayTimer = 0;
const DAY_DURATION = 45; // sekundy na 1 herný deň
function gameLoop(timestamp) {
  let deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  if (!isPaused) {
    update(deltaTime * gameSpeed);
  }
  render();
  requestAnimationFrame(gameLoop);
}
function update(dt) {
  // 1. Aktualizácia herného času
  dayTimer += dt;
  if (dayTimer >= DAY_DURATION) {
    dayTimer = 0;
    triggerDailySettlement(); // Denné zúčtovanie
  }
  // 2. Aktualizácia AI zamestnancov (FSM)
  employees.forEach(emp => emp.update(dt));
  // 3. Aktualizácia aktívnych projektov
  activeProjects.forEach(proj => proj.update(dt));
}
```

## 4. AI zamestnancov, Potreby & Stavový automat (FSM)

### 4.1 Zjednotený systém potrieb (Všetko ubúda zo 100 na 0)

Každý zamestnanec má 6 primárnych stavových líšt. Keď hodnota klesne do **kritickej zóny (\< 25 %)**, zamestnanec prestáva pracovať a autonómne hľadá spôsob, ako si lištu doplniť. Ak hodnota padne na **0 %**, spúšťa sa krízový stav.

```text
[ 100 % ────────────── 50 % ────────────── 25 % ────────────── 0 % ]
Plná kapacita Pohoda Kritická zóna KOLAPS
(Zelená lišta) (Žltá lišta) (Hľadá doplnenie) (Extrémny stav)
```

| **Štatistika (100 ➔ 0)**  | **Čo reprezentuje**             | **Ako ubúda**                                     | **Čo sa stane pri \< 25 %**                               | **Čo sa stane pri 0 % (Kolaps)**                                                           |
|---------------------------|---------------------------------|---------------------------------------------------|-----------------------------------------------------------|--------------------------------------------------------------------------------------------|
| **1. Energia**            | Fyzická bdelosť a kofeín        | Ubúda pri práci (-0.2/s)                          | Ide ku kávovaru (COFFEE_BREAK)                            | Zaspí priamo na klávesnici (bezvedomie na 15 s)                                            |
| **2. Zasýtenie**          | Hlad a smäd                     | Ubúda plynule časom (-0.15/s)                     | Ide k automatu so snackmi (VENDING_MACHINE)               | Omdlieva od hladu, znižuje rýchlosť chôdze o 60 %                                          |
| **3. Pokoj (Anti-Stres)** | Psychická odolnosť a nervy      | Ubúda hlukom, deadlinmi, hádkami (-0.1 až -0.4/s) | Ide na cigaretu / balkón (SMOKE_BREAK)                    | **DRAMA_QUEEN** – hysterický výbuch a krik na kolegov                                      |
| **4. Zábava (Anti-Nuda)** | Pozornosť a mentálna stimulácia | Ubúda stereotypnou prácou (-0.1/s)                | Robí pranky kolegom alebo klebetí (PRANK_COWORKER / CHAT) | **SLACKING** – totálna prokrastinácia, pozerá do stropu                                    |
| **5. Hygiena**            | Komfort tela a čistota WC       | Ubúda po káve/jedle a v špinavom kancli (-0.15/s) | Hľadá toaletu a umývadlo (TOILET)                         | **Hygienická katastrofa** – znečistí okolie stola, morálka všetkých v izbe padá o polovicu |
| **6. Morálka**            | Lojalita k firme a chuť makať   | Klesá, ak sú ostatné potreby dlho nízke (-0.05/s) | Vypisuje životopisy konkurencii                           | **Štrajk / Výpoveď** – odmieta pracovať, kým nedostane bonus                               |

### 4.2 Prehľad stavov (State Machine)

| **Stav (state)**    | **Spúšťač (Trigger)**                                              | **Animácia / Činnosť v kancli**                                              | **Dopad na hru**                                                                                                           |
|---------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| **WORKING**         | Všetky potreby sú v norme (\> 25 %)                                | Píše na klávesnici, ťuká do monitora.                                        | Generuje body vývoja projektu (modré body) a bežné bugy (červené).                                                         |
| **HYPERACTIVE**     | Náhodný kofeínový zásah (šanca 10 % pri pití kávy s plným Pokojom) | Oči dokorán, rýchlostné čiary, píše na 300 % rýchlosti.                      | **Pracuje za troch.** Generuje body 3× rýchlejšie, no Energia a Pokoj ubúdajú 3× rýchlejšie. Trvá 10 sekúnd.               |
| **COFFEE_BREAK**    | Energia \< 25 %                                                    | Kráča ku kávovaru, popíja (4 s).                                             | Doplní Energiu na 100 %, no zrazí Hygienu o -20 %.                                                                         |
| **VENDING_MACHINE** | Zasýtenie \< 25 %                                                  | Hádže mincu do automatu, je čokoládu / pije kolu (4 s).                      | Doplní Zasýtenie na 100 %, zrazí Hygienu o -15 %.                                                                          |
| **SMOKE_BREAK**     | Pokoj \< 25 %                                                      | Odíde k oknu alebo núdzovému východu, poťahuje z cigarety (6 s).             | Doplní Pokoj na 100 %, no ak nemá balkón, zníži Hygienu v miestnosti.                                                      |
| **TOILET**          | Hygiena \< 25 %                                                    | Beží na WC, zavrie dvere (5 s).                                              | Doplní Hygienu na 100 %. Ak je WC obsadené, čaká v rade a Pokoj mu rapídne padá.                                           |
| **PRANK_COWORKER**  | Zábava \< 25 % (alebo nuda)                                        | Priplíži sa ku kolegovi: hodí lietadielko, vymení klávesy, polepí monitor.   | Páchateľovi doplní Zábavu na 100 %; obeti však zrazí Pokoj o -25 %.                                                        |
| **DRAMA_QUEEN**     | Pokoj padne na 0 %                                                 | Vstane zo stoličky, rozhadzuje rukami, vrieska cez megafón na kolegov (8 s). | **Plošný efekt (AoE):** Všetkým v okruhu 4 dlaždíc zrazí Pokoj o -30 % a Morálku o -15 %. Hráč ju môže zastaviť kliknutím. |
| **SLACKING**        | Zábava padne na 0 %                                                | Hádže loptičku do koša, točí sa na stoličke (10 s).                          | Zaberá miesto, negeneruje body, plat beží.                                                                                 |

### 4.3 Systém náhodných reťazových reakcií (Chaos Engine)

Aby správanie nebolo predvídateľné podľa šablóny, hra používa **Generátor incidentov (Chaos Engine)**.

Každá akcia má základný výsledok (70 % šanca) a niekoľko náhodných vetiev (30 % šanca), ktoré môžu vyvolať reťazovú reakciu. Všetky reťazce však majú zabudované **bezpečnostné poistky (Failsafes)**, aby kancelária neskončila v nekonečnej slučke a hra vždy našla nový rovnovážny stav.

```text
[Akcia: Prank kolegovi]
│
├── (60 % Bežný výsledok) ──► Obeť len pokrúti hlavou, páchateľ sa zasmeje. [KONIEC]
│
└── (40 % Náhodná vetva) ──► Obeť sa zľakne a vyleje kávu na klávesnicu!
│
┌────────────────────────────┴───────────────────────────┐
▼ ▼
[Vetva A: Skrat v sieti] [Vetva B: Hádka]
Iskry zapália odpadkový kôš. Obeť začne kričať (DRAMA_QUEEN).
Spustí sa požiarny hlásič. Všetci v miestnosti strácajú Pokoj.
Všetci vybehnú von na dvor. Dvaja kolegovia ujdú na SMOKE_BREAK.
(Požiarnici uhasia oheň ──► [KONIEC]) (Po 10 s vyprchá hnev ──► [KONIEC])
```

#### Pravidlá a poistky náhodného systému:

1.  **Koeficient eskalácie (Escalation Cap):**

> Žiadna reťazová reakcia nemôže mať viac ako **3 stupne eskalácie**.

- *Stupeň 1 (Iskra):* Vyliatie kávy / pokazený automat.

- *Stupeň 2 (Chaos):* Hádka dvoch ľudí / výpadok poistiek.

- *Stupeň 3 (Klimax):* Požiarny poplach / hromadný štrajk / príchod sanitky.

- *Po stupni 3:* Incident sa automaticky vyrieši (napr. príde externá služba, minie sa časovač udalosti) a systém nastaví všetkým zúčastneným 30-sekundovú **imunitu voči ďalším reťazcom (chaosCooldown = 30s)**.

2.  **Katalyzátory náhody (Dice Roll):**

> Šanca na reťazovú nehodu stúpa s tým, ako veľmi hráč ignoruje prostredie:

- Špinavé podlahy a nevysypané koše = +15 % šanca na pošmyknutie a pád.

- Lacný opotrebovaný kávovar = 20 % šanca, že pri použití vybuchne v oblaku pary a obarí zamestnanca (okamžitá strata Pokoja a Energie).

- Hlučné servery v kancelárii = +25 % rýchlejší pád Pokoja pre všetkých naokolo.

3.  **Záchranná brzda hráča (Player Intervention):**

> Hráč nie je len bezmocný divák. Ak vidí, že sa schyľuje ku katastrofe (napr. začína sa hádka), môže na postavičky **rýchlo ťuknúť prstom / kliknúť myšou** a poslať ich na ich miesta skôr, než stiahnu celú kanceláriu do chaosu.

### 4.4 Kódová implementácia potrieb a náhody (JavaScript)

```js
class Employee {
  constructor(name, deskTile) {
    this.name = name;
    this.desk = deskTile;
    this.state = 'WORKING';
    // Všetky potreby začínajú na 100 % a padajú k 0
    this.stats = {
      energy: 100,
      satiety: 100, // Zasýtenie
      peace: 100, // Pokoj (Anti-stres)
      fun: 100, // Zábava (Anti-nuda)
      hygiene: 100, // Hygiena
      morale: 100 // Morálka
    };
    this.timer = 0;
    this.chaosCooldown = 0; // Ochrana pred zacykleným chaosom
  }
  update(dt, office) {
    if (this.chaosCooldown > 0) this.chaosCooldown -= dt;
    // 1. Prirodzený úbytok všetkých hodnôt
    this.stats.energy -= 0.2 * dt;
    this.stats.satiety -= 0.15 * dt;
    this.stats.peace -= 0.1 * dt;
    this.stats.fun -= 0.1 * dt;
    this.stats.hygiene -= 0.08 * dt;
    // 2. FSM logika a vyhodnocovanie priorít
    switch (this.state) {
      case 'WORKING':
      office.addProjectProgress(1 * dt);
      // Kontrola kolapsov (0 %)
      if (this.stats.peace <= 0) {
        this.triggerDramaQueen(office);
      } else if (this.stats.energy <= 0) {
        this.triggerFaint(office); // Zaspí na stole
      }
      // Kontrola potrieb v kritickej zóne (< 25 %)
      else if (this.stats.hygiene < 25) {
        this.goTo(office.findNearest('toilet'), 'TOILET');
      } else if (this.stats.satiety < 25) {
        this.goTo(office.findNearest('vending_machine'), 'VENDING_MACHINE');
      } else if (this.stats.energy < 25) {
        this.goTo(office.findNearest('coffee'), 'COFFEE_BREAK');
      } else if (this.stats.peace < 25) {
        this.goTo(office.findNearest('balcony'), 'SMOKE_BREAK');
      } else if (this.stats.fun < 25) {
        this.tryRandomPrank(office);
      }
      break;
      case 'COFFEE_BREAK':
      this.timer -= dt;
      if (this.timer <= 0) {
        this.stats.energy = 100;
        this.stats.hygiene -= 20; // Káva uberie hygienu
        // Náhodný hod kockou: Šanca 10 % na hyperaktivitu
        if (Math.random() < 0.10) {
          this.state = 'HYPERACTIVE';
          this.timer = 10.0;
          office.showAlert(`\${this.name} má kofeínový šok a pracuje za troch!`);
          return;
        }
        this.returnToDesk();
      }
      break;
      case 'DRAMA_QUEEN':
      this.timer -= dt;
      // Plošný debuff okoliu
      office.addAoEDebuff(this.desk, 4, { peace: -25 * dt, morale: -10 * dt });
      if (this.timer <= 0) {
        this.stats.peace = 40; // Po výbuchu sa čiastočne upokojí
        this.chaosCooldown = 20.0; // Imunita na 20 s
        this.returnToDesk();
      }
      break;
    }
  }
  tryRandomPrank(office) {
    const victim = office.getRandomCoworker(this);
    if (!victim || this.chaosCooldown > 0) return;
    this.state = 'PRANK_COWORKER';
    this.timer = 4.0;
    this.stats.fun = 100;
    // Náhodná vetva následkov
    const roll = Math.random();
    if (roll < 0.60) {
      // Bežný prank
      victim.stats.peace -= 20;
    } else if (roll < 0.90) {
      // Nehoda: Vyliata káva na stôl
      victim.stats.peace -= 40;
      office.spawnSpill(victim.desk);
      office.showAlert(`\${this.name} vylial kávu na stôl kolegu \${victim.name}!`);
    } else {
      // Klimax: Obeť okamžite vybuchne
      victim.stats.peace = 0; // Spustí Drama Queen u obete
    }
  }
  returnToDesk() {
    this.state = 'WORKING';
  }
}
```

## 5. Stavebný systém, Budovy, Poschodia & Environmentálne vplyvy

### 5.1 Postup sťahovania do budov (Office Tiers)

Ako firma rastie a zvyšuje svoj trhový podiel v danom odvetví, pôvodný priestor prestane stačiť. Hráč odomyká a sťahuje firmu do väčších nehnuteľností. Sťahovanie prebieha formou zaplatenia kaucie/sťahovacieho poplatku, pričom nábytok a zamestnanci sa presunú automaticky.

| **Úroveň budovy (Tier)**         | **Typ budovy**           | **Počet poschodí**               | **Max. kapacita ľudí** | **Špecifikum / Prekážka**                                                      |
|----------------------------------|--------------------------|----------------------------------|------------------------|--------------------------------------------------------------------------------|
| **Tier 1: Suterén / Garáž**      | Vlhké podzemie bez okien | 1 poschodie (12×10 dlaždíc)      | 1 až 4 zamestnanci     | Slabé poistky (časté skraty), nulové denné svetlo (rýchlejší pád Pokoja).      |
| **Tier 2: Stará administratíva** | Bývalé štátne kancelárie | 2 poschodia (18×14 dlaždíc)      | 5 až 12 zamestnancov   | Iba staré schodisko, hrdzavé potrubia na WC (vyššie riziko upchatia).          |
| **Tier 3: Moderný Open-Space**   | Presklená biznis zóna    | 3 až 4 poschodia (24×18 dlaždíc) | 13 až 30 zamestnancov  | Rýchlovýťahy, veľké presklené fasády, priestor na oddelené serverovne.         |
| **Tier 4: Korporátny mrakodrap** | Samostatná veža (HQ)     | 5+ poschodí + suterén + strecha  | 30+ zamestnancov       | Helipad na streche (rýchle návštevy VIP investorov), privátne metro v podzemí. |

### 5.2 Mechanika poschodí a vertikálna logistika (Elevators & Stairs)

Pridanie poschodí prináša novú vrstvu logistického plánovania (podobne ako v *SimTower* / *Project Highrise*):

#### A. Prepínanie poschodí v UI (Cross-Platform)

- **Pohľad na jedno poschodie (Layered View):** Na obrazovke je vždy aktívne vykreslené jedno konkrétne poschodie v 3/4 pohľade.

- **Prepínač poschodí (Floor Switcher):**

  - Na pravej strane displeja je vertikálny panel s tlačidlami: \[Strecha\], \[3.P\], \[2.P\], \[1.P\], \[Suterén -1\].

  - *Mobil:* Rýchle ťuknutie na číslo poschodia alebo vertikálny swipe dvoma prstami.

  - *PC:* Klávesy Page Up / Page Down alebo rolovanie cez bočný panel.

- **Mini-indikátory poschodí:** Ak na 2. poschodí vznikne požiar alebo niekto dostane záchvat DRAMA_QUEEN, tlačidlo \[2.P\] v bočnom paneli začne blikať červenou výstrahou.

#### B. Vertikálny presun postáv a úzke hrdlá (Bottlenecks)

Postavičky využívajú na presun medzi poschodiami vertikálne spojovacie body:

1.  **Schodisko (Stairs):**

    - *Výhoda:* Lacné, nikdy sa nepokazí.

    - *Nevýhoda:* Pomalý presun (chôdza po schodoch trvá 4 sekundy na jedno poschodie); unavuje zamestnancov (-10 Energie).

2.  **Výťah (Elevator):**

    - *Výhoda:* Rýchly presun medzi viacerými poschodiami naraz.

    - *Nevýhoda:* Vysoká cena a limitovaná kapacita (napr. max. 4 osoby v kabíne).

    - **Emergentný problém – Výťahová zápcha:** Ak hráč umiestni kávovar na 1. poschodie a vývojárov na 4. poschodie, zamestnanci stoja v dlhých radoch pred výťahom. Ak výťah nestíha, padá im Zasýtenie aj Pokoj a namiesto práce trávia čas čakaním na chodbe.

3.  **Servisný výťah / Skartovacie šachty:**

    - Prepojenie priamo do suterénu na rýchly transport odpadu a serverových komponentov.

#### C. Logické rozdelenie funkcií poschodí

Úspešná firma stavia zóny podľa poschodí, aby minimalizovala chaos:

- **Suterén (-1):** Hlučné servery, archívy, skartovačky a upratovacie zázemie (hluk a teplo nezasahujú ľudí hore).

- **Prízemie (1.P):** Recepcia, kaviareň, záchody, pohovory s uchádzačmi.

- **Stredné poschodia (2.P – 3.P):** Pracovné stoly, vývojári, marketéri (tichá zóna).

- **Najvyššie poschodie (Top Floor):** Manažérske kancelárie, R&D laboratórium, luxusný relaxačný bar.

### 5.3 Mriežkový systém a stavebná mechanika (Grid System)

Každé poschodie má vlastné dvojrozmerné pole dlaždíc (**Grid 16×16 px**).

- **Typy dlaždíc:**

  - WALL – Nepriechodná zvislá priečka.

  - FLOOR – Priechodná podlaha (betón, linoleum, koberec, luxusný mramor).

  - DOOR – Dvere tlmiace hluk a zápach medzi zónami.

  - VERTICAL_CONNECTOR – Schodisko alebo výťahová šachta zaberajúca priestor na aktuálnom aj susednom poschodí.

  - OBJECT – Nábytok zaberajúci 1×1, 1×2 alebo 2×2 dlaždice. Každý objekt má priradenú interactionTile (miesto, odkiaľ ho postava používa).

### 5.4 Environmentálne polia vplyvu (AoE Heatmaps)

Vplyvy sa šíria nielen horizontálne na poschodí, ale vertikálne spojovacie šachty môžu prepúšťať hluk:

1.  **Hluk (Noise Level):**

    - *Zdroje:* Hučiace servery, stavebný ruch, hádky a hysterické záchvaty (DRAMA_QUEEN).

    - *Vplyv:* Zamestnancom v dosahu klesá hodnota **Pokoj** o 50 % až 100 % rýchlejšie.

    - *Tlmenie:* Dvere znižujú hluk o 80 %, priečky o 100 %. Schodisko bez dverí prepúšťa časť hluku aj na susedné poschodie.

2.  **Zápach a hygiena (Odor / Dirt):**

    - *Zdroje:* Plné koše, pretečené WC, dym z cigariet na chodbe.

    - *Vplyv:* Znižuje **Hygienu** a **Morálku** pri prechode zónou.

3.  **Teplo (Thermal Load):**

    - *Zdroje:* Servery. Ak je poschodie prehriate, **Energia** zamestnancov klesá dvakrát rýchlejšie (zaspávajú od tepla).

    - *Riešenie:* Klimatizácia a ventilátory.

### 5.5 Katalóg vybavenia a infraštruktúry

| **Kategória** | **Objekt**             | **Rozmer (tiles)** | **Efekt na potreby / Hru**                                             | **Cena**           |
|---------------|------------------------|--------------------|------------------------------------------------------------------------|--------------------|
| **Vertikála** | **Schodisko**          | 2×2                | Prepája dve susedné poschodia. Pomalý presun, zadarmo prevádzka.       | 400 €              |
| **Vertikála** | **Výťahová šachta**    | 2×2                | Rýchly presun medzi všetkými poschodiami. Kapacita 4 osoby.            | 1 500 € + 20 €/deň |
| **Práca**     | **Základný PC stôl**   | 1×1                | Umožňuje prácu 1 človeka. Bežné tempo.                                 | 100 €              |
| **Práca**     | **Ergo-pracovisko**    | 1×2                | Rýchlosť práce +25 %, Pokoj klesá o 20 % pomalšie.                     | 350 €              |
| **Infra**     | **Serverová skriňa**   | 1×1                | Nutná pre náročné projekty. **Vyžaruje silný hluk a teplo (okruh 3).** | 500 €              |
| **Potreby**   | **Kávovar Deluxe**     | 1×1                | Dopĺňa **Energiu** na 100 %. Šanca 10 % na poruchu.                    | 250 €              |
| **Potreby**   | **Automat so snackmi** | 1×1                | Dopĺňa **Zasýtenie** na 100 %. Generuje obaly na zemi.                 | 250 €              |
| **Potreby**   | **Toaletná kabínka**   | 1×1                | Dopĺňa **Hygienu** na 100 %.                                           | 200 €              |
| **Relax**     | **Lounge gauč + TV**   | 2×2                | Rýchlo dopĺňa **Zábavu** a **Pokoj**.                                  | 600 €              |
| **Údržba**    | **Klimatizácia**       | 1×1 (stena)        | Neutralizuje teplo na celom poschodí.                                  | 300 €              |

### 5.6 Kódová štruktúra viacerých poschodí v JavaScripte

Dáta budovy sú organizované ako pole poschodí (floors), pričom každé poschodie má vlastnú dlaždicovú maticu, nábytok a zoznam prítomných entít:

```js
class Building {
  constructor(tierConfig) {
    this.name = tierConfig.name;
    this.currentFloorIndex = 0; // Aktívne zobrazené poschodie
    this.floors = [];
    // Inicializácia jednotlivých poschodí
    for (let i = 0; i < tierConfig.floorCount; i++) {
      this.floors.push({
        level: i,
        width: tierConfig.width,
        height: tierConfig.height,
        tiles: new Uint8Array(tierConfig.width * tierConfig.height),
        objects: [],
        itemsOnFloor: [] // odpadky, škvrny od kávy
      });
    }
  }
  switchFloor(floorIndex) {
    if (floorIndex >= 0 && floorIndex < this.floors.length) {
      this.currentFloorIndex = floorIndex;
      // Prekreslenie scény pre nové poschodie
      renderer.setDirty();
    }
  }
  // Pathfinding medzi poschodiami
  findPathBetweenFloors(startPos, targetPos) {
    if (startPos.floor === targetPos.floor) {
      // Štandardný 2D A* na rovnakom poschodí
      return aStar2D(startPos, targetPos, this.floors[startPos.floor]);
    } else {
      // 1. Cesta k najbližšiemu výťahu/schodiskám na aktuálnom poschodí
      // 2. Vertikálny presun (animácia čakania/jazdy)
      // 3. Cesta od výťahu k cieľu na cieľovom poschodí
      return buildMultiFloorRoute(startPos, targetPos, this);
    }
  }
}
```

## 6. Vývoj produktov, Reálne presľapy & Post-Launch Peklo

### 6.1 Životný cyklus produktu (Product Lifecycle)

Základný komerčný cyklus každého vyvíjaného produktu pozostáva zo štyroch fáz:

```text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 1. KONCEPT │ ──► │ 2. PRODUKCIA│ ──► │ 3. LAUNCH / │ ──► │ 4. POST-LAUNCH│
│ & KOMBINÁCIA│ │ (BODY/BUGY) │ │ ROZHODNUTIE│ │ PEKLO / CS│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

1.  **Fáza konceptu:** Hráč vyberie **Typ produktu** a priradí mu **Biznis model** (Jednorazový predaj, Predplatné, Agresívna monetizácia).

2.  **Produkčná fáza:** Zamestnanci priradení k projektu generujú body:

    - **Modré body (Features / Funkcie):** Určujú atraktivitu produktu, finálne skóre v recenziách a počiatočný záujem trhu.

    - **Červené body (Bugs / Chyby):** Znižujú spokojnosť zákazníkov, zvyšujú riziko technického zlyhania a škandálu.

3.  **Launch & Morálna dilema:** Po naplnení cieľovej kapacity modrých bodov sa vývoj zastaví a hráč má voľbu:

    - *Vydať hneď (Ship It):* Rýchly zisk, no neodstránené bugy idú rovno medzi zákazníkov a prenesú sa do Call Centra.

    - *Ladiť chyby (Polishing):* Vývojári odstraňujú červené body. Stojí to čas a mzdy, no produkt bude stabilný.

4.  **Post-Launch fáza:** Produkt generuje tržby a podľa počtu neodstránených chýb zaplavuje firmu sťažnosťami a hnevom zákazníkov.

### 6.2 Mechanika Post-Launch: Odvetné peklo v Call Centre (Customer Support)

Ak hráč vydá produkt s vysokým počtom červených bugov, neprichádza len o peniaze a recenzie, ale spustí krízu na zákazníckej podpore:

#### A. Zákaznícke lístky (Hate Tickets) a Zvoniace telefóny

- Každý neodstránený červený bug vygeneruje **frontu nahnevaných telefonátov a tiketov** (incomingTickets = bugs \* 20).

- Telefóny na stoloch operátorov začnú nepretržite a hlasno zvoniť:

  - **Hluk (AoE Noise):** Zvoniace stoly generujú extrémny hluk do okolia (okruh 4 dlaždice). Všetkým vývojárom a zamestnancom na rovnakom poschodí rapídne klesá **Pokoj**.

  - **Hate Mail & Psychický tlak:** Operátori podpory absorbujú hnev zákazníkov. Ich hodnota **Pokoj** padá o **-0.8 / sekunda** (4-krát rýchlejšie ako pri bežnej práci).

#### B. Nútené nadčasy a kolaps podpory

- **Zaseknutí na linke:** Kým nie sú tikety vybavené alebo neodíde vlna hnevu, operátori nemôžu ísť domov ani si dať riadnu prestávku.

- **Reťazový kolaps:**

  1.  Operátorom klesne **Pokoj** na 0 % → spúšťa sa stav DRAMA_QUEEN alebo začnú hádzať slúchadlá do monitora.

  2.  Ak operátor ujde na cigaretu (SMOKE_BREAK) alebo odpadne, linka zostáva hluchá.

  3.  **Nevybavené hovory zvyšujú Škandál:** Každý zmeškaný hovor pridáva +0.2 % do ukazovateľa **Verejného škandálu** a spúšťa negatívne recenzie na internete.

#### C. Možnosti hráča, ako krízu na podpore riešiť:

- **Hasiť chyby za behu (Hotfixy):** Vývojári musia prerušiť nové projekty a programovať záplaty (Hotfixy), ktoré znižujú prítok nových nahnevaných telefonátov.

- **Vybudovať oddelené poschodie pre Call Centrum:** Presunúť celú podporu do suterénu alebo na samostatné poschodie s hrubými priečkami, aby ich zvoniace telefóny a krik nerušili vývojárov.

- **Automatická hlasová linka (Bot Trap):** Kúpa serverového robota, ktorý zákazníkov drží v nekonečnej čakacej slučke s otrasnou hudbou. Zníži to tlak na personál, no zvyšuje škandál.

- **Obetovať tím podpory (Crunch):** Hráč ich dopuje kávou z drahých automatov, kým vlna neodznie, pričom počíta s tým, že po skončení krízy väčšina z nich podá výpoveď.

### 6.3 Systém odomykania odvetví podľa kampaní (Gated Tech Matrix)

- **Kampaň 1 (IT & Siete):** Základné IT + Trollie farmy a clickbaity.

- **Kampaň 2 (Farmácia):** Základné liečivá + kombinácie s IT dátami z Kampane 1 (predplatné na lieky).

- **Kampaň 3 (Smart Home):** Spotrebiče + kombinácie s biochémiou a IT.

- **Kampaň 4 (Gig-Economy):** Globálne platformy spájajúce všetky predošlé odvetvia.

### 6.4 Historické korporátne presľapy (Infamous Gambles)

Špeciálne vysoko rizikové projekty inšpirované skutočným svetom biznisu:

| **Inšpirácia**                                | **Názov projektu**         | **Mechanika**                                                                   | **Riziko & Škandál**                                   | **Výsledok pri úspechu**                                     |
|-----------------------------------------------|----------------------------|---------------------------------------------------------------------------------|--------------------------------------------------------|--------------------------------------------------------------|
| **Theranos** *(Kvapka krvi)*                  | **„Kvapka pravdy“**        | Falošný prístroj na krv. Výsledky tajne vozíš v noci do cudzieho labu.          | 90 % šanca na odhalenie (+60 % škandál, razia).        | **500 000 €** a zničenie farmaceutického rivala.             |
| **Bill Gates & DOS** *(Predaj cudzieho kódu)* | **„Predaj cudzieho kódu“** | Predáš systém skôr, než ho vlastníš. Musíš ho lacno kúpiť do 5 dní od študenta. | Zmluvná pokuta a okamžitý bankrot pri nedodržaní.      | **Trvalý licenčný poplatok** z každého predaného PC rivala.  |
| **Volkswagen** *(Dieselgate)*                 | **„EcoCheat Mode“**        | Spotrebič pri teste kontrolórom vykáže nulové emisie/odber.                     | Pokuta 100 000 € a stiahnutie tovaru z trhu.           | **Zníženie daní o 50 %** a štátna eko-dotácia.               |
| **Purdue Pharma** *(OxyContin)*               | **„Nenávykový elixír“**    | Liek prezentovaný ako neškodný, no vysoko návykový.                             | Súdne žaloby a protesty nahnevaných ľudí pred budovou. | **Nekonečné predaje:** Závislí zákazníci nakupujú každý deň. |
| **Fyre Festival**                             | **„HypeFest“**             | Predaj VIP lístkov na luxusný summit, kde sú len stany.                         | Hromadné žaloby, FBI vyšetrovanie.                     | Zhrabnutie kapitálu vopred bez nutnosti čokoľvek postaviť.   |

### 6.5 Hodnotenie a Verejný škandál (Scandal Meter)

$$Score = \min\left( 10,\frac{\text{Modré~body}}{\text{Cieľová~norma}} \times 10 \right) - \left( \text{Červené~bugy} \times 0.5 \right) - \left( \text{Nevybavené~tikety~v~CS} \times 0.1 \right)$$

```text
[ 0 % ────────────── 40 % ────────────── 70 % ────────────── 100 % ]
Čistý štít Mediálny šum Razia & Pokuty LIKVIDÁCIA
(Rast akcií) (Pokles predajov) (Zmrazenie účtov) (GAME OVER)
```

- **Nástroje na hasenie škandálu:**

  - **PR Kampaň (Money Sink):** 1 000 € za zníženie o 20 %.

  - **Obetný baránok (Scapegoat):** Prepustenie náhodného operátora/stážistu v priamom prenose (-30 % škandál, morálka tímu na polovicu).

  - **Fiktívna charitatívna nadácia:** Mesačný trvalý príkaz tlmiaci rast škandálu.

### 6.6 Kódová štruktúra Call Centra a tiketov v JavaScripte

```js
class SupportDesk {
  constructor(tileX, tileY) {
    this.x = tileX;
    this.y = tileY;
    this.assignedEmployee = null;
    this.isRinging = false;
    this.ringVolume = 0; // Generuje AoE hluk
  }
  update(dt, office) {
    // Ak sú v systéme nevybavené tikety z chybného produktu
    if (office.pendingSupportTickets > 0) {
      this.isRinging = true;
      this.ringVolume = 30; // Hluk pre okolie
      office.applyRadialNoise(this.x, this.y, 4, this.ringVolume);
      if (this.assignedEmployee && this.assignedEmployee.state === 'WORKING') {
        // Operátor aktívne vybavuje hovor
        this.assignedEmployee.stats.peace -= 0.8 * dt; // Extrémny stres z hate mailov
        office.pendingSupportTickets -= 2 * dt; // Odbavovanie tiketov
        if (this.assignedEmployee.stats.peace <= 0) {
          this.assignedEmployee.triggerDramaQueen(office);
        }
      } else {
        // Telefón zvoní naprázdno - hnev zákazníkov rastie
        office.addScandal(0.1 * dt);
      }
    } else {
      this.isRinging = false;
      this.ringVolume = 0;
    }
  }
}
```

## 7. Korporátna vojna, Špionáž & Súboj s rivalmi

### 7.1 Ukazovateľ trhovej dominancie (Tug-of-War)

V každej kampani prebieha neustály boj o trhový koláč (Market Share: 0 až 100 %).

- **Štartovacia pozícia:** Rival začína s **80–90 %**, hráč začína s **5 %**, zvyšok patrí drobným lokálnym firmám.

- **Dynamika posunu:**

  - Úspešný launch bez chýb: **+3 až +6 %** pre hráča (odčerpá sa rivalovi).

  - Úspešná sabotáž rivala: **+4 až +8 %** jednorazovo.

  - Zvládnutie odvrátenia útoku rivala: **+2 %**.

  - Prepuknutie škandálu u hráča: **-5 až -10 %** (zákazníci utekajú k rivalovi).

### 7.2 Ofenzívne operácie hráča (Black Ops Menu)

Hráč môže zriadiť v suteréne alebo na oddelenom poschodí **Oddelenie pre špeciálne operácie (Black Ops Desk)** a najímať agentov na nekalé praktiky:

| **Typ operácie**                         | **Náklady** | **Šanca na úspech** | **Efekt pri úspechu**                                                                                                                                   | **Následok pri odhalení**                                           |
|------------------------------------------|-------------|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| **Priemyselná špionáž (Code Theft)**     | 800 €       | 75 %                | Ukradne zdrojový kód rivala: okamžite pridá **+50 Modrých bodov** do tvojho aktuálneho R&D projektu.                                                    | Škandál **+25 %**, strata reputácie u investorov.                   |
| **Trollia farma & Hoaxy**                | 500 €       | 85 %                | Vypustí koordinovanú kampaň na sociálnych sieťach o toxicite produktu rivala. Zrazí jeho trhový podiel o **5 %**.                                       | Rival podá žalobu: pokuta **2 000 €**.                              |
| **Fyzická sabotáž (Inštalatér / Krtko)** | 1 500 €     | 60 %                | Pošle falošného technika do budovy rivala, ktorý im v noci presekne optický kábel alebo poškodí klimatizáciu serverov (paralýza ich predajov na 3 dni). | Špión je zatknutý, vyšetrovanie polície priamo v tvojej kancelárii. |
| **Headhunting kľúčového experta**        | 2 500 €     | 50 %                | Preplatí hlavného architekta rivala. Získaš zamestnanca s traítom *„Génius“*, rival stratí 30 % vývojového tempa.                                       | Expert je v skutočnosti dvojitý agent nasadený rivalom!             |

### 7.3 Defenzíva: Infiltrácia a obrana vlastnej kancelárie

Rival nespí. S rastúcim úspechom hráča začne posielať cudzích sabotérov priamo do tvojej budovy:

#### A. Typy votrelcov a ich akcie v kancelárii:

1.  **Falošný revízor požiarnych hlásičov:**

    - Prechádza sa po poschodiach v reflexnej veste. Ak ho nezastavíš, spustí cvičný požiarny poplach – všetci zamestnanci vybehnú na ulicu a projekt mešká.

2.  **Krtko (Infiltrovaný zamestnanec):**

    - Prihlási sa na bežný pohovor so skvelým životopisom. V skutočnosti tajne generuje červené bugy do projektov a prilieva pokazené mlieko do kávovaru (hromadná nevoľnosť a pád Hygieny).

3.  **Podplatený novinár / Paparazzi:**

    - Snaží sa dostať na poschodie k operátorom zákazníckej podpory alebo odfotiť zamestnanca uprostred záchvatu DRAMA_QUEEN, aby z toho spravil titulku v médiách.

#### B. Nástroje hráča na obranu budovy:

- **Bezpečnostná recepcia na prízemí:** Turnikety a SBS-kár (Security Guard) automaticky kontrolujú prichádzajúce osoby. Lacný SBS-kár občas zaspí a pustí sabotéra; vytrénovaný SBS-kár votrelca okamžite vyvedie.

- **Kamerový systém (CCTV):** Umožňuje hráčovi manuálne odhaliť votrelca – podozrivá postava má nad hlavou jemné blikanie. Hráč na ňu môže **ťuknúť prstom / kliknúť myšou** a privolať ochranku.

- **Právne oddelenie (Legal Counsel Desk):** Právnici v reálnom čase znižujú dopady prichádzajúcich žalôb a pokút od štátu.

### 7.4 Klimax kampane: Nepriateľské prevzatie (Hostile Takeover)

Keď hráč stlačí trhový podiel rivala pod **15 %**, odomkne sa záverečná fáza trhu: **Nepriateľské prevzatie**.

```text
[ Trhový podiel rivala < 15 % ]
│
▼
[ ODOMKNUTIE BURZOVEJ BITKY ]
│
┌───────────┴───────────────────────────┐
▼ ▼
[ CESTA A: Výkup akcií ] [ CESTA B: Smrtiaci škandál ]
Vykúpiť 51 % akcií rivala Doručiť médiám usvedčujúce
za hotovosť (vyžaduje veľký materiály z Black Ops operácií.
finančný kapitál). Rival vyhlási bankrot do 24 hodín.
│ │
└───────────────────┬───────────────────┘
│
▼
[ VÍŤAZSTVO NA TRHU: 3 HVIEZDY ]
Zisk trofeje trhu, Zlatý padák (Prestige)
a odchod do ďalšieho odvetvia!
```

### 7.5 Kódová implementácia sabotéra v JavaScripte

Sabotér je špeciálna entita triedy Infiltrator, ktorá dedí vlastnosti pohybu z Employee, no sleduje škodlivé ciele:

```js
class Infiltrator {
  constructor(targetFloor, disguiseType) {
    this.floor = targetFloor;
    this.x = 0; // Začína pri vchode / výťahu
    this.y = 0;
    this.disguise = disguiseType; // 'INSPECTOR', 'INTERN', 'REPAIRMAN'
    this.isDiscovered = false;
    this.sabotageTimer = 15.0; // Čas do dokončenia sabotáže
    this.targetObject = null;
  }
  update(dt, building, playerCompany) {
    if (this.isDiscovered) {
      // Útek k východu po odhalení hráčom
      this.fleeToExit(dt);
      return;
    }
    // Vyhľadanie cieľa sabotáže (napr. kávovar, server)
    if (!this.targetObject) {
      this.targetObject = building.findObjectByType('server', this.floor);
    }
    if (this.isNear(this.targetObject)) {
      this.sabotageTimer -= dt;
      if (this.sabotageTimer <= 0) {
        // Úspešná sabotáž
        this.targetObject.breakDown();
        playerCompany.addScandal(15);
        playerCompany.triggerAlert(`Sabotér znefunkčnil serverovňu na \${this.floor}. poschodí!`);
        this.isDiscovered = true;
      }
    } else {
      this.walkTowards(this.targetObject.interactionTile, dt);
    }
  }
  // Interakcia hráča (kliknutie na votrelca)
  onPlayerClick(securityTeam) {
    this.isDiscovered = true;
    securityTeam.alertGuardTo(this);
  }
}
```

## 8. Používateľské rozhranie (UI / UX) & Ovládanie

### 8.1 Štruktúra obrazovky (HUD Layout)

Rozhranie je rozdelené podľa princípu minimálneho zakrývania hernej plochy pri zachovaní okamžitého prehľadu o financiách a stave budovy:

```text
┌─────────────────────────────────────────────────────────────┐
│ [€ 12,450] [Deň 14] [Trh: 32%] [Škandál: 18%] [||][>][>>]│ <-- Horná lišta (Status Bar)
├─────────────────────────────────────────────────────────────┤
│ [ ▲ ]│
│ [3.P]│
│ HERNÉ PLÁTNO [2.P]│ <-- Prepínač poschodí
│ (CANVAS 16×16) [1.P]│
│ [ ▼ ]│
│ │
├─────────────────────────────────────────────────────────────┤
│ [STAVAŤ] [ZAMESTNANCI] [PROJEKTY] [BLACK OPS] │ <-- Spodný navigačný dok
└─────────────────────────────────────────────────────────────┘
```

#### A. Horná lišta (Status Bar)

- **Finančný zostatok (Cash):** Zelené čísla pri zisku, blikajúce červené pri zápornom stave.

- **Kalendár & Rýchlosť:** Aktuálny deň, mesiac a prepínače času (Pauza, 1x, 2x, 3x).

- **Trhový podiel (Market Share):** Dvojfarebný horizontálny prúžok (Hráč vs. Rival).

- **Škandál meter:** Ukazovateľ 0–100 % s ikonou novín/polície. Pri prekročení 70 % pulzuje žlto-červeno.

#### B. Pravý vertikálny dok (Prepínač poschodí)

- Kompaktné stĺpcové menu s označením poschodí (-1, 1, 2, 3).

- Zobrazuje kontextové miniatúrne výstrahy priamo na ikone poschodia:

  - Červený výkričník = požiar / rozbitý server.

  - Hnedá ikona = pretečená toaleta.

  - Hysterická maska = prebiehajúci stav DRAMA_QUEEN.

#### C. Spodný navigačný dok (Action Dock)

- Pevné veľké tlačidlá (minimálne 48×48 px) s jasnými piktogramami a popiskami:

  1.  **Stavať:** Otvára katalóg nábytku a priečok rozdelený na taby (*Práca*, *Relax*, *Hygiena*, *Infra*).

  2.  **Zamestnanci:** Zoznam personálu, fluktuácia, nábor nových ľudí a prepúšťanie.

  3.  **Projekty (R&D):** Aktívny vývoj, história vydaných produktov, štatistiky Call Centra.

  4.  **Black Ops:** Sabotážne a špionážne akcie proti rivalovi.

### 8.2 Kontextové karty a Inšpekcia entít (Inspection Drawers)

Ťuknutie na akúkoľvek bytosť alebo nábytok otvorí bočnú vysúvaciu kartu bez toho, aby prekryla celú obrazovku:

#### Karta zamestnanca:

- Meno, rola, mzda a aktuálny trait (napr. *Kofeínový motor*).

- **6 stavových pruhov:** Energia, Zasýtenie, Pokoj, Zábava, Hygiena, Morálka (všetky klesajúce zo 100 na 0).

- Tlačidlá rýchlej interakcie:

  - \[Vyplatiť bonus 100 €\] (Okamžitý reset Morálky na 100).

  - \[Poslať na nútenú prestávku\] (Preruší prácu a nasmeruje postavu na kávu/balkón).

  - \[Vyhodiť / Spraviť obetného baránka\] (Odstránenie z firmy, zníži celofiremný Škandál).

#### Karta produktu:

- Priebeh vývoja: Dva paralelné ukazovatele (Modré body / Červené bugy).

- Tlačidlo \[Vydať hneď!\] vs. \[Opravovať chyby\].

- Live štatistika po vydaní: Počet čakajúcich tiketov na podpore, denný zisk a recenzie.

### 8.3 Systém interakcie a dotykového mapovania (Cross-Platform Input)

Pretože hra beží v HTML5 na PC aj Android zariadeniach, kód používa jednotné udalosti Pointer Events (pointerdown, pointermove, pointerup), ktoré obslúžia myš aj dotyk:

| **Akcia**              | **Desktop (PC)**                     | **Dotykový displej (Mobil)**                           |
|------------------------|--------------------------------------|--------------------------------------------------------|
| **Posun kamery**       | Ťahanie pravým tlačidlom myši / WASD | Ťahanie jedným prstom po voľnej dlaždici               |
| **Zoom**               | Koliesko myši                        | Gesto roztiahnutia dvoma prstami (Pinch)               |
| **Výber objektu**      | Kliknutie ľavým tlačidlom            | Ťuknutie prstom (Tap)                                  |
| **Zrušenie akcie**     | Klávesa Escape / Klik pravým         | Ťuknutie na krížik v rohu karty / gesto späť           |
| **Stavba (Placement)** | Kliknutie a ťahanie náhľadu          | Vybratie položky z menu a ťuknutie na cieľovú dlaždicu |

### 8.4 Technická implementácia UI (HTML/DOM Overlay vs Canvas UI)

Pre zachovanie výkonu a jednoduchej úpravy štýlov hra využíva **hybridnú architektúru rozhrania**:

- **Herný svet:** Vykresľovaný výlučne cez \<canvas\> v reálnom čase (podlahy, steny, postavy, plávajúce bubliny).

- **Kompletné UI a okná:** Písané v štandardnom HTML5 a CSS3, napozicované priamo nad canvasom pomocou position: absolute; pointer-events: auto;.

```html
<div id="game-container">
<!-- 1. Herná scéna -->
<canvas id="gameCanvas" width="480" height="270"></canvas>
<!-- 2. UI Overlay (Nezávislý od rozlíšenia pixelov) -->
<div id="ui-layer">
<header id="status-bar">
<div id="cash-display">€ 0</div>
<div id="scandal-meter"><div class="fill"></div></div>
<div id="time-controls">
<button id="btn-pause">⏸</button>
<button id="btn-play">▶</button>
<button id="btn-fast">▶▶</button>
</div>
</header>
<aside id="floor-selector">
<button data-floor="2">2.P</button>
<button data-floor="1" class="active">1.P</button>
<button data-floor="0">Sut.</button>
</aside>
<footer id="bottom-dock">
<button id="tab-build">Stavať</button>
<button id="tab-staff">Personál</button>
<button id="tab-rd">R&D</button>
<button id="tab-sabotage">Black Ops</button>
</footer>
</div>
</div>
```

## 9. Ekonomický model, Menové toky & Money Sinks

### 9.1 Štruktúra peňažných tokov (Cashflow Matrix)

Ekonomika hry je postavená na asymetrii: **fixné náklady odchádzajú garantovane a pravidelne**, zatiaľ čo **príjmy sú nestále, podliehajú starnutiu a závisia od úspechu projektov**.

$$\text{Denný~čistý~zisk} = \sum_{}^{}\text{Tržby~z~produktov} - \left( \text{Denné~mzdy} + \text{Nájomné~poschodí} + \text{Prevádzka~hardvéru} \right)$$

PRÍJMY (+) VÝDAVKY (-)

```text
┌────────────────────────┐ ┌────────────────────────┐
│ Predaje a predplatné │ │ Denné mzdy personálu │
│ Zákazkový R&D vývoj │ │ Nájomné za poschodia │
│ Špinavé dotácie/krádeže│ │ Údržba a spotreba sytí │
└───────────┬────────────┘ └───────────┬────────────┘
│ │
▼ ▼
┌─────────────────────────────────────────────────┐
│ FIREMNÁ POKLADNICA (CASH) │
└────────────────────────┬────────────────────────┘
│
NEVYHNUTNÉ ODTOKY (MONEY SINKS)
┌─────────────────────────────────────────────────┐
│ PR hasenie škandálov │ Pokuty inšpekcií │ Úplatky│
│ Výkup akcií rivala │ Expanzia a nové poschodia │
└─────────────────────────────────────────────────┘
```

### 9.2 Príjmové toky (Inflows)

1.  **Vlastné produkty (Komerčný predaj):**

    - *Jednorazový nákup:* Masívny príliv hotovosti v prvých 3 dňoch po launchi, následne pokles podľa vzorca:

> $$\text{Tržba}(t) = \text{Základný~zisk} \times \left( 1 - \frac{t}{\text{MaxŽivotnosť}} \right)$$

- *Mesačné predplatné (SaaS / Smart Home):* Stabilný nižší pasívny príjem, no každá neodstránená chyba znižuje počet predplatiteľov o 5 % denne.

2.  **B2B Zákazky (Kontrakty pre prežitie):**

    - Rýchle miniprojekty na 1–2 herné dni (napr. *„Dodať špehovací skript pre lokálny reťazec“*).

    - Nemajú trhový dosah, ale garantujú okamžitých 300 € – 800 € na zaplatenie miezd, ak firme hrozí debet.

3.  **Špekulatívny kapitál a pôžičky:**

    - **Banka (Klasický úver):** Okamžitých 5 000 € s denným úrokom 5 % (prísny splátkový kalendár).

    - **Rizikový fond (Venture Capital Shark):** Okamžitých 15 000 € výmenou za 30 % podielu vo firme a trvalé zníženie zisku z každého launchu o štvrtinu.

### 9.3 Prevádzkové náklady (Outflows & Overheads)

| **Nákladová položka**          | **Frekvencia** | **Výška nákladu**                   | **Logika a herný vplyv**                                                              |
|--------------------------------|----------------|-------------------------------------|---------------------------------------------------------------------------------------|
| **Mzdy zamestnancov**          | Denná          | 20 € – 120 € / osoba / deň          | Závisí od úrovne a skúseností. Ak nie sú vyplatené, Morálka padá na nulu do 24 hodín. |
| **Nájomné za poschodie**       | Denná          | 50 € (Suterén) až 500 € (Mrakodrap) | Fixná čiastka za každé odomknuté poschodie bez ohľadu na počet ľudí.                  |
| **Spotreba serverov**          | Priebežná      | 10 € / serverová skriňa / deň       | Tlačí hráča nestavať nadbytočnú infraštruktúru, kým na ňu nemá projekty.              |
| **Suroviny (Káva & Automaty)** | Podľa spotreby | 2 € / použitie kávovaru             | Každá uvarená káva mierne odčerpáva firemný účet.                                     |

### 9.4 Pasce na peniaze (Money Sinks) – Prevencia pretečenia ekonomiky

Aby hráč v pokročilej fáze nestratil motiváciu kvôli miliónom na účte, hra nasadzuje agresívne mechanizmy na odsávanie peňazí:

1.  **Hasenie škandálov (PR a Zahladzovanie):**

    - Škandál rastie exponenciálne. Zraziť 20 % škandálu stojí 1 000 € na začiatku, no pri medzinárodnej afére až 10 000 €.

2.  **Inšpekcie a právne spory:**

    - Nečakaná razia inšpektorátu práce. Hráč musí buď zaplatiť mastnú legálnu pokutu, alebo podplatiť komisára, čo stojí priamu hotovosť.

3.  **Sťahovanie a odomykanie poschodí:**

    - Každé nové poschodie a budova stojí rádovo násobky predošlej (progresívny náklad: 1 500 € ➔ 6 000 € ➔ 25 000 €).

4.  **Burzový výkup rivala (Finálny cieľ trhu):**

    - Vykúpenie kontrolného balíka akcií monopolu vyžaduje masívny kapitálový vankúš (napr. 50 000 € – 100 000 € v hotovosti).

### 9.5 Bankrot, Likvidácia a Zlatý padák

```text
[ Finančný zostatok < 0 € ]
│
▼
[ Stav povoleného debetu (-2 000 €) ] ──► Spustí sa 3-dňový odpočet na záchranu
│
┌───────┴────────────────────────┐
▼ ▼
[ Záchrana cashflowu ] [ Vypršanie lehoty: BANKROT ]
Predaj nábytku, Likvidácia pobočky, strata kampane,
prepúšťanie, rýchly úver. reštart trhu s hanbou.
```

- **Zlatý padák (Prestige mena – Golden Parachutes):**

  - Ak hráč kampaň nezbankrotuje, ale úspešne dokončí (porazí rivala), prebytočný kapitál a hodnota firmy sa prepočítajú na **Prestige body**.

  - Za tieto body hráč v globálnom strome nakupuje permanentné vylepšenia:

    - *Zľava na právnikov (-20 % ceny za hasenie škandálov).*

    - *Kvalitnejšie kávové zrná (+15 % k rýchlosti práce po vypití kávy).*

    - *Vyšší štartovací kapitál v ďalších mestách.*

### 9.6 Kódový model ekonomiky v JavaScripte

```js
class EconomySystem {
  constructor(startingCash = 2500) {
    this.cash = startingCash;
    this.overdraftLimit = -2000;
    this.bankruptcyDays = 0;
    this.dailyHistory = [];
  }
  processDailySettlement(company, building) {
    let totalWages = 0;
    company.employees.forEach(emp => {
      totalWages += emp.wage;
    });
    let totalRent = building.floors.length * building.baseRentPerFloor;
    let hardwareUpkeep = building.getDeviceUpkeep();
    let totalExpenses = totalWages + totalRent + hardwareUpkeep;
    this.cash -= totalExpenses;
    // Kontrola platobnej neschopnosti
    if (this.cash < 0) {
      this.bankruptcyDays++;
      if (this.cash < this.overdraftLimit || this.bankruptcyDays >= 3) {
        company.triggerBankruptcy();
        return;
      }
      company.triggerAlert(`POZOR: Účet v mínuse! Zostávajú \${3 - this.bankruptcyDays} dni do likvidácie!`);
    } else {
      this.bankruptcyDays = 0; // Reset varovania pri návrate do plusu
    }
    // Záznam pre graf finančného prehľadu
    this.dailyHistory.push({
      day: company.currentDay,
      cash: this.cash,
      expenses: totalExpenses
    });
  }
  canAfford(amount) {
    return (this.cash - amount) >= this.overdraftLimit;
  }
  modifyCash(amount) {
    this.cash += amount;
  }
}
```

## 10. Fázový plán vývoja krok za krokom

**Fáza 1: Herné plátno, Mriežka & Stavebný systém (Dni 1–2)**

- **Zadanie pre kód:**

  - Vytvorenie HTML kontajnera a \<canvas\> s virtuálnym rozlíšením 480×270 px (CSS image-rendering: pixelated).

  - Vykreslenie 2D mriežky 16×16 px s jednoduchým podlahovým linoleom a obvodovými stenami.

  - Zavedenie systému kolízií (collisionGrid: 0 = priechodné, 1 = prekážka).

  - Umiestnenie 3 základných objektov na kliknutie/ťuknutie: **Pracovný stôl s PC**, **Kávovar**, **Toaleta**.

**Fáza 2: Pohyb, AI & Stavový automat (Dni 3–4)**

- **Zadanie pre kód:**

  - Implementácia ľahkého A\* pathfindingu pre pohyb po voľných dlaždiciach.

  - Vytvorenie triedy Employee so 6 klesajúcimi potrebami (Energia, Zasýtenie, Pokoj, Zábava, Hygiena, Morálka).

  - Prepojenie stavov: WORKING ➔ pokles energie ➔ COFFEE_BREAK (cesta ku kávovaru a doplnenie) ➔ návrat k stolu.

  - Spustenie záchvatu DRAMA_QUEEN pri nulovom Pokoji s plošným AoE efektom na okolie.

**Fáza 3: Projektový cyklus, Červené bugy & Support (Dni 5–6)**

- **Zadanie pre kód:**

  - Spustenie projektu "Garážová appka" cez jednoduché DOM UI okno.

  - Zamestnanci pri stole generujú modré body a červené bugy.

  - Tlačidlo \[Launch\]: Vydanie na trh, výpočet denného zisku a vygenerovanie zákazníckych lístkov do Call Centra.

  - Zvoniaci stôl podpory, generovanie hluku a nutnosť operátora vybavovať tikety.

**Fáza 4: Ekonomika, Časová slučka & Leštenie (Deň 7)**

- **Zadanie pre kód:**

  - Herný cyklus: 1 deň = 45 sekúnd, denná uzávierka (odpočet miezd a pripísanie tržieb).

  - Implementácia ukazovateľa Škandálu (0–100 %).

  - Uloženie celého stavu hry do localStorage (Save/Load tlačidlo).

**10.3 Skryté Developer Cheat Menu (DevTools & Debugger)**

Pre rýchle ladenie, vyvažovanie a testovanie extrémnych emergentných situácií bude v hre zabudovaná skrytá vývojárska konzola.

**A. Spôsob aktivácie (Cross-Platform)**

- **Desktop (PC):**

  - Stlačenie klávesy vlnovky / tildy: **~** (pod klávesom Esc) alebo kombinácia **Ctrl + Shift + D**.

- **Mobil (Android / Dotykový displej):**

  - **Trojitý rýchly tap (Triple Tap)** do ľavého horného rohu obrazovky priamo na ikonu firemného loga alebo finančného stavu \[€\].

**B. Funkcie a príkazy Cheat Menu**

```text
┌────────────────────────────────────────────────────────┐
│ [DEV DEBUG CONSOLE v0.1] [X] │
├────────────────────────────────────────────────────────┤
│ [ + € 10,000 ] [ - € 5,000 ] [ Zastaviť čas ] │
│ [ Max Energia Všetkým ] [ Škandál: 0 % ] │
│ [ Spustiť DRAMA QUEEN (Náhodne) ] [ Škandál: 99 %] │
│ [ Pridať 50 Bugov ] [ Vyčistiť tikety]│
│ [ Spawn Votrelca / Sabotéra ] [ Super Rýchlosť]│
│ [ Prepnúť Heatmapu: Hluk / Pachy / Teplo ] │
└────────────────────────────────────────────────────────┘
```

| **Tlačidlo / Príkaz**      | **Čo spraví v kóde**                                                       | **Na čo to slúži pri testovaní**                                  |
|----------------------------|----------------------------------------------------------------------------|-------------------------------------------------------------------|
| **+ € 10 000 / - € 5 000** | economy.cash += 10000;                                                     | Testovanie bankrotových stavov alebo okamžitá výstavba.           |
| **Spustiť Drama Queen**    | Vyberie náhodného zamestnanca a nastaví stats.peace = 0;                   | Overenie AoE dosahu kriku a reakcie okolitých kolegov.            |
| **Hyper-Crunch (0 Pokoj)** | Všetkým zamestnancom zrazí Pokoj na 0.                                     | Test hromadného kolapsu a zlyhania poistiek (Chaos Engine).       |
| **Zaplaviť Support**       | office.pendingSupportTickets += 100;                                       | Okamžité zapnutie zvonenia liniek a testovanie hluku na poschodí. |
| **Očistiť Škandál**        | company.scandal = 0;                                                       | Záchrana firmy pred likvidáciou počas testovania.                 |
| **Spawn Sabotéra**         | Vytvorí entitu Infiltrator pri výťahu.                                     | Testovanie obrany, SBS recepcie a správania votrelca.             |
| **Toggle Debug Overlays**  | Vykreslí čísla mriežky, cesty A\* pathfindingu a farebné zóny hluku/tepla. | Vizuálne overenie, kadiaľ postavy chodia a kde narážajú.          |

**10.4 Kódová implementácia Cheat Menu v JavaScripte**

Tento kód je plne izolovaný a dá sa jednoducho zapnúť/vypnúť cez globálnu premennú DEBUG_MODE:

```js
class DevCheatMenu {
  constructor(game) {
    this.game = game;
    this.isVisible = false;
    this.tapCount = 0;
    this.tapTimer = null;
    this.createDomElement();
    this.bindInputs();
  }
  createDomElement() {
    this.panel = document.createElement('div');
    this.panel.id = 'dev-cheat-menu';
    this.panel.style.cssText = `
    display: none; position: fixed; top: 10px; left: 10px;
    background: rgba(0, 0, 0, 0.9); color: #00ff66; font-family: monospace;
    padding: 12px; border: 2px solid #00ff66; z-index: 99999;
    box-shadow: 0 0 15px rgba(0,255,102,0.4); max-width: 320px;
  `;
    this.panel.innerHTML = `
    <div style="font-weight:bold; margin-bottom:8px; display:flex; justify-content:space-between;">
    <span>[DEV CONSOLE]</span>
    <button id="dev-close" style="color:red; background:none; border:none; cursor:pointer;">[X]</button>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
    <button onclick="game.economy.modifyCash(10000)">+ €10,000</button>
    <button onclick="game.economy.modifyCash(-5000)">- €5,000</button>
    <button onclick="game.employees.forEach(e => e.stats.peace = 0)">Mass Drama</button>
    <button onclick="game.employees.forEach(e => e.stats.energy = 100)">Max Energia</button>
    <button onclick="game.pendingSupportTickets += 50">+ 50 Tiketov</button>
    <button onclick="game.pendingSupportTickets = 0">Reset Tiketov</button>
    <button onclick="game.scandal = 0">Škandál: 0%</button>
    <button onclick="game.scandal = 95">Škandál: 95%</button>
    <button onclick="game.toggleDebugOverlay()">Debug Mriežka</button>
    <button onclick="game.spawnSaboteur()">Sabotér</button>
    </div>
  `;
    document.body.appendChild(this.panel);
    document.getElementById('dev-close').onclick = () => this.toggle();
  }
  bindInputs() {
    // 1. Klávesová skratka pre PC (~ alebo Ctrl+Shift+D)
    window.addEventListener('keydown', (e) => {
      if (e.key === '~' || e.key === '`' || (e.ctrlKey && e.shiftKey && e.code === 'KeyD')) {
        this.toggle();
      }
    });
    // 2. Mobilný trigger: Trojitý tap na ľavý horný roh
    const cashUI = document.getElementById('cash-display');
    if (cashUI) {
      cashUI.addEventListener('pointerdown', () => {
        this.tapCount++;
        clearTimeout(this.tapTimer);
        this.tapTimer = setTimeout(() => { this.tapCount = 0; }, 500);
        if (this.tapCount >= 3) {
          this.tapCount = 0;
          this.toggle();
        }
      });
    }
  }
  toggle() {
    this.isVisible = !this.isVisible;
    this.panel.style.display = this.isVisible ? 'block' : 'none';
  }
}
```
