import { describe, expect, it } from 'vitest';
import { findPath } from '../src/sim/pathfinding.js';
import { Floor } from '../src/sim/floor.js';
import { FloorGrid } from '../src/sim/grid.js';

describe('findPath', () => {
  it('nájde najkratšiu cestu v prázdnej miestnosti', () => {
    const floor = new Floor(FloorGrid.room(8, 6));
    const path = findPath(floor, { x: 1, y: 1 }, { x: 4, y: 3 });
    expect(path).toHaveLength(5);
    expect(path.at(-1)).toEqual({ x: 4, y: 3 });
  });

  it('obíde nábytok', () => {
    const floor = new Floor(FloorGrid.room(7, 5));
    // stena z nábytku v stĺpci 3 okrem spodného riadku
    floor.place('desk', 3, 1);
    floor.place('desk', 3, 2);
    const path = findPath(floor, { x: 1, y: 1 }, { x: 5, y: 1 });
    expect(path.some((t) => t.x === 3 && t.y < 3)).toBe(false);
    expect(path.at(-1)).toEqual({ x: 5, y: 1 });
  });

  it('vráti null, ak cieľ nie je dosiahnuteľný', () => {
    const floor = new Floor(FloorGrid.room(5, 5));
    expect(findPath(floor, { x: 1, y: 1 }, { x: 0, y: 0 })).toBeNull();
  });

  it('vráti prázdnu cestu, ak už stojí v cieli', () => {
    const floor = new Floor(FloorGrid.room(5, 5));
    expect(findPath(floor, { x: 2, y: 2 }, { x: 2, y: 2 })).toEqual([]);
  });
});
