// Dlaždicová mriežka jedného poschodia (GDD 5.3).

export const Tile = Object.freeze({
  EMPTY: 0,
  FLOOR: 1,
  WALL: 2,
  DOOR: 3,
});

export class FloorGrid {
  /** @param {number} width @param {number} height */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = new Uint8Array(width * height);
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  get(x, y) {
    return this.inBounds(x, y) ? this.tiles[y * this.width + x] : Tile.EMPTY;
  }

  set(x, y, tile) {
    if (this.inBounds(x, y)) this.tiles[y * this.width + x] = tile;
  }

  isWalkable(x, y) {
    const tile = this.get(x, y);
    return tile === Tile.FLOOR || tile === Tile.DOOR;
  }

  /** Obdĺžniková miestnosť: obvodové steny, vnútri podlaha. */
  static room(width, height) {
    const grid = new FloorGrid(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const edge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        grid.set(x, y, edge ? Tile.WALL : Tile.FLOOR);
      }
    }
    return grid;
  }
}
