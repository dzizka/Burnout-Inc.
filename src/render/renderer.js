import { RENDER } from '../data/balance.js';
import { Tile } from '../sim/grid.js';
import { FRAMES, createPlaceholderTileset } from './tileset.js';

const S = RENDER.TILE_SIZE;

/**
 * Celočíselné škálovanie (GDD 2.1): vyberie násobok tak, aby virtuálne plátno bolo
 * približne 480×270, a virtuálnu plochu dopočíta podľa okna – obraz vyplní displej
 * a pixely ostanú ostré.
 */
export function computeViewport(windowWidth, windowHeight) {
  const scale = Math.max(
    1,
    Math.floor(
      Math.min(windowWidth / RENDER.VIRTUAL_WIDTH, windowHeight / RENDER.VIRTUAL_HEIGHT) + 0.5,
    ),
  );
  return {
    scale,
    width: Math.ceil(windowWidth / scale),
    height: Math.ceil(windowHeight / scale),
  };
}

export class Renderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileset = createPlaceholderTileset((w, h) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    });
    this.camera = { x: 0, y: 0 };
    this.resize(window.innerWidth, window.innerHeight);
  }

  resize(windowWidth, windowHeight) {
    const { scale, width, height } = computeViewport(windowWidth, windowHeight);
    this.scale = scale;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width * scale}px`;
    this.canvas.style.height = `${height * scale}px`;
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Vycentruje kameru na poschodie. */
  centerOn(grid) {
    this.camera.x = Math.round((grid.width * S - this.canvas.width) / 2);
    this.camera.y = Math.round((grid.height * S - this.canvas.height) / 2);
  }

  /** @param {import('../sim/game.js').Game} game */
  render(game) {
    const { ctx, canvas, camera } = this;
    ctx.fillStyle = '#16171b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vrstva 0 (GDD 2.5): podlahy a steny. Y-sorting entít príde s nábytkom a postavami.
    const grid = game.floors[0];
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const tile = grid.get(x, y);
        if (tile === Tile.EMPTY) continue;
        ctx.drawImage(
          this.tileset,
          FRAMES[tile] * S,
          0,
          S,
          S,
          x * S - camera.x,
          y * S - camera.y,
          S,
          S,
        );
      }
    }
  }
}
