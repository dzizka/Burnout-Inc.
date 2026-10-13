import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/game.js';
import { annuityPayment, Category } from '../src/sim/economy.js';
import { ECONOMY, SCANDAL, TIME } from '../src/data/balance.js';

const MONTH_S = TIME.DAY_DURATION_S * TIME.DAYS_PER_WEEK * TIME.WEEKS_PER_MONTH;

function hireCheap(game, wage) {
  const c = { ...game.candidates[0], wage };
  game.candidates[0] = c;
  return game.hire(c).employee;
}

describe('annuityPayment (D13)', () => {
  it('5 000 € na 6 mesiacov pri 5 % mesačne ≈ 985 €', () => {
    expect(Math.round(annuityPayment(5000, 0.05, 6))).toBe(985);
  });
});

describe('Economy', () => {
  it('mesačná uzávierka strhne mzdy a nájom a uloží výkaz', () => {
    const game = new Game({ seed: 1 });
    hireCheap(game, 1000);
    const cash = game.cash;
    const reports = [];
    game.events.on('month:end', (e) => reports.push(e.report));
    game.closeMonth(1);
    expect(game.cash).toBe(cash - 1000 - ECONOMY.RENT_PER_MONTH);
    expect(reports[0].items[Category.WAGES]).toBe(-1000);
    expect(reports[0].items[Category.RENT]).toBe(-ECONOMY.RENT_PER_MONTH);
    expect(game.economy.history).toHaveLength(1);
  });

  it('uzávierka nastane po mesiaci herného času', () => {
    const game = new Game({ seed: 1 });
    const months = [];
    game.events.on('month:end', (e) => months.push(e.month));
    game.update(MONTH_S);
    expect(months).toEqual([1]);
    expect(game.cash).toBe(ECONOMY.STARTING_CASH - ECONOMY.RENT_PER_MONTH);
  });

  it('bankrot až po druhej zápornej uzávierke za sebou (D12)', () => {
    const game = new Game({ seed: 1 });
    const over = [];
    game.events.on('game:over', (e) => over.push(e));
    game.cash = -100;
    game.closeMonth(1);
    expect(game.over).toBeNull();
    expect(game.economy.negativeMonths).toBe(1);
    game.closeMonth(2);
    expect(game.over).toEqual({ reason: 'bankrupt' });
    expect(over).toHaveLength(1);
  });

  it('návrat do plusu zruší lehotu', () => {
    const game = new Game({ seed: 1 });
    game.cash = -100;
    game.closeMonth(1);
    game.cash = 5000;
    game.closeMonth(2);
    expect(game.economy.negativeMonths).toBe(0);
  });

  it('úver: peniaze hneď, splátky pri uzávierkach, ďalší je drahší (D13)', () => {
    const game = new Game({ seed: 1 });
    const loan = game.takeLoan();
    expect(game.cash).toBe(ECONOMY.STARTING_CASH + ECONOMY.LOAN.AMOUNT);
    expect(loan.payment).toBe(985);
    expect(game.economy.loanOffer().rate).toBeCloseTo(0.07);
    const before = game.cash;
    game.closeMonth(1);
    expect(game.cash).toBe(before - 985 - ECONOMY.RENT_PER_MONTH);
    for (let m = 2; m <= ECONOMY.LOAN.TERM_MONTHS; m++) {
      game.cash = 100000;
      game.closeMonth(m);
    }
    expect(game.economy.loans).toHaveLength(0);
  });

  it('banka nepožičia viac ako MAX_ACTIVE úverov', () => {
    const game = new Game({ seed: 1 });
    for (let i = 0; i < ECONOMY.LOAN.MAX_ACTIVE; i++) expect(game.takeLoan()).not.toBeNull();
    expect(game.takeLoan()).toBeNull();
  });

  it('príjem z úveru sa nepočíta do čistého zisku mesiaca', () => {
    const game = new Game({ seed: 1 });
    game.takeLoan();
    game.closeMonth(1);
    expect(game.economy.history[0].net).toBe(-ECONOMY.RENT_PER_MONTH - 985);
  });
});

describe('Škandál (GDD 6.5)', () => {
  it('100 % = likvidácia', () => {
    const game = new Game({ seed: 1 });
    game.addScandal(150);
    expect(game.over).toEqual({ reason: 'scandal' });
  });

  it('prahy znižujú predaje a razia pridá pokutu', () => {
    const game = new Game({ seed: 1 });
    expect(game.scandalRevenueFactor()).toBe(1);
    game.scandal = SCANDAL.MEDIA;
    expect(game.scandalRevenueFactor()).toBe(SCANDAL.MEDIA_REVENUE_FACTOR);
    game.scandal = SCANDAL.RAID;
    expect(game.scandalRevenueFactor()).toBe(SCANDAL.RAID_REVENUE_FACTOR);
    const cash = game.cash;
    game.closeMonth(1);
    expect(game.cash).toBe(cash - SCANDAL.RAID_FINE - ECONOMY.RENT_PER_MONTH);
  });

  it('PR kampaň zníži škandál a je drahšia pri vyššom škandále', () => {
    const game = new Game({ seed: 1 });
    game.scandal = 10;
    const cheap = game.prCost();
    game.scandal = 60;
    expect(game.prCost()).toBeGreaterThan(cheap);
    const cost = game.prCost();
    const cash = game.cash;
    expect(game.prCampaign()).toBe(true);
    expect(game.scandal).toBe(60 - SCANDAL.PR_REDUCTION);
    expect(game.cash).toBe(cash - cost);
  });

  it('obetný baránok: −30 % škandálu, ostatným klesne morálka', () => {
    const game = new Game({ seed: 1 });
    const a = hireCheap(game, 500);
    game.refreshCandidates();
    const b = hireCheap(game, 500);
    game.scandal = 50;
    game.scapegoat(a);
    expect(game.employees).toEqual([b]);
    expect(game.scandal).toBe(20);
    expect(b.stats.morale).toBe(50);
  });

  it('škandál denne pomaly vyprcháva', () => {
    const game = new Game({ seed: 1 });
    game.scandal = 10;
    game.update(TIME.DAY_DURATION_S);
    expect(game.scandal).toBeCloseTo(10 - SCANDAL.DECAY_PER_DAY);
  });
});
