// Všetky balansové čísla na jednom mieste. Zdroj: docs/GDD.md (kapitola v komentári).
// Pri zmene hodnoty oproti GDD uveď dôvod v docs/DESIGN_DECISIONS.md.

export const TIME = {
  /** Počet simulačných krokov za hernú sekundu (pevný krok). */
  TICKS_PER_SECOND: 20,
  /** GDD 3.1 – 1 pracovný deň trvá 45 reálnych sekúnd pri rýchlosti 1x. */
  DAY_DURATION_S: 45,
  /** GDD 3.1 – pracovná doba 09:00–17:00. */
  WORKDAY_START_HOUR: 9,
  WORKDAY_END_HOUR: 17,
  /** GDD 3.1 – 1 herný mesiac = 5 pracovných dní. */
  DAYS_PER_MONTH: 5,
  /** GDD 3.1 – ovládanie rýchlosti (0 = pauza). */
  SPEEDS: [0, 1, 2, 3],
};

export const ECONOMY = {
  /** GDD 9.6 */
  STARTING_CASH: 2500,
  /** GDD 9.5 */
  OVERDRAFT_LIMIT: -2000,
};

export const MARKET = {
  /** GDD 3.3D / 7.1 – štartovacie trhové podiely v %. */
  PLAYER_START_SHARE: 5,
  RIVAL_START_SHARE: 85,
};

export const RENDER = {
  /** GDD 2.1 – virtuálne rozlíšenie a veľkosť dlaždice. */
  VIRTUAL_WIDTH: 480,
  VIRTUAL_HEIGHT: 270,
  TILE_SIZE: 16,
};
