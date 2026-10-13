import { ECONOMY, MARKET } from '../data/balance.js';
import { Rng } from '../core/rng.js';
import { EventBus } from '../core/events.js';
import { GameClock } from './clock.js';
import { FloorGrid } from './grid.js';

// Koreň herného stavu. Čistá logika bez DOM – beží aj v testoch (Node).

export class Game {
  constructor({ seed = Date.now() } = {}) {
    this.events = new EventBus();
    this.rng = new Rng(seed);
    this.clock = new GameClock();
    this.cash = ECONOMY.STARTING_CASH;
    this.scandal = 0;
    this.marketShare = { player: MARKET.PLAYER_START_SHARE, rival: MARKET.RIVAL_START_SHARE };
    // GDD 5.1 – Tier 1: suterén 12×10 dlaždíc.
    this.floors = [FloorGrid.room(12, 10)];
  }

  /** @param {number} dt herné sekundy */
  update(dt) {
    const { dayEnded, monthEnded } = this.clock.tick(dt);
    if (dayEnded) this.events.emit('day:end', { day: this.clock.day - 1 });
    if (monthEnded) this.events.emit('month:end', { month: this.clock.month - 1 });
  }
}
