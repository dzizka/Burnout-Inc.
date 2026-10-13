import { Rng } from '../core/rng.js';
import { GameClock } from './clock.js';
import { FloorGrid } from './grid.js';
import { Floor } from './floor.js';
import { Employee } from './employee.js';
import { Economy } from './economy.js';
import { Game } from './game.js';

// Uloženie a načítanie hry (GDD 10, fáza 4). Čistá serializácia do JSON – kam sa uloží
// (localStorage), rieši UI. Rozpracované činnosti (cesty, prestávky) sa neukladajú:
// po načítaní zamestnanci začnú od stola, čo je pre hráča nepostrehnuteľné.

export const SAVE_VERSION = 1;

/** @param {Game} game */
export function serializeGame(game) {
  return {
    version: SAVE_VERSION,
    rng: game.rng.toJSON(),
    clock: game.clock.toJSON(),
    cash: game.cash,
    scandal: game.scandal,
    marketShare: { ...game.marketShare },
    floors: game.floors.map((f) => ({
      width: f.width,
      height: f.height,
      tiles: Array.from(f.grid.tiles),
      objects: f.objects.map(({ id, type, x, y }) => ({ id, type, x, y })),
      nextId: f.nextId,
    })),
    employees: game.employees.map((e) => ({
      id: e.id,
      name: e.name,
      gender: e.gender,
      wage: e.wage,
      skill: e.skill,
      decayFactors: e.decayFactors,
      look: e.look,
      floorIndex: e.floorIndex,
      position: e.tile,
      stats: { ...e.stats },
      deskId: e.deskId,
      workDone: e.workDone,
      striking: e.striking,
      chaosCooldown: e.chaosCooldown,
    })),
    nextEmployeeId: game.nextEmployeeId,
    workDone: game.workDone,
    candidates: game.candidates,
    studio: {
      project: game.studio.project,
      products: game.studio.products,
      pendingTickets: game.studio.pendingTickets,
      ticketsHandled: game.studio.ticketsHandled,
      launchedCount: game.studio.launchedCount,
      nextId: game.studio.nextId,
    },
    economy: game.economy.toJSON(),
    over: game.over,
  };
}

/**
 * @param {ReturnType<typeof serializeGame>} data
 * @returns {Game}
 */
export function deserializeGame(data) {
  if (!data || data.version !== SAVE_VERSION) throw new Error('Nepodporovaná verzia uloženej hry');
  const game = new Game({ seed: 0 });
  game.rng = Rng.fromJSON(data.rng);
  game.clock = new GameClock(data.clock);
  game.cash = data.cash;
  game.scandal = data.scandal;
  game.marketShare = { ...data.marketShare };
  game.floors = data.floors.map((fd) => {
    const grid = new FloorGrid(fd.width, fd.height);
    grid.tiles.set(fd.tiles);
    const floor = new Floor(grid);
    for (const o of fd.objects) {
      floor.nextId = o.id;
      floor.place(o.type, o.x, o.y);
    }
    floor.nextId = fd.nextId;
    return floor;
  });
  game.employees = data.employees.map((ed) => {
    const e = new Employee(ed);
    e.floorIndex = ed.floorIndex;
    Object.assign(e.stats, ed.stats);
    e.deskId = ed.deskId;
    e.workDone = ed.workDone;
    e.striking = ed.striking;
    e.chaosCooldown = ed.chaosCooldown;
    return e;
  });
  game.nextEmployeeId = data.nextEmployeeId;
  game.workDone = data.workDone;
  game.candidates = structuredClone(data.candidates);
  Object.assign(game.studio, structuredClone(data.studio));
  game.economy = Economy.fromJSON(data.economy);
  game.over = data.over ? { ...data.over } : null;
  return game;
}
