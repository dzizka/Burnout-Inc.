import { describe, expect, it } from 'vitest';
import { FloorGrid, Tile } from '../src/sim/grid.js';

describe('FloorGrid', () => {
  it('room() má obvodové steny a priechodný interiér', () => {
    const grid = FloorGrid.room(12, 10);
    expect(grid.get(0, 0)).toBe(Tile.WALL);
    expect(grid.get(11, 9)).toBe(Tile.WALL);
    expect(grid.isWalkable(5, 5)).toBe(true);
    expect(grid.isWalkable(0, 5)).toBe(false);
  });

  it('mimo mriežky je neprechodné', () => {
    const grid = FloorGrid.room(4, 4);
    expect(grid.isWalkable(-1, 2)).toBe(false);
    expect(grid.isWalkable(2, 10)).toBe(false);
  });
});
