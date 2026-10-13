import { TIME } from '../data/balance.js';

// Herný kalendár: pracovné dni po 45 s, mesiac = 5 dní (GDD 3.1).

export class GameClock {
  constructor({ day = 1, elapsedInDay = 0 } = {}) {
    this.day = day;
    this.elapsedInDay = elapsedInDay;
  }

  get month() {
    return Math.floor((this.day - 1) / TIME.DAYS_PER_MONTH) + 1;
  }

  /** Deň v rámci mesiaca, 1..DAYS_PER_MONTH */
  get dayOfMonth() {
    return ((this.day - 1) % TIME.DAYS_PER_MONTH) + 1;
  }

  /** Herný čas v minútach od polnoci (09:00 → 540). */
  get minuteOfDay() {
    const workMinutes = (TIME.WORKDAY_END_HOUR - TIME.WORKDAY_START_HOUR) * 60;
    return TIME.WORKDAY_START_HOUR * 60 + (this.elapsedInDay / TIME.DAY_DURATION_S) * workMinutes;
  }

  /**
   * @param {number} dt herné sekundy
   * @returns {{ dayEnded: boolean, monthEnded: boolean }}
   */
  tick(dt) {
    this.elapsedInDay += dt;
    let dayEnded = false;
    let monthEnded = false;
    while (this.elapsedInDay >= TIME.DAY_DURATION_S) {
      this.elapsedInDay -= TIME.DAY_DURATION_S;
      dayEnded = true;
      if (this.dayOfMonth === TIME.DAYS_PER_MONTH) monthEnded = true;
      this.day++;
    }
    return { dayEnded, monthEnded };
  }

  toJSON() {
    return { day: this.day, elapsedInDay: this.elapsedInDay };
  }
}
