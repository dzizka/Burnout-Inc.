import { RENDER } from '../data/balance.js';
import { NO_ASSETS, SHEETS, drawTile } from './assets.js';

// Sprity objektov (3/4 pohľad). Sprite je zarovnaný na spodnú hranu pôdorysu a
// vycentrovaný – môže byť vyšší aj o pár pixelov širší ako pôdorys (spriteOrigin).
// Poradie zdrojov: LimeZu Modern Office (ak je pribalený) → Kenney Roguelike Indoor →
// kreslené kódom (docs/ASSETS.md).

const S = RENDER.TILE_SIZE;
/** Výška náhradných spritov nad pôdorysom. */
const OVERHANG = 8;

/**
 * LimeZu Modern Office: výrezy v pixeloch [x, y, šírka, výška] a ich poloha v sprite.
 * @type {Record<string, { width: number, height: number, layers: { rect: number[], at: number[] }[] }>}
 */
const LIMEZU = {
  desk: {
    width: 16,
    height: 31,
    layers: [
      { rect: [80, 288, 16, 21], at: [0, 10] }, // stôl
      { rect: [224, 208, 16, 16], at: [0, 2] }, // monitor
    ],
  },
  support: {
    width: 16,
    height: 31,
    layers: [
      { rect: [80, 288, 16, 21], at: [0, 10] }, // stôl
      { rect: [224, 424, 16, 8], at: [0, 9] }, // notebook
      { rect: [162, 152, 12, 8], at: [4, 12] }, // telefón
    ],
  },
  coffee: { width: 12, height: 26, layers: [{ rect: [230, 533, 12, 26], at: [0, 0] }] },
  vending: { width: 18, height: 24, layers: [{ rect: [72, 384, 18, 24], at: [0, 0] }] },
  couch: { width: 31, height: 24, layers: [{ rect: [1, 276, 31, 24], at: [0, 0] }] },
};

/**
 * Posun ľavého horného rohu spritu voči ľavému hornému rohu pôdorysu.
 * @param {{ width: number, height: number }} def rozmery pôdorysu v dlaždiciach
 * @param {{ width: number, height: number }} sprite
 */
export function spriteOrigin(def, sprite) {
  return {
    dx: Math.round((def.width * S - sprite.width) / 2),
    dy: def.height * S - sprite.height,
  };
}

function limezuSprite(createCanvas, image, recipe) {
  const canvas = createCanvas(recipe.width, recipe.height);
  const ctx = canvas.getContext('2d');
  for (const {
    rect: [x, y, w, h],
    at: [ax, ay],
  } of recipe.layers) {
    ctx.drawImage(image, x, y, w, h, ax, ay, w, h);
  }
  return canvas;
}

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
  support(ctx, assets) {
    if (assets.indoor) {
      drawTile(ctx, assets.indoor, SHEETS.indoor, INDOOR.TABLE, 0, OVERHANG);
    } else {
      rect(ctx, '#3a2a1c', 1, 18, 14, 6);
      rect(ctx, '#8a6a46', 0, 13, 16, 6);
    }
    rect(ctx, '#2a2c33', 2, 9, 7, 5); // notebook
    rect(ctx, '#4f8fd8', 3, 10, 5, 3);
    rect(ctx, '#c6443c', 10, 11, 5, 3); // telefón
    rect(ctx, '#8f2c2c', 10, 10, 5, 1);
    rect(ctx, '#e8e6e1', 11, 12, 1, 1);
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
  couch(ctx) {
    rect(ctx, '#3d5a8a', 1, 6, 30, 8); // operadlo
    rect(ctx, '#4f6fa8', 1, 13, 30, 8); // sedák
    rect(ctx, '#2f4670', 0, 8, 3, 14); // opierky
    rect(ctx, '#2f4670', 29, 8, 3, 14);
    rect(ctx, '#5a7cbb', 4, 14, 11, 2);
    rect(ctx, '#5a7cbb', 17, 14, 11, 2);
    rect(ctx, '#1d1e22', 2, 22, 2, 2); // nohy
    rect(ctx, '#1d1e22', 28, 22, 2, 2);
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
    if (assets.lzOffice && LIMEZU[type]) {
      sprites[type] = limezuSprite(createCanvas, assets.lzOffice, LIMEZU[type]);
      continue;
    }
    const canvas = createCanvas(def.width * S, def.height * S + OVERHANG);
    const paint = PAINTERS[type];
    if (paint) paint(canvas.getContext('2d'), assets);
    else rect(canvas.getContext('2d'), '#ff00ff', 0, OVERHANG, def.width * S, def.height * S);
    sprites[type] = canvas;
  }
  return sprites;
}
