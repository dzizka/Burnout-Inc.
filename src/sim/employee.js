import {
  BEHAVIOR,
  CRITICAL,
  DECAY,
  MORALE,
  NEED_PRIORITY,
  NEED_SOURCES,
  USE,
} from '../data/needs.js';
import { findPath } from './pathfinding.js';

// Zamestnanec: 6 potrieb (100 → 0) a stavový automat (GDD 4.1–4.3).
// Pozícia je v dlaždiciach; celé čísla = stred dlaždice.

export const Activity = Object.freeze({
  IDLE: 'IDLE', // nemá stôl
  WORKING: 'WORKING',
  HYPERACTIVE: 'HYPERACTIVE',
  COFFEE_BREAK: 'COFFEE_BREAK',
  VENDING_MACHINE: 'VENDING_MACHINE',
  TOILET: 'TOILET',
  SMOKE_BREAK: 'SMOKE_BREAK',
  PRANK_COWORKER: 'PRANK_COWORKER',
  DRAMA_QUEEN: 'DRAMA_QUEEN',
  ASLEEP: 'ASLEEP',
  SLACKING: 'SLACKING',
  STRIKE: 'STRIKE',
});

const BREAK_ACTIVITIES = new Set([
  Activity.COFFEE_BREAK,
  Activity.VENDING_MACHINE,
  Activity.TOILET,
  Activity.SMOKE_BREAK,
]);

/** Činnosti, pri ktorých zamestnanec sedí pri stole. */
const DESK_ACTIVITIES = new Set([Activity.WORKING, Activity.HYPERACTIVE, Activity.STRIKE]);

const clamp = (v) => Math.max(0, Math.min(100, v));

export class Employee {
  /**
   * @param {object} data
   * @param {number} data.id
   * @param {string} data.name
   * @param {'m' | 'f'} data.gender pre slovenské tvary slovies v hláškach
   * @param {number} data.wage mesačná mzda (D5)
   * @param {number} data.skill násobok rýchlosti práce
   * @param {Record<string, number>} data.decayFactors individuálne násobky úbytku
   * @param {{ shirt: string, hair: string, skin: string }} data.look
   * @param {{ x: number, y: number }} data.position
   */
  constructor({ id, name, gender, wage, skill, decayFactors, look, position }) {
    this.id = id;
    this.name = name;
    this.gender = gender;
    this.wage = wage;
    this.skill = skill;
    this.decayFactors = decayFactors;
    this.look = look;
    this.floorIndex = 0;
    this.x = position.x;
    this.y = position.y;
    this.facing = 'down';
    this.stats = { energy: 100, satiety: 100, peace: 100, fun: 100, hygiene: 100, morale: 100 };
    this.activity = Activity.IDLE;
    /** @type {{x: number, y: number}[]} zostávajúce dlaždice cesty */
    this.path = [];
    this.timer = 0;
    /** id stola (PlacedObject) alebo null */
    this.deskId = null;
    /** objekt, ktorý ide používať / používa */
    this.target = null;
    /** potreba, kvôli ktorej ide k objektu */
    this.targetNeed = null;
    this.waiting = false;
    this.victim = null;
    this.chaosCooldown = 0;
    /** potreba, pre ktorú chýba objekt (D10) – zobrazí sa nad hlavou */
    this.missing = null;
    this.workDone = 0;
    /** štrajkuje (trvá aj počas prestávok), kým Morálka nevystúpi nad STRIKE_END_MORALE */
    this.striking = false;
    /** posledná udalosť pre UI (emotikon na krátko) */
    this.flash = null;
  }

  get tile() {
    return { x: Math.round(this.x), y: Math.round(this.y) };
  }

  get isWalking() {
    return this.path.length > 0;
  }

  /** @param {import('./game.js').Game} game */
  update(dt, game) {
    if (this.chaosCooldown > 0) this.chaosCooldown = Math.max(0, this.chaosCooldown - dt);
    if (this.flash) {
      this.flash.timer -= dt;
      if (this.flash.timer <= 0) this.flash = null;
    }
    this.decay(dt);

    if (this.isWalking) {
      this.walk(dt, game);
      if (this.isWalking) return;
      this.onArrived(game);
    }

    switch (this.activity) {
      case Activity.IDLE:
        this.goToDesk(game);
        if (this.activity === Activity.IDLE) this.decide(game);
        break;
      case Activity.WORKING:
      case Activity.HYPERACTIVE:
        this.updateWork(dt, game);
        break;
      case Activity.STRIKE:
        if (this.atDesk(game)) this.facing = 'up';
        if (this.stats.morale >= BEHAVIOR.STRIKE_END_MORALE) {
          this.striking = false;
          this.backToWork(game);
        } else {
          // Štrajkujúci nepracuje, ale prestávky si dáva (inak by sa nikdy nezotavil).
          this.decide(game);
        }
        break;
      case Activity.PRANK_COWORKER:
        this.timer -= dt;
        if (this.timer <= 0) this.finishPrank(game);
        break;
      case Activity.DRAMA_QUEEN:
      case Activity.ASLEEP:
      case Activity.SLACKING:
        this.timer -= dt;
        if (this.timer <= 0) this.finishCollapse(game);
        break;
      default:
        if (BREAK_ACTIVITIES.has(this.activity)) this.updateBreak(dt, game);
    }
  }

  // --- potreby ---------------------------------------------------------------

  decay(dt) {
    const s = this.stats;
    const hyper = this.activity === Activity.HYPERACTIVE ? BEHAVIOR.HYPER.DECAY_FACTOR : 1;
    const waiting = this.waiting ? BEHAVIOR.WAITING_PEACE_FACTOR : 1;
    for (const need of Object.keys(DECAY)) {
      let rate = DECAY[need] * this.decayFactors[need];
      if (need === 'energy') rate *= hyper;
      if (need === 'peace') rate *= hyper * waiting;
      // Počas činnosti, ktorá potrebu dopĺňa, neubúda.
      if (need === this.targetNeed && !this.waiting && !this.isWalking) rate = 0;
      s[need] = clamp(s[need] - rate * dt);
    }
    const low = Object.keys(DECAY).filter((n) => s[n] < CRITICAL).length;
    if (low > 0) s.morale = clamp(s.morale - low * MORALE.DECAY_PER_LOW_NEED * dt);
    else if (s.morale > 0 && Object.keys(DECAY).every((n) => s[n] > 50)) {
      s.morale = clamp(s.morale + MORALE.RECOVER * dt);
    }
    if (this.missing) s.morale = clamp(s.morale - BEHAVIOR.MISSING.MORALE_DECAY * dt);
  }

  // --- pohyb -----------------------------------------------------------------

  walk(dt, game) {
    const floor = game.floors[this.floorIndex];
    const speed =
      BEHAVIOR.WALK_SPEED * (this.stats.satiety <= 0 ? BEHAVIOR.STARVING_SPEED_FACTOR : 1);
    let budget = speed * dt;
    while (budget > 0 && this.path.length) {
      const next = this.path[0];
      if (!floor.isWalkable(next.x, next.y)) {
        // Cestu medzitým zastavali – prepočítaj ju k rovnakému cieľu.
        const goal = this.path.at(-1);
        const replanned = findPath(floor, this.tile, goal);
        if (!replanned) {
          this.abort(game);
          return;
        }
        this.path = replanned;
        continue;
      }
      const dx = next.x - this.x;
      const dy = next.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (Math.abs(dx) > Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
      else if (dy !== 0) this.facing = dy > 0 ? 'down' : 'up';
      if (dist <= budget) {
        this.x = next.x;
        this.y = next.y;
        this.path.shift();
        budget -= dist;
      } else {
        this.x += (dx / dist) * budget;
        this.y += (dy / dist) * budget;
        budget = 0;
      }
    }
  }

  /** @returns {boolean} true, ak sa podarilo naplánovať cestu */
  walkTo(game, goal) {
    const path = findPath(game.floors[this.floorIndex], this.tile, goal);
    if (!path) return false;
    // Ak stojí medzi dlaždicami, najprv dôjde na stred aktuálnej.
    const t = this.tile;
    if (this.x !== t.x || this.y !== t.y) path.unshift(t);
    this.path = path;
    return true;
  }

  // --- práca pri stole ---------------------------------------------------------

  desk(game) {
    return this.deskId === null
      ? undefined
      : game.floors[this.floorIndex].objects.find((o) => o.id === this.deskId);
  }

  atDesk(game) {
    const desk = this.desk(game);
    if (!desk) return false;
    const t = game.floors[this.floorIndex].interactionTile(desk);
    return this.x === t.x && this.y === t.y;
  }

  goToDesk(game) {
    if (this.deskId === null) game.assignDesk(this);
    const desk = this.desk(game);
    if (!desk) {
      this.activity = Activity.IDLE;
      return;
    }
    this.activity = Activity.WORKING;
    if (!this.atDesk(game)) {
      const t = game.floors[this.floorIndex].interactionTile(desk);
      if (!this.walkTo(game, t)) this.activity = Activity.IDLE;
    }
  }

  backToWork(game) {
    this.release();
    this.goToDesk(game);
  }

  updateWork(dt, game) {
    if (!this.atDesk(game)) {
      this.goToDesk(game);
      return;
    }
    this.facing = 'up';
    if (this.activity === Activity.HYPERACTIVE) {
      this.timer -= dt;
      if (this.timer <= 0) this.activity = Activity.WORKING;
    }
    let rate = this.skill;
    if (this.activity === Activity.HYPERACTIVE) rate *= BEHAVIOR.HYPER.WORK_FACTOR;
    if (this.missing) {
      rate *= BEHAVIOR.MISSING.WORK_FACTOR;
      // D10 – pomalé dopĺňanie pri stole, keď chýba objekt.
      const need = this.missing;
      this.stats[need] = clamp(
        this.stats[need] + DECAY[need] * BEHAVIOR.MISSING.REFILL_FACTOR * dt,
      );
    }
    this.workDone += rate * dt;
    game.addWork(this, rate * dt);
    if (this.activity === Activity.WORKING) this.decide(game);
  }

  // --- rozhodovanie ------------------------------------------------------------

  decide(game) {
    const s = this.stats;
    if ((s.morale <= 0 || this.striking) && this.activity !== Activity.STRIKE) {
      return this.startStrike(game);
    }
    if (s.peace <= 0) return this.startDrama(game);
    if (s.energy <= 0) return this.startCollapse(game, Activity.ASLEEP, BEHAVIOR.ASLEEP.DURATION);
    if (s.fun <= 0) return this.startCollapse(game, Activity.SLACKING, BEHAVIOR.SLACKING.DURATION);
    if (s.hygiene <= 0) this.hygieneCollapse(game);

    this.missing = null;
    for (const need of NEED_PRIORITY) {
      if (s[need] >= CRITICAL) continue;
      if (need === 'fun') {
        if (this.chaosCooldown > 0) continue;
        if (this.startPrank(game)) return;
      } else if (this.startBreak(game, need)) {
        return;
      }
      this.missing ??= need;
    }
  }

  startBreak(game, need) {
    const found = game.findNeedObject(this, NEED_SOURCES[need]);
    if (!found) return false;
    const { object, free } = found;
    const floor = game.floors[this.floorIndex];
    if (!this.walkTo(game, floor.interactionTile(object))) return false;
    // Fajčenie (aj na WC) má vlastnú činnosť a emotikon (D10).
    this.activity = need === 'peace' ? Activity.SMOKE_BREAK : USE[object.type].activity;
    this.target = object;
    this.targetNeed = need;
    this.waiting = false;
    if (free) object.user = this.id;
    return true;
  }

  onArrived(game) {
    if (BREAK_ACTIVITIES.has(this.activity)) {
      this.facing = 'up';
      this.tryUseTarget(game);
    } else if (this.activity === Activity.PRANK_COWORKER) {
      this.timer = BEHAVIOR.PRANK.DURATION;
    }
  }

  tryUseTarget(game) {
    const obj = this.target;
    const floor = game.floors[this.floorIndex];
    if (!obj || !floor.objects.includes(obj)) {
      this.backToWork(game);
      return;
    }
    if (obj.user && obj.user !== this.id) {
      this.waiting = true; // čaká v rade (GDD 4.2 TOILET)
      return;
    }
    obj.user = this.id;
    this.waiting = false;
    this.timer = this.targetNeed === 'peace' ? USE.smoking.duration : USE[obj.type].duration;
  }

  updateBreak(dt, game) {
    if (this.waiting) {
      this.tryUseTarget(game);
      return;
    }
    this.timer -= dt;
    if (this.timer > 0) return;
    const need = this.targetNeed;
    const objType = this.target.type;
    this.stats[need] = 100;
    if (need === 'peace') {
      if (objType === 'toilet') game.smokeInToilet(this);
    } else {
      for (const [stat, delta] of Object.entries(USE[objType].side)) {
        this.stats[stat] = clamp(this.stats[stat] + delta);
      }
    }
    if (
      objType === 'coffee' &&
      this.stats.peace >= BEHAVIOR.HYPER.MIN_PEACE &&
      game.rng.chance(BEHAVIOR.HYPER.CHANCE)
    ) {
      this.release();
      this.goToDesk(game);
      if (this.activity === Activity.WORKING) {
        this.activity = Activity.HYPERACTIVE;
        this.timer = BEHAVIOR.HYPER.DURATION;
        game.events.emit('employee:hyper', { employee: this });
      }
      return;
    }
    this.backToWork(game);
  }

  // --- prank (GDD 4.3) ---------------------------------------------------------

  startPrank(game) {
    const victims = game.employees.filter(
      (e) => e !== this && e.floorIndex === this.floorIndex && e.activity === Activity.WORKING,
    );
    const victim = game.rng.pick(victims);
    if (!victim) return false;
    const floor = game.floors[this.floorIndex];
    const spot = [
      [1, 0],
      [-1, 0],
      [0, 1],
    ]
      .map(([dx, dy]) => ({ x: victim.tile.x + dx, y: victim.tile.y + dy }))
      .find((t) => floor.isWalkable(t.x, t.y));
    if (!spot || !this.walkTo(game, spot)) return false;
    this.activity = Activity.PRANK_COWORKER;
    this.victim = victim;
    this.timer = BEHAVIOR.PRANK.DURATION;
    return true;
  }

  finishPrank(game) {
    const victim = this.victim;
    this.victim = null;
    this.stats.fun = 100;
    this.chaosCooldown = BEHAVIOR.PRANK.COOLDOWN;
    if (victim && game.employees.includes(victim)) {
      const roll = game.rng.next();
      let outcome = 'normal';
      if (roll < BEHAVIOR.PRANK.NORMAL) {
        victim.stats.peace = clamp(victim.stats.peace + BEHAVIOR.PRANK.NORMAL_PEACE);
      } else if (roll < BEHAVIOR.PRANK.NORMAL + BEHAVIOR.PRANK.SPILL) {
        victim.stats.peace = clamp(victim.stats.peace + BEHAVIOR.PRANK.SPILL_PEACE);
        outcome = 'spill';
      } else {
        victim.stats.peace = 0; // obeť vybuchne pri najbližšom rozhodovaní
        outcome = 'explode';
      }
      victim.flash = { kind: 'prank', timer: 2 };
      game.events.emit('employee:prank', { employee: this, victim, outcome });
    }
    this.backToWork(game);
  }

  // --- kolapsy (GDD 4.1, 4.2) ---------------------------------------------------

  startDrama(game) {
    this.release();
    this.activity = Activity.DRAMA_QUEEN;
    this.timer = BEHAVIOR.DRAMA.DURATION;
    // D8 – jednorazový AoE zásah okolia.
    for (const other of game.employeesNear(this, BEHAVIOR.DRAMA.RADIUS)) {
      other.stats.peace = clamp(other.stats.peace + BEHAVIOR.DRAMA.PEACE);
      other.stats.morale = clamp(other.stats.morale + BEHAVIOR.DRAMA.MORALE);
    }
    game.events.emit('employee:drama', { employee: this });
  }

  /** Hráč zastaví hysterický záchvat kliknutím (GDD 4.2). */
  calmDown(game) {
    if (this.activity !== Activity.DRAMA_QUEEN) return false;
    this.timer = 0;
    this.finishCollapse(game);
    return true;
  }

  startCollapse(game, activity, duration) {
    this.release();
    this.activity = activity;
    this.timer = duration;
    game.events.emit('employee:collapse', { employee: this, activity });
  }

  finishCollapse(game) {
    if (this.activity === Activity.DRAMA_QUEEN) {
      this.stats.peace = Math.max(this.stats.peace, BEHAVIOR.DRAMA.RECOVER_PEACE);
      this.chaosCooldown = BEHAVIOR.DRAMA.COOLDOWN;
    } else if (this.activity === Activity.ASLEEP) {
      this.stats.energy = Math.max(this.stats.energy, BEHAVIOR.ASLEEP.RECOVER_ENERGY);
    } else if (this.activity === Activity.SLACKING) {
      this.stats.fun = Math.max(this.stats.fun, BEHAVIOR.SLACKING.RECOVER_FUN);
    }
    this.backToWork(game);
  }

  hygieneCollapse(game) {
    for (const other of game.employeesNear(this, BEHAVIOR.HYGIENE_COLLAPSE.RADIUS)) {
      other.stats.morale = clamp(other.stats.morale + BEHAVIOR.HYGIENE_COLLAPSE.MORALE);
    }
    this.stats.hygiene = 1; // aby sa katastrofa neopakovala každý krok; ide hneď na WC
    game.events.emit('employee:hygiene', { employee: this });
  }

  startStrike(game) {
    if (this.activity === Activity.STRIKE) return;
    const started = !this.striking;
    this.striking = true;
    this.release();
    this.activity = Activity.STRIKE;
    // Štrajkuje pri svojom stole, ak nejaký má.
    const desk = this.desk(game);
    if (desk && !this.atDesk(game)) {
      this.walkTo(game, game.floors[this.floorIndex].interactionTile(desk));
    }
    if (started) game.events.emit('employee:strike', { employee: this });
  }

  // --- pomocné -------------------------------------------------------------------

  /** Uvoľní rezervovaný objekt a zruší cieľ. */
  release() {
    if (this.target && this.target.user === this.id) this.target.user = null;
    this.target = null;
    this.targetNeed = null;
    this.waiting = false;
    this.victim = null;
    this.path = [];
  }

  /** Cieľ sa stal nedosiahnuteľným (napr. ho zastavali). */
  abort(game) {
    this.release();
    this.goToDesk(game);
  }

  /** Volá Game, keď hráč predá objekt. */
  onObjectRemoved(obj, game) {
    if (this.deskId === obj.id) this.deskId = null;
    if (this.target === obj) this.abort(game);
    else if (this.deskId === null && DESK_ACTIVITIES.has(this.activity)) this.goToDesk(game);
  }
}
