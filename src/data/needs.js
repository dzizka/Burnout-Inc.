// Potreby zamestnancov a parametre ich správania (GDD 4.1–4.3, D6–D10).
// Rýchlosti sú v jednotkách za reálnu sekundu pri 1x. Cieľ podľa D6/D7: zamestnanec
// si dá prestávku zhruba raz za 30 s (≈3 herné dni) a ~75 % času pracuje.
// Súčet rýchlostí ≈ 75 / 30 s. Overuje `npm run sim`.

export const NEED_KEYS = ['energy', 'satiety', 'peace', 'fun', 'hygiene', 'morale'];

/** Pod touto hodnotou zamestnanec prestáva pracovať a ide si potrebu doplniť. */
export const CRITICAL = 25;

/** Prirodzený úbytok za sekundu (Morálka sa rieši zvlášť). */
export const DECAY = {
  energy: 0.8,
  satiety: 0.5,
  peace: 0.35,
  fun: 0.4,
  hygiene: 0.45,
};

/** Individuálna odchýlka rýchlostí (±15 %), aby sa zamestnanci nestriedali naraz. */
export const DECAY_VARIATION = 0.15;

export const MORALE = {
  /** Úbytok za sekundu za každú potrebu v kritickej zóne. */
  DECAY_PER_LOW_NEED: 0.2,
  /** Pomalé zotavenie, keď sú všetky potreby nad polovicou. */
  RECOVER: 0.15,
};

/**
 * Ktoré objekty dopĺňajú potrebu (v poradí preferencie) a čo spravia (GDD 4.2).
 * fun nemá objekt – rieši sa prankom (PRANK_COWORKER).
 */
export const NEED_SOURCES = {
  energy: ['coffee'],
  satiety: ['vending'],
  hygiene: ['toilet'],
  // D10 – bez fajčiarskeho kútika sa fajčí na WC.
  peace: ['smoking', 'toilet'],
};

/** Poradie kontroly kritických potrieb (GDD 4.4). */
export const NEED_PRIORITY = ['hygiene', 'satiety', 'energy', 'peace', 'fun'];

/** Činnosť pri objekte: trvanie v s a vedľajšie efekty. Potreba, kvôli ktorej prišiel, sa doplní na 100. */
export const USE = {
  coffee: { activity: 'COFFEE_BREAK', duration: 4, side: { hygiene: -20 } },
  vending: { activity: 'VENDING_MACHINE', duration: 4, side: { hygiene: -15 } },
  toilet: { activity: 'TOILET', duration: 5, side: {} },
  smoking: { activity: 'SMOKE_BREAK', duration: 6, side: {} },
};

export const BEHAVIOR = {
  /** Rýchlosť chôdze v dlaždiciach za sekundu. */
  WALK_SPEED: 3,
  /** Hlad na nule spomalí chôdzu o 60 % (GDD 4.1). */
  STARVING_SPEED_FACTOR: 0.4,
  /** Čakanie v rade (obsadený objekt) zrýchľuje pád Pokoja (GDD 4.2 TOILET). */
  WAITING_PEACE_FACTOR: 2,
  /** GDD 4.2 HYPERACTIVE – šanca po káve pri takmer plnom Pokoji. */
  HYPER: { CHANCE: 0.1, MIN_PEACE: 75, DURATION: 10, WORK_FACTOR: 3, DECAY_FACTOR: 3 },
  /** D8 – jednorazový AoE zásah okolia. */
  DRAMA: { DURATION: 8, RADIUS: 4, PEACE: -30, MORALE: -15, RECOVER_PEACE: 40, COOLDOWN: 20 },
  /** GDD 4.1 – zaspí na klávesnici. */
  ASLEEP: { DURATION: 15, RECOVER_ENERGY: 40 },
  /** GDD 4.1 – totálna prokrastinácia. */
  SLACKING: { DURATION: 10, RECOVER_FUN: 60 },
  /** D9 – 60 % bežný / 30 % vyliata káva / 10 % obeť vybuchne. */
  PRANK: {
    DURATION: 4,
    NORMAL: 0.6,
    SPILL: 0.3,
    NORMAL_PEACE: -20,
    SPILL_PEACE: -40,
    COOLDOWN: 30,
  },
  /** GDD 4.1 – hygienická katastrofa: morálka okolia padá. */
  HYGIENE_COLLAPSE: { RADIUS: 4, MORALE: -20 },
  /** D10 – fajčenie na WC zníži Hygienu ostatným na poschodí. */
  SMOKE_IN_TOILET_HYGIENE: -10,
  /** D10 – fallback pri chýbajúcom objekte. */
  MISSING: { REFILL_FACTOR: 1.5, MORALE_DECAY: 0.3, WORK_FACTOR: 0.5 },
  /** Štrajk končí, keď Morálka vystúpi nad túto hodnotu (napr. po bonuse). */
  STRIKE_END_MORALE: 50,
};

/** Akcie hráča na karte zamestnanca (GDD 8.2). */
export const PLAYER_ACTIONS = {
  BONUS_COST: 100,
};
