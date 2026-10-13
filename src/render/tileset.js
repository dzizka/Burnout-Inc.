import { RENDER } from '../data/balance.js';
import { Tile } from '../sim/grid.js';
import { NO_ASSETS, SHEETS, drawTile } from './assets.js';

// Atlas dlaždíc poschodia. Podlaha je z Kenney RPG Urban Pack (ak je načítaný),
// steny a dvere sú zatiaľ kreslené kódom – Kenney nemá 3/4 tehlovú fasádu.
// Bez assetov sa celý atlas nakreslí kódom (docs/ASSETS.md).

/** Svetlosivá dlaždicová podlaha z RPG Urban Pack. */
const URBAN_FLOOR = 117;

const S = RENDER.TILE_SIZE;

/** Poradie snímok v atlase (stĺpec v riadku 0). */
export const FRAMES = {
  [Tile.FLOOR]: 0,
  [Tile.WALL]: 1,
  [Tile.DOOR]: 2,
};

const PALETTE = {
  concrete: '#5b5f66',
  concreteDark: '#4d5157',
  concreteSpeck: '#6a6f77',
  wallCap: '#8a8f99',
  wallFace: '#3b3e45',
  brick: '#4a3f3c',
  mortar: '#2e2a29',
  door: '#7a5a3a',
  doorDark: '#5c4129',
};

function drawConcrete(ctx, ox) {
  ctx.fillStyle = PALETTE.concrete;
  ctx.fillRect(ox, 0, S, S);
  ctx.fillStyle = PALETTE.concreteDark;
  ctx.fillRect(ox, S - 1, S, 1);
  ctx.fillRect(ox + S - 1, 0, 1, S);
  ctx.fillStyle = PALETTE.concreteSpeck;
  for (const [x, y] of [
    [3, 4],
    [10, 2],
    [7, 11],
    [13, 9],
    [2, 13],
  ]) {
    ctx.fillRect(ox + x, y, 1, 1);
  }
}

function drawWall(ctx, ox) {
  // 3/4 pohľad: horná hrana (cap) + predná fasáda z tehál.
  ctx.fillStyle = PALETTE.mortar;
  ctx.fillRect(ox, 0, S, S);
  ctx.fillStyle = PALETTE.brick;
  for (let row = 0; row < 3; row++) {
    const y = 5 + row * 4;
    const shift = row % 2 ? 4 : 0;
    for (let x = -shift; x < S; x += 8) {
      const bx = Math.max(x, 0);
      ctx.fillRect(ox + bx, y, Math.min(7, x + 7 - bx), 3);
    }
  }
  ctx.fillStyle = PALETTE.wallCap;
  ctx.fillRect(ox, 0, S, 4);
  ctx.fillStyle = PALETTE.wallFace;
  ctx.fillRect(ox, 4, S, 1);
}

function drawFloor(ctx, ox, assets) {
  if (assets.urban) drawTile(ctx, assets.urban, SHEETS.urban, URBAN_FLOOR, ox, 0);
  else drawConcrete(ctx, ox);
}

function drawDoor(ctx, ox, assets) {
  drawFloor(ctx, ox, assets);
  ctx.fillStyle = PALETTE.doorDark;
  ctx.fillRect(ox + 2, 1, 12, 15);
  ctx.fillStyle = PALETTE.door;
  ctx.fillRect(ox + 3, 2, 10, 14);
  ctx.fillStyle = PALETTE.wallCap;
  ctx.fillRect(ox + 10, 9, 2, 1);
}

/**
 * @param {(w: number, h: number) => HTMLCanvasElement | OffscreenCanvas} createCanvas
 * @param {import('./assets.js').Assets} [assets]
 */
export function createTileset(createCanvas, assets = NO_ASSETS) {
  const atlas = createCanvas(S * 3, S);
  const ctx = atlas.getContext('2d');
  drawFloor(ctx, FRAMES[Tile.FLOOR] * S, assets);
  drawWall(ctx, FRAMES[Tile.WALL] * S);
  drawDoor(ctx, FRAMES[Tile.DOOR] * S, assets);
  return atlas;
}
