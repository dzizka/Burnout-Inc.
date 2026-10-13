import { Tile } from './grid.js';
import { OBJECTS } from '../data/objects.js';

// Jedno poschodie: dlaždice + umiestnené objekty (GDD 5.3).

/**
 * @typedef {object} PlacedObject
 * @property {number} id
 * @property {string} type kľúč do OBJECTS
 * @property {number} x
 * @property {number} y
 */

export const PlaceError = Object.freeze({
  OUT_OF_BOUNDS: 'outOfBounds',
  BLOCKED: 'blocked',
  NO_ACCESS: 'noAccess',
  BLOCKS_ACCESS: 'blocksAccess',
});

const NONE = -1;

export class Floor {
  /** @param {import('./grid.js').FloorGrid} grid */
  constructor(grid) {
    this.grid = grid;
    /** @type {PlacedObject[]} */
    this.objects = [];
    /** id objektu na dlaždici alebo -1 */
    this.occupancy = new Int32Array(grid.width * grid.height).fill(NONE);
    this.nextId = 1;
  }

  get width() {
    return this.grid.width;
  }

  get height() {
    return this.grid.height;
  }

  objectAt(x, y) {
    if (!this.grid.inBounds(x, y)) return undefined;
    const id = this.occupancy[y * this.width + x];
    return id === NONE ? undefined : this.objects.find((o) => o.id === id);
  }

  /** Priechodná podlaha bez nábytku. */
  isWalkable(x, y) {
    return this.grid.isWalkable(x, y) && this.objectAt(x, y) === undefined;
  }

  /** @param {PlacedObject} obj */
  interactionTile(obj) {
    const def = OBJECTS[obj.type];
    return { x: obj.x + def.interaction.dx, y: obj.y + def.interaction.dy };
  }

  /**
   * Overí, či sa objekt dá umiestniť s ľavým horným rohom na (x, y).
   * @returns {string | null} kód chyby z PlaceError alebo null
   */
  checkPlacement(type, x, y) {
    const def = OBJECTS[type];
    const footprint = [];
    for (let dy = 0; dy < def.height; dy++) {
      for (let dx = 0; dx < def.width; dx++) footprint.push({ x: x + dx, y: y + dy });
    }
    if (footprint.some((t) => !this.grid.inBounds(t.x, t.y))) return PlaceError.OUT_OF_BOUNDS;
    if (footprint.some((t) => this.grid.get(t.x, t.y) !== Tile.FLOOR || this.objectAt(t.x, t.y))) {
      return PlaceError.BLOCKED;
    }
    const access = { x: x + def.interaction.dx, y: y + def.interaction.dy };
    if (!this.isWalkable(access.x, access.y)) return PlaceError.NO_ACCESS;
    // Nový objekt nesmie zastaviť prístup k už postaveným objektom.
    const blocksOther = this.objects.some((o) => {
      const t = this.interactionTile(o);
      return footprint.some((f) => f.x === t.x && f.y === t.y);
    });
    if (blocksOther) return PlaceError.BLOCKS_ACCESS;
    return null;
  }

  /** Umiestni objekt bez kontroly peňazí. Volaj až po checkPlacement. */
  place(type, x, y) {
    const def = OBJECTS[type];
    const obj = { id: this.nextId++, type, x, y };
    this.objects.push(obj);
    for (let dy = 0; dy < def.height; dy++) {
      for (let dx = 0; dx < def.width; dx++) {
        this.occupancy[(y + dy) * this.width + (x + dx)] = obj.id;
      }
    }
    return obj;
  }

  /** @param {PlacedObject} obj */
  remove(obj) {
    this.objects = this.objects.filter((o) => o !== obj);
    for (let i = 0; i < this.occupancy.length; i++) {
      if (this.occupancy[i] === obj.id) this.occupancy[i] = NONE;
    }
  }
}
