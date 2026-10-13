import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/game.js';
import { deserializeGame, serializeGame, SAVE_VERSION } from '../src/sim/save.js';
import { TIME } from '../src/data/balance.js';

const DT = 1 / TIME.TICKS_PER_SECOND;

function playedGame() {
  const game = new Game({ seed: 42 });
  game.setupStarterOffice();
  const f = game.floors[0];
  f.place('coffee', 10, 2);
  f.place('support', 6, 6);
  game.refreshCandidates();
  game.hire(game.candidates[0]);
  game.studio.startProject('mobileApp', 'subscription', game);
  game.takeLoan();
  for (let i = 0; i < 30 / DT; i++) game.update(DT);
  return game;
}

describe('save/load', () => {
  it('prežije cestu cez JSON bez straty stavu', () => {
    const game = playedGame();
    const json = JSON.parse(JSON.stringify(serializeGame(game)));
    expect(json.version).toBe(SAVE_VERSION);
    const loaded = deserializeGame(json);
    expect(loaded.cash).toBe(game.cash);
    expect(loaded.clock.day).toBe(game.clock.day);
    expect(loaded.floors[0].objects.map((o) => [o.id, o.type, o.x, o.y])).toEqual(
      game.floors[0].objects.map((o) => [o.id, o.type, o.x, o.y]),
    );
    expect(loaded.floors[0].objectAt(10, 2)?.type).toBe('coffee');
    expect(loaded.employees.map((e) => [e.id, e.name, e.wage, e.deskId])).toEqual(
      game.employees.map((e) => [e.id, e.name, e.wage, e.deskId]),
    );
    expect(loaded.studio.project.points).toBeCloseTo(game.studio.project.points);
    expect(loaded.economy.loans).toEqual(game.economy.loans);
    expect(loaded.rng.state).toBe(game.rng.state);
  });

  it('načítaná hra pokračuje: zamestnanci sa vrátia k stolom a pracujú', () => {
    const loaded = deserializeGame(JSON.parse(JSON.stringify(serializeGame(playedGame()))));
    const before = loaded.workDone;
    for (let i = 0; i < 20 / DT; i++) loaded.update(DT);
    expect(loaded.workDone).toBeGreaterThan(before);
    // nové objekty nedostanú duplicitné id
    const obj = loaded.floors[0].place('toilet', 1, 7);
    expect(loaded.floors[0].objects.filter((o) => o.id === obj.id)).toHaveLength(1);
  });

  it('odmietne neznámu verziu', () => {
    expect(() => deserializeGame({ version: 999 })).toThrow();
  });
});
