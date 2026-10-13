// Všetky balansové čísla na jednom mieste. Zdroj: docs/GDD.md (kapitola v komentári)
// a docs/DESIGN_DECISIONS.md (Dx). Pri zmene hodnoty uveď dôvod v DESIGN_DECISIONS.md.

export const TIME = {
  /** Počet simulačných krokov za hernú sekundu (pevný krok). */
  TICKS_PER_SECOND: 20,
  /**
   * D6 – kalendár je skomprimovaný: pracovný deň 9 s pri 1x → týždeň 45 s,
   * mesiac 3 min, rok 36 min (pri 3x: mesiac 1 min, rok 12 min).
   */
  DAY_DURATION_S: 9,
  DAYS_PER_WEEK: 5,
  WEEKS_PER_MONTH: 4,
  MONTHS_PER_YEAR: 12,
  /** GDD 3.1 – kozmetické hodiny v HUD: pracovná doba 09:00–17:00. */
  WORKDAY_START_HOUR: 9,
  WORKDAY_END_HOUR: 17,
  /** GDD 3.1 – ovládanie rýchlosti (0 = pauza). */
  SPEEDS: [0, 1, 2, 3],
};

export const ECONOMY = {
  /** GDD 9.6 – štartovací kapitál (prebalansovať s mesačnými mzdami v M4). */
  STARTING_CASH: 2500,
  /** D12 – pod týmto zostatkom sa nedá nič kúpiť. */
  OVERDRAFT_LIMIT: -2000,
  /** D12 – počet mesačných uzávierok v mínuse, po ktorých nastane bankrot. */
  BANKRUPTCY_GRACE_MONTHS: 1,
  /** D5 – mesačná mzda (GDD 9.3: 20–120 €/deň × 20 pracovných dní). */
  MONTHLY_WAGE_RANGE: [400, 2400],
  /** D13 – bankový úver. */
  LOAN: {
    AMOUNT: 5000,
    MONTHLY_INTEREST: 0.05,
    TERM_MONTHS: 6,
    /** Každý ďalší súbežný úver má úrok vyšší o túto hodnotu. */
    INTEREST_STEP_PER_LOAN: 0.02,
  },
};

export const MARKET = {
  /** GDD 3.3D / 7.1 – štartovacie trhové podiely v %. */
  PLAYER_START_SHARE: 5,
  RIVAL_START_SHARE: 85,
  /** D4 – 2. hviezda pri podiele rivala pod 15 %, Hostile Takeover pod 10 %. */
  TWO_STAR_RIVAL_SHARE: 15,
  TAKEOVER_RIVAL_SHARE: 10,
};

export const RENDER = {
  /** GDD 2.1 – virtuálne rozlíšenie a veľkosť dlaždice. */
  VIRTUAL_WIDTH: 480,
  VIRTUAL_HEIGHT: 270,
  TILE_SIZE: 16,
};
