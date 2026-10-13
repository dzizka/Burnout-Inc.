import { describe, expect, it } from 'vitest';
import { GameClock } from '../src/sim/clock.js';
import { TIME } from '../src/data/balance.js';

describe('GameClock', () => {
  it('deň začína o 09:00 a končí o 17:00', () => {
    const clock = new GameClock();
    expect(clock.minuteOfDay).toBe(9 * 60);
    clock.tick(TIME.DAY_DURATION_S / 2);
    expect(clock.minuteOfDay).toBe(13 * 60);
  });

  it('po 45 s prejde na ďalší deň', () => {
    const clock = new GameClock();
    expect(clock.tick(TIME.DAY_DURATION_S - 0.01).dayEnded).toBe(false);
    expect(clock.tick(0.01).dayEnded).toBe(true);
    expect(clock.day).toBe(2);
  });

  it('mesiac má 5 dní', () => {
    const clock = new GameClock();
    const monthEnds = [];
    for (let d = 1; d <= 10; d++) {
      if (clock.tick(TIME.DAY_DURATION_S).monthEnded) monthEnds.push(d);
    }
    expect(monthEnds).toEqual([5, 10]);
    expect(clock.month).toBe(3);
    expect(clock.dayOfMonth).toBe(1);
  });
});
