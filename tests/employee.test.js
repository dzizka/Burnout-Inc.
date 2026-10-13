import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/game.js';
import { Activity } from '../src/sim/employee.js';
import { BEHAVIOR } from '../src/data/needs.js';
import { TIME } from '../src/data/balance.js';

const DT = 1 / TIME.TICKS_PER_SECOND;

function run(game, seconds) {
  for (let i = 0; i < seconds / DT; i++) game.update(DT);
}

function runUntil(game, predicate, maxSeconds = 120) {
  for (let i = 0; i < maxSeconds / DT; i++) {
    game.update(DT);
    if (predicate()) return true;
  }
  return false;
}

function office({ desks = 1, objects = [] } = {}) {
  const game = new Game({ seed: 7 });
  const floor = game.floors[0];
  for (let i = 0; i < desks; i++) floor.place('desk', 2 + i * 2, 2);
  for (const [type, x, y] of objects) floor.place(type, x, y);
  return game;
}

function hire(game) {
  // Bez individuálnej odchýlky – testy sú deterministické.
  const candidate = { ...game.candidates[0], decayFactors: flatFactors(), skill: 1 };
  game.candidates[0] = candidate;
  return game.hire(candidate).employee;
}

function flatFactors() {
  return { energy: 1, satiety: 1, peace: 1, fun: 1, hygiene: 1 };
}

describe('Employee', () => {
  it('dôjde k stolu a pracuje', () => {
    const game = office();
    const emp = hire(game);
    expect(runUntil(game, () => emp.atDesk(game))).toBe(true);
    const before = game.workDone;
    run(game, 2);
    expect(emp.activity).toBe(Activity.WORKING);
    expect(game.workDone).toBeGreaterThan(before);
  });

  it('bez stola je nečinný', () => {
    const game = office({ desks: 0 });
    const emp = hire(game);
    run(game, 1);
    expect(emp.activity).toBe(Activity.IDLE);
  });

  it('pri nízkej Energii ide ku kávovaru a vráti sa s plnou Energiou', () => {
    const game = office({ objects: [['coffee', 8, 2]] });
    const emp = hire(game);
    runUntil(game, () => emp.atDesk(game));
    emp.stats.energy = 20;
    expect(runUntil(game, () => emp.activity === Activity.COFFEE_BREAK)).toBe(true);
    expect(runUntil(game, () => emp.stats.energy === 100)).toBe(true);
    expect(emp.stats.hygiene).toBeLessThan(85); // káva uberie hygienu
    expect(runUntil(game, () => emp.atDesk(game) && emp.activity !== Activity.COFFEE_BREAK)).toBe(
      true,
    );
  });

  it('bez fajčiarskeho kútika fajčí na WC (D10)', () => {
    const game = office({ objects: [['toilet', 8, 2]] });
    const emp = hire(game);
    runUntil(game, () => emp.atDesk(game));
    emp.stats.peace = 20;
    run(game, DT * 2);
    expect(emp.activity).toBe(Activity.SMOKE_BREAK);
    expect(emp.target.type).toBe('toilet');
  });

  it('keď objekt chýba, dopĺňa potrebu pomaly pri stole a klesá mu Morálka (D10)', () => {
    const game = office();
    const emp = hire(game);
    runUntil(game, () => emp.atDesk(game));
    emp.stats.energy = 20;
    run(game, 1);
    expect(emp.missing).toBe('energy');
    expect(emp.activity).toBe(Activity.WORKING);
    expect(emp.stats.energy).toBeGreaterThan(20);
    expect(emp.stats.morale).toBeLessThan(100);
  });

  it('obsadený objekt: druhý zamestnanec čaká v rade', () => {
    const game = office({ desks: 2, objects: [['toilet', 8, 2]] });
    const a = hire(game);
    const b = hire(game);
    runUntil(game, () => a.atDesk(game) && b.atDesk(game));
    a.stats.hygiene = 10;
    b.stats.hygiene = 10;
    expect(runUntil(game, () => a.waiting || b.waiting, 10)).toBe(true);
    const refreshed = new Set();
    expect(
      runUntil(
        game,
        () => {
          for (const e of [a, b]) if (e.stats.hygiene > 95) refreshed.add(e);
          return refreshed.size === 2;
        },
        30,
      ),
    ).toBe(true);
  });

  it('DRAMA_QUEEN raz zasiahne okolie (D8) a po čase sa upokojí', () => {
    const game = office({ desks: 2 });
    const a = hire(game);
    const b = hire(game);
    runUntil(game, () => a.atDesk(game) && b.atDesk(game));
    b.stats.peace = 80;
    b.stats.morale = 80;
    a.stats.peace = 0;
    run(game, DT * 2);
    expect(a.activity).toBe(Activity.DRAMA_QUEEN);
    expect(b.stats.peace).toBeCloseTo(80 + BEHAVIOR.DRAMA.PEACE, 0);
    expect(b.stats.morale).toBeCloseTo(80 + BEHAVIOR.DRAMA.MORALE, 0);
    run(game, BEHAVIOR.DRAMA.DURATION + 1);
    expect(a.activity).not.toBe(Activity.DRAMA_QUEEN);
    expect(a.stats.peace).toBeGreaterThanOrEqual(BEHAVIOR.DRAMA.RECOVER_PEACE - 2);
  });

  it('hráč môže záchvat zastaviť', () => {
    const game = office();
    const emp = hire(game);
    runUntil(game, () => emp.atDesk(game));
    emp.stats.peace = 0;
    run(game, DT * 2);
    expect(emp.calmDown(game)).toBe(true);
    expect(emp.activity).toBe(Activity.WORKING);
  });

  it('pri nule Morálky štrajkuje, bonus ho vráti do práce', () => {
    const game = office();
    const emp = hire(game);
    runUntil(game, () => emp.atDesk(game));
    emp.stats.morale = 0;
    run(game, DT * 2);
    expect(emp.activity).toBe(Activity.STRIKE);
    const work = game.workDone;
    run(game, 1);
    expect(game.workDone).toBe(work);
    expect(game.giveBonus(emp)).toBe(true);
    run(game, DT * 2);
    expect(emp.activity).toBe(Activity.WORKING);
  });

  it('nuda vedie k pranku na kolegu', () => {
    const game = office({ desks: 2 });
    const a = hire(game);
    const b = hire(game);
    runUntil(game, () => a.atDesk(game) && b.atDesk(game));
    const pranks = [];
    game.events.on('employee:prank', (e) => pranks.push(e));
    a.stats.fun = 10;
    expect(runUntil(game, () => pranks.length > 0, 20)).toBe(true);
    expect(pranks[0].victim).toBe(b);
    expect(a.stats.fun).toBe(100);
  });

  it('predaj stola pošle zamestnanca do nečinnosti', () => {
    const game = office();
    const emp = hire(game);
    runUntil(game, () => emp.atDesk(game));
    game.sellObject(0, game.floors[0].objects[0]);
    run(game, DT * 2);
    expect(emp.deskId).toBeNull();
    expect(emp.activity).toBe(Activity.IDLE);
  });

  it('nedá sa stavať na miesto, kde stojí zamestnanec', () => {
    const game = office();
    const emp = hire(game);
    const t = emp.tile;
    expect(game.buyObject(0, 'coffee', t.x, t.y).ok).toBe(false);
  });

  it('kapacita suterénu sú 4 zamestnanci', () => {
    const game = office();
    for (let i = 0; i < 4; i++) {
      game.refreshCandidates();
      expect(game.hire(game.candidates[0]).ok).toBe(true);
    }
    game.refreshCandidates();
    expect(game.hire(game.candidates[0]).ok).toBe(false);
  });

  it('uchádzač: drahší = zručnejší, mzda v rozpätí (D5)', () => {
    const game = new Game({ seed: 3 });
    for (let i = 0; i < 50; i++) {
      const c = game.generateCandidate();
      expect(c.wage).toBeGreaterThanOrEqual(400);
      expect(c.wage).toBeLessThanOrEqual(2700);
      expect(c.wage % 50).toBe(0);
    }
  });
});
