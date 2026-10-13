import { TIME } from '../data/balance.js';

// Herný kalendár (D6): pracovné dni → týždne → mesiace → roky.
// Kalendár je skomprimovaný – postavy žijú v reálnom čase, kalendár beží rýchlejšie,
// aby mesačný cyklus (výplaty, uzávierka) trval minúty, nie hodiny.

const DAYS_PER_MONTH = TIME.DAYS_PER_WEEK * TIME.WEEKS_PER_MONTH;
const DAYS_PER_YEAR = DAYS_PER_MONTH * TIME.MONTHS_PER_YEAR;

export class GameClock {
  /** @param {{ day?: number, elapsedInDay?: number }} [state] day = poradové číslo pracovného dňa od 1 */
  constructor({ day = 1, elapsedInDay = 0 } = {}) {
    this.day = day;
    this.elapsedInDay = elapsedInDay;
  }

  /** Deň v týždni, 1 (pondelok) .. DAYS_PER_WEEK */
  get weekday() {
    return ((this.day - 1) % TIME.DAYS_PER_WEEK) + 1;
  }

  /** Týždeň v mesiaci, 1 .. WEEKS_PER_MONTH */
  get weekOfMonth() {
    return (Math.floor((this.day - 1) / TIME.DAYS_PER_WEEK) % TIME.WEEKS_PER_MONTH) + 1;
  }

  /** Mesiac v roku, 1 .. MONTHS_PER_YEAR */
  get monthOfYear() {
    return (Math.floor((this.day - 1) / DAYS_PER_MONTH) % TIME.MONTHS_PER_YEAR) + 1;
  }

  /** Poradové číslo mesiaca od začiatku kampane, od 1. */
  get monthIndex() {
    return Math.floor((this.day - 1) / DAYS_PER_MONTH) + 1;
  }

  get year() {
    return Math.floor((this.day - 1) / DAYS_PER_YEAR) + 1;
  }

  /** Kozmetický čas v minútach od polnoci (09:00 → 540). */
  get minuteOfDay() {
    const workMinutes = (TIME.WORKDAY_END_HOUR - TIME.WORKDAY_START_HOUR) * 60;
    return TIME.WORKDAY_START_HOUR * 60 + (this.elapsedInDay / TIME.DAY_DURATION_S) * workMinutes;
  }

  /**
   * @param {number} dt herné sekundy
   * @returns {{ dayEnded: boolean, weekEnded: boolean, monthEnded: boolean, yearEnded: boolean }}
   */
  tick(dt) {
    this.elapsedInDay += dt;
    const result = { dayEnded: false, weekEnded: false, monthEnded: false, yearEnded: false };
    while (this.elapsedInDay >= TIME.DAY_DURATION_S) {
      this.elapsedInDay -= TIME.DAY_DURATION_S;
      result.dayEnded = true;
      if (this.day % TIME.DAYS_PER_WEEK === 0) result.weekEnded = true;
      if (this.day % DAYS_PER_MONTH === 0) result.monthEnded = true;
      if (this.day % DAYS_PER_YEAR === 0) result.yearEnded = true;
      this.day++;
    }
    return result;
  }

  toJSON() {
    return { day: this.day, elapsedInDay: this.elapsedInDay };
  }
}
