import { RENDER } from '../data/balance.js';
import { OBJECTS } from '../data/objects.js';
import { Tile } from '../sim/grid.js';
import { FRAMES, createPlaceholderTileset } from './tileset.js';
import { createObjectSprites, OVERHANG } from './sprites.js';
import { Camera } from './camera.js';

const S = RENDER.TILE_SIZE;

/**
 * Celočíselné škálovanie (GDD 2.1): vyberie násobok tak, aby virtuálne plátno bolo
 * približne 480×270, a virtuálnu plochu dopočíta podľa okna – obraz vyplní displej
 * a pixely ostanú ostré. Rozmery sú vo fyzických pixeloch displeja (CSS × devicePixelRatio),
 * takže telefón s malým CSS rozlíšením, ale hustým displejom dostane rovnako veľký obraz.
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

function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export class Renderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileset = createPlaceholderTileset(createCanvas);
    this.sprites = createObjectSprites(createCanvas, OBJECTS);
    this.camera = new Camera();
    /**
     * Pomocné vrstvy nastavované z UI.
     * @type {{ hover: {x: number, y: number} | null,
     *          ghost: {type: string, x: number, y: number, valid: boolean} | null,
     *          highlight: import('../sim/floor.js').PlacedObject | null,
     *          debug: boolean }}
     */
    this.overlay = { hover: null, ghost: null, highlight: null, debug: false };
    this.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
  }

  resize(cssWidth, cssHeight, dpr = 1) {
    const { scale, width, height } = computeViewport(
      Math.round(cssWidth * dpr),
      Math.round(cssHeight * dpr),
    );
    this.scale = scale;
    /** Koľko pixelov virtuálneho plátna pripadá na 1 CSS pixel. */
    this.viewPerCss = dpr / scale;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${(width * scale) / dpr}px`;
    this.canvas.style.height = `${(height * scale) / dpr}px`;
    this.ctx.imageSmoothingEnabled = false;
    this.camera.setViewport(width, height);
  }

  /** CSS pixely (clientX/Y) → pixely virtuálneho plátna. */
  clientToView(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * this.viewPerCss,
      y: (clientY - rect.top) * this.viewPerCss,
    };
  }

  /** CSS pixely → súradnice dlaždice. */
  clientToTile(clientX, clientY) {
    const v = this.clientToView(clientX, clientY);
    const w = this.camera.viewToWorld(v.x, v.y);
    return { x: Math.floor(w.x / S), y: Math.floor(w.y / S) };
  }

  /** @param {import('../sim/floor.js').Floor} floor */
  centerOn(floor) {
    this.camera.centerOn(floor.width * S, floor.height * S);
  }

  /** @param {import('../sim/game.js').Game} game */
  render(game, floorIndex = 0) {
    const { ctx, canvas, camera } = this;
    const floor = game.floors[floorIndex];
    camera.clamp(floor.width * S, floor.height * S);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#16171b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(
      camera.zoom,
      0,
      0,
      camera.zoom,
      -Math.round(camera.x * camera.zoom),
      -Math.round(camera.y * camera.zoom),
    );

    this.drawTiles(floor);
    this.drawOverlayUnder(floor);
    this.drawObjects(floor);
    this.drawOverlayOver();
    if (this.overlay.debug) this.drawDebug(floor);
  }

  drawTiles(floor) {
    const { ctx } = this;
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const tile = floor.grid.get(x, y);
        if (tile === Tile.EMPTY) continue;
        ctx.drawImage(this.tileset, FRAMES[tile] * S, 0, S, S, x * S, y * S, S, S);
      }
    }
  }

  /** Vrstva 2 (GDD 2.5): objekty zoradené podľa Y. */
  drawObjects(floor) {
    const { ctx, overlay } = this;
    for (const obj of floor.sortedObjects()) {
      ctx.drawImage(this.sprites[obj.type], obj.x * S, obj.y * S - OVERHANG);
      if (overlay.highlight === obj) {
        const def = OBJECTS[obj.type];
        ctx.fillStyle = 'rgba(224, 83, 63, 0.45)';
        ctx.fillRect(obj.x * S, obj.y * S - OVERHANG, def.width * S, def.height * S + OVERHANG);
      }
    }
  }

  drawOverlayUnder(floor) {
    const { ctx, overlay } = this;
    const { ghost, hover } = overlay;
    if (ghost) {
      const def = OBJECTS[ghost.type];
      ctx.fillStyle = ghost.valid ? 'rgba(79, 179, 107, 0.35)' : 'rgba(224, 83, 63, 0.4)';
      ctx.fillRect(ghost.x * S, ghost.y * S, def.width * S, def.height * S);
      // Dlaždica, odkiaľ sa objekt bude používať.
      if (floor.grid.inBounds(ghost.x + def.interaction.dx, ghost.y + def.interaction.dy)) {
        ctx.strokeStyle = 'rgba(242, 179, 61, 0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          (ghost.x + def.interaction.dx) * S + 4.5,
          (ghost.y + def.interaction.dy) * S + 4.5,
          S - 9,
          S - 9,
        );
      }
    } else if (hover && floor.grid.inBounds(hover.x, hover.y)) {
      ctx.strokeStyle = 'rgba(232, 230, 225, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(hover.x * S + 0.5, hover.y * S + 0.5, S - 1, S - 1);
    }
  }

  drawOverlayOver() {
    const { ctx, overlay } = this;
    const { ghost } = overlay;
    if (!ghost) return;
    ctx.globalAlpha = ghost.valid ? 0.75 : 0.4;
    ctx.drawImage(this.sprites[ghost.type], ghost.x * S, ghost.y * S - OVERHANG);
    ctx.globalAlpha = 1;
  }

  drawDebug(floor) {
    const { ctx } = this;
    ctx.lineWidth = 1 / this.camera.zoom;
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        if (!floor.isWalkable(x, y)) {
          ctx.fillStyle = 'rgba(224, 83, 63, 0.25)';
          ctx.fillRect(x * S, y * S, S, S);
        }
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.35)';
        ctx.strokeRect(x * S, y * S, S, S);
      }
    }
    for (const obj of floor.objects) {
      const t = floor.interactionTile(obj);
      ctx.fillStyle = 'rgba(242, 179, 61, 0.8)';
      ctx.fillRect(t.x * S + 6, t.y * S + 6, 4, 4);
    }
  }
}
