import { describe, expect, it } from 'vitest';
import { Game, BuyError } from '../src/sim/game.js';
import { TIME, ECONOMY } from '../src/data/balance.js';
import { OBJECTS } from '../src/data/objects.js';

describe('Game', () => {
  it('beží headless a emituje koniec dňa', () => {
    const game = new Game({ seed: 1 });
    const days = [];
    game.events.on('day:end', ({ day }) => days.push(day));
    const dt = 1 / TIME.TICKS_PER_SECOND;
    for (let i = 0; i < TIME.DAY_DURATION_S * 2 * TIME.TICKS_PER_SECOND + 1; i++) game.update(dt);
    expect(days).toEqual([1, 2]);
  });

  it('kúpa objektu odpočíta cenu, predaj vráti polovicu', () => {
    const game = new Game({ seed: 1 });
    const result = game.buyObject(0, 'coffee', 3, 3);
    expect(result.ok).toBe(true);
    expect(game.cash).toBe(ECONOMY.STARTING_CASH - OBJECTS.coffee.price);
    game.sellObject(0, result.object);
    expect(game.cash).toBe(ECONOMY.STARTING_CASH - OBJECTS.coffee.price / 2);
    expect(game.floors[0].objects).toHaveLength(0);
  });

  it('pod limitom debetu sa nedá kúpiť (D12)', () => {
    const game = new Game({ seed: 1 });
    game.cash = ECONOMY.OVERDRAFT_LIMIT + 50;
    expect(game.buyObject(0, 'desk', 3, 3)).toEqual({ ok: false, error: BuyError.NO_MONEY });
    game.cash = 0;
    expect(game.buyObject(0, 'desk', 3, 3).ok).toBe(true);
    expect(game.cash).toBe(-OBJECTS.desk.price);
  });

  it('neplatné umiestnenie nič nestojí', () => {
    const game = new Game({ seed: 1 });
    expect(game.buyObject(0, 'desk', 0, 0).ok).toBe(false);
    expect(game.cash).toBe(ECONOMY.STARTING_CASH);
  });
});
