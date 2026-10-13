import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/game.js';
import { TIME } from '../src/data/balance.js';

describe('Game', () => {
  it('beží headless a emituje koniec dňa', () => {
    const game = new Game({ seed: 1 });
    const days = [];
    game.events.on('day:end', ({ day }) => days.push(day));
    const dt = 1 / TIME.TICKS_PER_SECOND;
    for (let i = 0; i < TIME.DAY_DURATION_S * 2 * TIME.TICKS_PER_SECOND + 1; i++) game.update(dt);
    expect(days).toEqual([1, 2]);
  });
});
