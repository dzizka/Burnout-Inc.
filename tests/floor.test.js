import { describe, expect, it } from 'vitest';
import { Floor, PlaceError } from '../src/sim/floor.js';
import { FloorGrid } from '../src/sim/grid.js';

const room = () => new Floor(FloorGrid.room(8, 6));

describe('Floor', () => {
  it('objekt sa dá postaviť na voľnú podlahu a blokuje pohyb', () => {
    const floor = room();
    expect(floor.checkPlacement('desk', 2, 2)).toBeNull();
    const desk = floor.place('desk', 2, 2);
    expect(floor.objectAt(2, 2)).toBe(desk);
    expect(floor.isWalkable(2, 2)).toBe(false);
    expect(floor.interactionTile(desk)).toEqual({ x: 2, y: 3 });
  });

  it('nedá sa stavať na stenu, mimo mriežky ani na iný objekt', () => {
    const floor = room();
    expect(floor.checkPlacement('desk', 0, 2)).toBe(PlaceError.BLOCKED);
    expect(floor.checkPlacement('desk', -1, 2)).toBe(PlaceError.OUT_OF_BOUNDS);
    floor.place('desk', 2, 2);
    expect(floor.checkPlacement('coffee', 2, 2)).toBe(PlaceError.BLOCKED);
  });

  it('objekt musí mať prístupnú dlaždicu na používanie', () => {
    const floor = room();
    // Pod riadkom 4 je už spodná stena.
    expect(floor.checkPlacement('desk', 2, 4)).toBe(PlaceError.NO_ACCESS);
  });

  it('nový objekt nesmie zablokovať prístup k existujúcemu', () => {
    const floor = room();
    floor.place('desk', 2, 2);
    expect(floor.checkPlacement('coffee', 2, 3)).toBe(PlaceError.BLOCKS_ACCESS);
  });

  it('po odstránení je dlaždica znovu voľná', () => {
    const floor = room();
    const desk = floor.place('desk', 2, 2);
    floor.remove(desk);
    expect(floor.objectAt(2, 2)).toBeUndefined();
    expect(floor.isWalkable(2, 2)).toBe(true);
  });

  it('Y-sorting: nižšie objekty sa kreslia neskôr', () => {
    const floor = room();
    const low = floor.place('desk', 1, 3);
    const high = floor.place('desk', 4, 1);
    expect(floor.sortedObjects()).toEqual([high, low]);
  });
});
