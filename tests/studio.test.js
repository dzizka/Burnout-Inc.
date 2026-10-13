import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/game.js';
import { ProjectPhase, productScore } from '../src/sim/studio.js';
import { PRODUCT_TYPES, SUPPORT } from '../src/data/products.js';
import { TIME } from '../src/data/balance.js';

const DT = 1 / TIME.TICKS_PER_SECOND;

function run(game, seconds) {
  for (let i = 0; i < seconds / DT; i++) game.update(DT);
}

function flat(game) {
  const c = {
    ...game.candidates[0],
    skill: 1,
    decayFactors: { energy: 1, satiety: 1, peace: 1, fun: 1, hygiene: 1 },
  };
  game.candidates[0] = c;
  return game.hire(c).employee;
}

describe('productScore (D11)', () => {
  it('bez bugov a tiketov je 10, bugy a tikety ho znižujú a drží sa v 0–10', () => {
    const p = { points: 150, bugs: 0, target: 150 };
    expect(productScore(p)).toBe(10);
    expect(productScore({ ...p, bugs: 45 })).toBeCloseTo(4);
    expect(productScore(p, 1000)).toBe(7);
    expect(productScore({ ...p, bugs: 1000 })).toBe(0);
  });
});

describe('Studio', () => {
  it('vývoj → hotové → vydanie: zbiera body a bugy, pridá trh', () => {
    const game = new Game({ seed: 1 });
    expect(game.studio.startProject('mobileApp', 'oneTime', game)).toBe(true);
    expect(game.studio.startProject('clickbait', 'oneTime', game)).toBe(false);
    const ready = [];
    game.events.on('project:ready', (e) => ready.push(e));
    game.studio.addWork(PRODUCT_TYPES.mobileApp.target, null, game);
    const p = game.studio.project;
    expect(p.phase).toBe(ProjectPhase.READY);
    expect(ready).toHaveLength(1);
    expect(p.bugs).toBeCloseTo(PRODUCT_TYPES.mobileApp.target * PRODUCT_TYPES.mobileApp.bugRate);

    // Ladenie opravuje bugy
    game.studio.polish();
    game.studio.addWork(1000, null, game);
    expect(p.bugs).toBe(0);
    const before = game.marketShare.player;
    const product = game.studio.launch(game);
    expect(product.launchScore).toBe(10);
    expect(game.marketShare.player).toBeCloseTo(before + PRODUCT_TYPES.mobileApp.market);
    expect(game.studio.project).toBeNull();
  });

  it('vydanie plného bugov spôsobí škandál a tikety', () => {
    const game = new Game({ seed: 1 });
    game.studio.startProject('mobileApp', 'oneTime', game);
    game.studio.addWork(150, { stats: { peace: 10 }, activity: 'WORKING' }, game); // stres = viac bugov
    const product = game.studio.launch(game);
    expect(product.launchScore).toBeLessThan(4);
    expect(game.scandal).toBeGreaterThan(0);
    game.studio.update(1, game);
    expect(game.studio.pendingTickets).toBeCloseTo(product.bugs * SUPPORT.TICKETS_PER_BUG_S);
  });

  it('jednorazový predaj: tržba klesá s vekom a produkt po životnosti zmizne', () => {
    const game = new Game({ seed: 1 });
    game.studio.startProject('mobileApp', 'oneTime', game);
    game.studio.addWork(150, null, game);
    game.studio.polish();
    game.studio.addWork(1000, null, game);
    game.studio.launch(game);
    const cash0 = game.cash;
    game.studio.onDayEnd(game);
    const first = game.studio.revenueToday;
    expect(first).toBeGreaterThan(0);
    expect(game.cash).toBe(cash0 + first);
    game.studio.onDayEnd(game);
    expect(game.studio.revenueToday).toBeLessThan(first);
    for (let d = 0; d < PRODUCT_TYPES.mobileApp.lifetime; d++) game.studio.onDayEnd(game);
    expect(game.studio.products).toHaveLength(0);
  });

  it('predplatné stráca predplatiteľov, keď má veľa bugov', () => {
    const game = new Game({ seed: 1 });
    game.studio.startProject('mobileApp', 'subscription', game);
    game.studio.addWork(150, null, game);
    const product = game.studio.launch(game);
    game.studio.onDayEnd(game);
    expect(product.subscribers).toBeLessThan(1);
  });

  it('bez projektu práca opravuje bugy živých produktov (hotfix)', () => {
    const game = new Game({ seed: 1 });
    game.studio.startProject('mobileApp', 'oneTime', game);
    game.studio.addWork(150, null, game);
    const product = game.studio.launch(game);
    const bugs = product.bugs;
    game.studio.addWork(10, null, game);
    expect(product.bugs).toBeCloseTo(bugs - 5);
  });

  it('operátor pri stole podpory vybavuje tikety a zvonenie ruší okolie', () => {
    const game = new Game({ seed: 1 });
    const floor = game.floors[0];
    floor.place('support', 3, 2);
    floor.place('desk', 5, 2);
    const op = flat(game);
    const dev = flat(game);
    run(game, 5);
    expect(op.deskId).toBe(floor.objects[0].id);
    expect(dev.deskId).toBe(floor.objects[1].id);
    game.studio.pendingTickets = 50;
    const devPeace = dev.stats.peace;
    run(game, 2);
    expect(game.studio.ticketsHandled).toBeGreaterThan(0);
    expect(game.studio.pendingTickets).toBeLessThan(50);
    // vývojár je v okruhu zvoniaceho stola – Pokoj klesá rýchlejšie ako bežne
    expect(devPeace - dev.stats.peace).toBeGreaterThan(2 * 0.35 * 1.2);
  });

  it('nevybavené tikety zvyšujú škandál', () => {
    const game = new Game({ seed: 1 });
    game.studio.pendingTickets = 100;
    game.studio.update(10, game);
    expect(game.scandal).toBeCloseTo(100 * SUPPORT.SCANDAL_PER_TICKET_S * 10);
  });
});
