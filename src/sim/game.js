import { ECONOMY, MARKET } from '../data/balance.js';
import { OBJECTS, SELL_REFUND_RATIO } from '../data/objects.js';
import { BEHAVIOR, DECAY, DECAY_VARIATION, PLAYER_ACTIONS, CRITICAL } from '../data/needs.js';
import {
  CANDIDATE_COUNT,
  CHARACTER_VARIANTS,
  HAIR_COLORS,
  MAX_STAFF_TIER1,
  NAMES,
  SHIRT_COLORS,
  SKILL_RANGE,
  SKIN_COLORS,
  WAGE_NOISE,
  WAGE_RANGE,
} from '../data/staff.js';
import { Rng } from '../core/rng.js';
import { EventBus } from '../core/events.js';
import { GameClock } from './clock.js';
import { FloorGrid } from './grid.js';
import { Floor, PlaceError } from './floor.js';
import { Employee, Activity } from './employee.js';
import { findPath } from './pathfinding.js';

// Koreň herného stavu. Čistá logika bez DOM – beží aj v testoch (Node).

export const BuyError = Object.freeze({
  NO_MONEY: 'noMoney',
});

export const HireError = Object.freeze({
  FULL: 'full',
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
    /** @type {Employee[]} */
    this.employees = [];
    this.maxStaff = MAX_STAFF_TIER1;
    this.nextEmployeeId = 1;
    /** Celková odvedená práca (body vývoja – použije M3). */
    this.workDone = 0;
    this.candidates = [];
    this.refreshCandidates();
  }

  /** @param {number} dt herné sekundy */
  update(dt) {
    for (const employee of this.employees) employee.update(dt, this);
    const ended = this.clock.tick(dt);
    if (ended.dayEnded) this.events.emit('day:end', { day: this.clock.day - 1 });
    if (ended.weekEnded) {
      this.refreshCandidates();
      this.events.emit('week:end', {});
    }
    // Mesačná uzávierka: mzdy, nájom, úroky (D5) – implementácia v M4.
    if (ended.monthEnded) this.events.emit('month:end', { month: this.clock.monthIndex - 1 });
    if (ended.yearEnded) this.events.emit('year:end', { year: this.clock.year - 1 });
  }

  // --- stavanie ------------------------------------------------------------------

  /** D12 – pod limitom debetu sa nedá nič kúpiť. */
  canAfford(amount) {
    return this.cash - amount >= ECONOMY.OVERDRAFT_LIMIT;
  }

  /** Overí umiestnenie vrátane toho, či na mieste nestojí zamestnanec. */
  checkPlacement(floorIndex, type, x, y) {
    const error = this.floors[floorIndex].checkPlacement(type, x, y);
    if (error) return error;
    const def = OBJECTS[type];
    const occupied = this.employees.some((e) => {
      if (e.floorIndex !== floorIndex) return false;
      const t = e.tile;
      return t.x >= x && t.x < x + def.width && t.y >= y && t.y < y + def.height;
    });
    return occupied ? PlaceError.BLOCKED : null;
  }

  /**
   * Kúpi a umiestni objekt.
   * @returns {{ ok: true, object: import('./floor.js').PlacedObject } | { ok: false, error: string }}
   */
  buyObject(floorIndex, type, x, y) {
    const def = OBJECTS[type];
    const error = this.checkPlacement(floorIndex, type, x, y);
    if (error) return { ok: false, error };
    if (!this.canAfford(def.price)) return { ok: false, error: BuyError.NO_MONEY };
    this.cash -= def.price;
    const object = this.floors[floorIndex].place(type, x, y);
    this.events.emit('object:placed', { floorIndex, object });
    return { ok: true, object };
  }

  /** Predá objekt za časť ceny. Vracia získanú sumu. */
  sellObject(floorIndex, object) {
    const refund = Math.floor(OBJECTS[object.type].price * SELL_REFUND_RATIO);
    this.floors[floorIndex].remove(object);
    this.cash += refund;
    for (const e of this.employees) e.onObjectRemoved(object, this);
    this.events.emit('object:sold', { floorIndex, object, refund });
    return refund;
  }

  // --- personál ---------------------------------------------------------------------

  refreshCandidates() {
    this.candidates = Array.from({ length: CANDIDATE_COUNT }, () => this.generateCandidate());
  }

  generateCandidate() {
    const rng = this.rng;
    const gender = rng.chance(0.5) ? 'm' : 'f';
    const pool = gender === 'm' ? NAMES.male : NAMES.female;
    const [minSkill, maxSkill] = SKILL_RANGE;
    const skill = Math.round((minSkill + rng.next() * (maxSkill - minSkill)) * 100) / 100;
    const [minWage, maxWage] = WAGE_RANGE;
    const base = minWage + ((skill - minSkill) / (maxSkill - minSkill)) * (maxWage - minWage);
    const noise = 1 + (rng.next() * 2 - 1) * WAGE_NOISE;
    const wage = Math.max(minWage, Math.round((base * noise) / 50) * 50);
    const decayFactors = {};
    for (const need of Object.keys(DECAY)) {
      decayFactors[need] = 1 + (rng.next() * 2 - 1) * DECAY_VARIATION;
    }
    return {
      name: `${rng.pick(pool.first)} ${rng.pick(pool.last)}`,
      gender,
      skill,
      wage,
      decayFactors,
      look: {
        shirt: rng.pick(SHIRT_COLORS),
        hair: rng.pick(HAIR_COLORS),
        skin: rng.pick(SKIN_COLORS),
        sprite: rng.int(0, CHARACTER_VARIANTS - 1),
      },
    };
  }

  /**
   * Prijme uchádzača. Mzda sa platí mesačne (D5), pri nábore sa nič neplatí.
   * @returns {{ ok: true, employee: Employee } | { ok: false, error: string }}
   */
  hire(candidate, floorIndex = 0) {
    if (this.employees.length >= this.maxStaff) return { ok: false, error: HireError.FULL };
    const employee = new Employee({
      id: this.nextEmployeeId++,
      ...candidate,
      position: this.spawnTile(floorIndex),
    });
    employee.floorIndex = floorIndex;
    this.employees.push(employee);
    this.candidates = this.candidates.filter((c) => c !== candidate);
    this.assignDesk(employee);
    employee.goToDesk(this);
    this.events.emit('employee:hired', { employee });
    return { ok: true, employee };
  }

  fire(employee) {
    employee.release();
    this.employees = this.employees.filter((e) => e !== employee);
    this.events.emit('employee:fired', { employee });
  }

  /** Bonus 100 € – okamžitý reset Morálky (GDD 8.2). */
  giveBonus(employee) {
    if (!this.canAfford(PLAYER_ACTIONS.BONUS_COST)) return false;
    this.cash -= PLAYER_ACTIONS.BONUS_COST;
    employee.stats.morale = 100;
    return true;
  }

  /** Nútená prestávka (GDD 8.2): pošle zamestnanca doplniť najnižšiu potrebu. */
  sendOnBreak(employee) {
    if (![Activity.WORKING, Activity.HYPERACTIVE, Activity.IDLE].includes(employee.activity)) {
      return false;
    }
    const needs = ['energy', 'satiety', 'hygiene', 'peace'];
    needs.sort((a, b) => employee.stats[a] - employee.stats[b]);
    for (const need of needs) {
      const before = employee.stats[need];
      employee.stats[need] = Math.min(before, CRITICAL - 1);
      employee.decide(this);
      if (employee.activity !== Activity.WORKING && employee.activity !== Activity.IDLE) {
        return true;
      }
      employee.stats[need] = before;
    }
    return false;
  }

  /** Voľná dlaždica, kde sa nový zamestnanec objaví (pri spodnej stene). */
  spawnTile(floorIndex) {
    const floor = this.floors[floorIndex];
    const cx = Math.floor(floor.width / 2);
    for (let y = floor.height - 1; y >= 0; y--) {
      for (let d = 0; d < floor.width; d++) {
        for (const x of [cx - d, cx + d]) {
          if (floor.isWalkable(x, y)) return { x, y };
        }
      }
    }
    return { x: cx, y: Math.floor(floor.height / 2) };
  }

  /** Pridelí voľný stôl, ak existuje. */
  assignDesk(employee) {
    const floor = this.floors[employee.floorIndex];
    const taken = new Set(this.employees.map((e) => e.deskId));
    const desk = floor.objects.find(
      (o) =>
        o.type === 'desk' &&
        !taken.has(o.id) &&
        findPath(floor, employee.tile, floor.interactionTile(o)) !== null,
    );
    if (desk) employee.deskId = desk.id;
  }

  /**
   * Nájde najbližší dosiahnuteľný objekt daných typov. Preferuje voľné a typy v poradí.
   * @returns {{ object: import('./floor.js').PlacedObject, free: boolean } | null}
   */
  findNeedObject(employee, types) {
    const floor = this.floors[employee.floorIndex];
    for (const type of types) {
      let best = null;
      for (const object of floor.objects) {
        if (object.type !== type) continue;
        const path = findPath(floor, employee.tile, floor.interactionTile(object));
        if (!path) continue;
        const free = !object.user || object.user === employee.id;
        const cost = path.length + (free ? 0 : 1000);
        if (!best || cost < best.cost) best = { object, free, cost };
      }
      if (best) return { object: best.object, free: best.free };
    }
    return null;
  }

  employeesNear(employee, radius) {
    return this.employees.filter(
      (e) =>
        e !== employee &&
        e.floorIndex === employee.floorIndex &&
        Math.hypot(e.x - employee.x, e.y - employee.y) <= radius,
    );
  }

  /** D10 – fajčenie na WC zasmradí poschodie. */
  smokeInToilet(smoker) {
    for (const e of this.employees) {
      if (e !== smoker && e.floorIndex === smoker.floorIndex) {
        e.stats.hygiene = Math.max(0, e.stats.hygiene + BEHAVIOR.SMOKE_IN_TOILET_HYGIENE);
      }
    }
  }

  addWork(_employee, amount) {
    this.workDone += amount;
  }

  /** Úvodná kancelária: zadarmo stôl a jeden zamestnanec, aby hra hneď žila. */
  setupStarterOffice() {
    const floor = this.floors[0];
    floor.place('desk', 3, 2);
    this.hire(this.candidates[0]);
  }
}
