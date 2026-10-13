import { RENDER } from '../data/balance.js';
import { NO_ASSETS, SHEETS, drawTile } from './assets.js';

// Sprity objektov (3/4 pohľad). Sprite je vyšší ako dlaždica – horná časť (OVERHANG px)
// presahuje nad pôdorys, aby mal objekt výšku. Kde Kenney Roguelike Indoor pack niečo má
// (stôl, kuchynská linka), použije sa; kancelárske veci (PC, kávovar, automat, WC)
// zatiaľ kreslíme kódom v podobnej palete (docs/ASSETS.md).

const S = RENDER.TILE_SIZE;
export const OVERHANG = 8;

/** Dlaždice z Kenney Roguelike Indoor pack. */
const INDOOR = {
  TABLE: 162, // malý stôl s nohami
  COUNTER: 312, // kuchynská linka
};

/** @type {Record<string, (ctx: CanvasRenderingContext2D, assets: import('./assets.js').Assets) => void>} */
const PAINTERS = {
  desk(ctx, assets) {
    if (assets.indoor) {
      drawTile(ctx, assets.indoor, SHEETS.indoor, INDOOR.TABLE, 0, OVERHANG);
    } else {
      rect(ctx, '#3a2a1c', 1, 18, 14, 6); // čelo stola
      rect(ctx, '#8a6a46', 0, 13, 16, 6); // doska
      rect(ctx, '#6e5236', 0, 18, 16, 1);
    }
    rect(ctx, '#d8d0b8', 3, 3, 10, 10); // CRT monitor
    rect(ctx, '#b8ae94', 3, 12, 10, 1);
    rect(ctx, '#2f6f7a', 4, 4, 8, 7); // obrazovka
    rect(ctx, '#7fd0c8', 5, 5, 3, 1);
    rect(ctx, '#d8d0b8', 6, 13, 4, 2); // stojan
    rect(ctx, '#cfcfcf', 4, 15, 8, 2); // klávesnica
  },
  coffee(ctx, assets) {
    if (assets.indoor) {
      drawTile(ctx, assets.indoor, SHEETS.indoor, INDOOR.COUNTER, 0, OVERHANG);
    } else {
      rect(ctx, '#55585f', 0, 12, 16, 12); // pult
      rect(ctx, '#6c7078', 0, 12, 16, 3);
    }
    rect(ctx, '#1d1e22', 3, 1, 10, 13); // kávovar
    rect(ctx, '#33353b', 4, 2, 8, 4);
    rect(ctx, '#d84a3a', 11, 3, 1, 1); // kontrolka
    rect(ctx, '#0d0d0f', 6, 8, 4, 3); // výpust
    rect(ctx, '#f2efe6', 6, 11, 4, 3); // šálka
  },
  vending(ctx) {
    rect(ctx, '#8f2c2c', 1, 0, 14, 24);
    rect(ctx, '#b33a3a', 1, 0, 14, 2);
    rect(ctx, '#20313a', 3, 3, 8, 14); // presklenie
    const colors = ['#e2c044', '#5cb85c', '#e07b39', '#7aa6e0'];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        rect(ctx, colors[(row + col) % colors.length], 4 + col * 2.5, 4 + row * 3.5, 2, 2);
      }
    }
    rect(ctx, '#d9d9d9', 12, 6, 2, 4); // mincovník
    rect(ctx, '#111', 4, 19, 8, 3); // výdaj
  },
  toilet(ctx) {
    rect(ctx, '#e9eef2', 3, 6, 10, 7); // nádržka
    rect(ctx, '#c9d2d8', 3, 12, 10, 1);
    rect(ctx, '#aab4bb', 7, 7, 2, 1); // splachovadlo
    rect(ctx, '#e9eef2', 2, 13, 12, 8); // misa
    rect(ctx, '#b9c4cb', 4, 15, 8, 4);
    rect(ctx, '#c9d2d8', 4, 21, 8, 2); // noha
  },
  smoking(ctx) {
    rect(ctx, '#6c7078', 7, 11, 2, 11); // stojan
    rect(ctx, '#55585f', 4, 21, 8, 2); // podstavec
    rect(ctx, '#8a8f99', 3, 9, 10, 3); // popolník
    rect(ctx, '#3b3e45', 4, 9, 8, 1);
    rect(ctx, '#f2efe6', 9, 8, 3, 1); // cigareta
    rect(ctx, '#e07b39', 12, 8, 1, 1);
    ctx.globalAlpha = 0.5; // dym
    rect(ctx, '#c9cdd3', 11, 5, 2, 2);
    rect(ctx, '#c9cdd3', 10, 2, 2, 2);
    ctx.globalAlpha = 1;
  },
};

function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

/**
 * @param {(w: number, h: number) => HTMLCanvasElement} createCanvas
 * @param {Record<string, { width: number, height: number }>} defs
 * @param {import('./assets.js').Assets} [assets]
 */
export function createObjectSprites(createCanvas, defs, assets = NO_ASSETS) {
  /** @type {Record<string, HTMLCanvasElement>} */
  const sprites = {};
  for (const [type, def] of Object.entries(defs)) {
    const canvas = createCanvas(def.width * S, def.height * S + OVERHANG);
    const paint = PAINTERS[type];
    if (paint) paint(canvas.getContext('2d'), assets);
    else rect(canvas.getContext('2d'), '#ff00ff', 0, OVERHANG, def.width * S, def.height * S);
    sprites[type] = canvas;
  }
  return sprites;
}
