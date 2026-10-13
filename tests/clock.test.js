import { describe, expect, it } from 'vitest';
import { GameClock } from '../src/sim/clock.js';
import { TIME } from '../src/data/balance.js';

const DAY = TIME.DAY_DURATION_S;

function advanceDays(clock, days) {
  const ends = { week: 0, month: 0, year: 0 };
  for (let i = 0; i < days; i++) {
    const r = clock.tick(DAY);
    if (r.weekEnded) ends.week++;
    if (r.monthEnded) ends.month++;
    if (r.yearEnded) ends.year++;
  }
  return ends;
}

describe('GameClock', () => {
  it('pracovný deň ide od 09:00 do 17:00', () => {
    const clock = new GameClock();
    expect(clock.minuteOfDay).toBe(9 * 60);
    clock.tick(DAY / 2);
    expect(clock.minuteOfDay).toBe(13 * 60);
  });

  it('začína v pondelok, 1. týždeň, január, rok 1', () => {
    const clock = new GameClock();
    expect([clock.weekday, clock.weekOfMonth, clock.monthOfYear, clock.year]).toEqual([1, 1, 1, 1]);
  });

  it('5 dní = týždeň, 4 týždne = mesiac, 12 mesiacov = rok', () => {
    const clock = new GameClock();
    const ends = advanceDays(clock, 5 * 4 * 12);
    expect(ends).toEqual({ week: 48, month: 12, year: 1 });
    expect([clock.weekday, clock.weekOfMonth, clock.monthOfYear, clock.year]).toEqual([1, 1, 1, 2]);
    expect(clock.monthIndex).toBe(13);
  });

  it('mesiac trvá pri 1x 3 minúty reálneho času (D6)', () => {
    const seconds = DAY * TIME.DAYS_PER_WEEK * TIME.WEEKS_PER_MONTH;
    expect(seconds).toBe(180);
  });

  it('piatok 3. týždňa marca', () => {
    const clock = new GameClock({ day: 2 * 20 + 2 * 5 + 5 });
    expect(clock.weekday).toBe(5);
    expect(clock.weekOfMonth).toBe(3);
    expect(clock.monthOfYear).toBe(3);
  });
});
