import { ECONOMY, MARKET } from '../data/balance.js';
import { OBJECTS, SELL_REFUND_RATIO } from '../data/objects.js';
import { Rng } from '../core/rng.js';
import { EventBus } from '../core/events.js';
import { GameClock } from './clock.js';
import { FloorGrid } from './grid.js';
import { Floor } from './floor.js';

// Koreň herného stavu. Čistá logika bez DOM – beží aj v testoch (Node).

export const BuyError = Object.freeze({
  NO_MONEY: 'noMoney',
});

export class Game {
  constructor({ seed = Date.now() } = {}) {
    this.events = new EventBus();
    this.rng = new Rng(seed);
    this.clock = new GameClock();
    this.cash = ECONOMY.STARTING_CASH;
    this.scandal = 0;
    this.marketShare = { player: MARKET.PLAYER_START_SHARE, rival: MARKET.RIVAL_START_SHARE };
    // GDD 5.1 – Tier 1: suterén 12×10 dlaždíc.
    this.floors = [new Floor(FloorGrid.room(12, 10))];
  }

  /** @param {number} dt herné sekundy */
  update(dt) {
    const ended = this.clock.tick(dt);
    if (ended.dayEnded) this.events.emit('day:end', { day: this.clock.day - 1 });
    if (ended.weekEnded) this.events.emit('week:end', {});
    // Mesačná uzávierka: mzdy, nájom, úroky (D5) – implementácia v M4.
    if (ended.monthEnded) this.events.emit('month:end', { month: this.clock.monthIndex - 1 });
    if (ended.yearEnded) this.events.emit('year:end', { year: this.clock.year - 1 });
  }

  /** D12 – pod limitom debetu sa nedá nič kúpiť. */
  canAfford(amount) {
    return this.cash - amount >= ECONOMY.OVERDRAFT_LIMIT;
  }

  /**
   * Kúpi a umiestni objekt.
   * @returns {{ ok: true, object: import('./floor.js').PlacedObject } | { ok: false, error: string }}
   */
  buyObject(floorIndex, type, x, y) {
    const floor = this.floors[floorIndex];
    const def = OBJECTS[type];
    const error = floor.checkPlacement(type, x, y);
    if (error) return { ok: false, error };
    if (!this.canAfford(def.price)) return { ok: false, error: BuyError.NO_MONEY };
    this.cash -= def.price;
    const object = floor.place(type, x, y);
    this.events.emit('object:placed', { floorIndex, object });
    return { ok: true, object };
  }

  /** Predá objekt za časť ceny. Vracia získanú sumu. */
  sellObject(floorIndex, object) {
    const refund = Math.floor(OBJECTS[object.type].price * SELL_REFUND_RATIO);
    this.floors[floorIndex].remove(object);
    this.cash += refund;
    this.events.emit('object:sold', { floorIndex, object, refund });
    return refund;
  }
}
