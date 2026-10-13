import { RENDER } from '../data/balance.js';
import { Activity } from '../sim/employee.js';
import { SHEETS, drawTile } from './assets.js';

// Postavičky (GDD 2.3C): Kenney RPG Urban Pack – 6 postáv, 4 smery, 3 snímky chôdze.
// Bez spritesheetu sa kreslí náhradná postavička kódom.

/** RPG Urban Pack: postavy sú v stĺpcoch 23–26, každá zaberá 3 riadky (snímky chôdze). */
const URBAN_CHAR = { FIRST_COL: 23, ROWS_PER_CHAR: 3 };
/** Stĺpec podľa smeru pohľadu. */
const DIR_COL = { left: 0, down: 1, up: 2, right: 3 };
/** Poradie snímok pri chôdzi: stoj, krok, stoj, druhý krok. */
const WALK_CYCLE = [0, 1, 0, 2];

const S = RENDER.TILE_SIZE;
const PANTS = '#2a2d36';
const EYES = '#1a1a1a';

/** Svetové súradnice chodidiel postavy (pre Y-sorting). */
export function feetY(employee) {
  return employee.y * S + 13;
}

const SITTING = new Set([Activity.WORKING, Activity.HYPERACTIVE, Activity.STRIKE]);

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../sim/employee.js').Employee} e
 * @param {number} time sekundy (na animácie)
 * @param {import('./assets.js').Assets} assets
 */
export function drawEmployee(ctx, e, time, assets) {
  if (assets.urban) drawSpriteEmployee(ctx, e, time, assets.urban);
  else drawFallbackEmployee(ctx, e, time);
}

function drawSpriteEmployee(ctx, e, time, image) {
  let cx = Math.round(e.x * S + S / 2);
  let feet = Math.round(feetY(e));
  const walking = e.isWalking;
  const sitting = !walking && SITTING.has(e.activity) && e.facing === 'up';
  if (sitting) feet -= 3;
  if (e.activity === Activity.DRAMA_QUEEN) cx += Math.round(Math.sin(time * 40));
  if (e.activity === Activity.ASLEEP) feet += 1;
  const hyper = e.activity === Activity.HYPERACTIVE;

  let frame = 0;
  if (walking) frame = WALK_CYCLE[Math.floor(time * 8) % WALK_CYCLE.length];
  else if (hyper || e.activity === Activity.DRAMA_QUEEN) frame = 1 + (Math.floor(time * 10) % 2);
  // Pri spánku a záchvate sa otočí k hráčovi.
  const facing = [Activity.ASLEEP, Activity.DRAMA_QUEEN].includes(e.activity) ? 'down' : e.facing;
  const row = (e.look.sprite ?? 0) * URBAN_CHAR.ROWS_PER_CHAR + frame;
  const id = row * SHEETS.urban.cols + URBAN_CHAR.FIRST_COL + DIR_COL[facing];

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(cx - 4, feet - 1, 8, 2);
  drawTile(ctx, image, SHEETS.urban, id, cx - 8, feet - 15);
}

function drawFallbackEmployee(ctx, e, time) {
  const { shirt, hair, skin } = e.look;
  let cx = Math.round(e.x * S + S / 2);
  let feet = Math.round(feetY(e));
  const walking = e.isWalking;
  const sitting = !walking && SITTING.has(e.activity) && e.facing === 'up';
  if (sitting) feet -= 3; // sedí na stoličke pri stole
  if (e.activity === Activity.DRAMA_QUEEN) cx += Math.round(Math.sin(time * 40));
  const hyper = e.activity === Activity.HYPERACTIVE;
  const step = walking ? Math.floor(time * 8) % 2 : 0;
  const bob = (!walking && Math.floor(time * (hyper ? 12 : 2)) % 2) || 0;

  // tieň
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(cx - 4, feet - 1, 8, 2);

  const top = feet - 15 + (e.activity === Activity.ASLEEP ? 2 : 0);
  // nohy
  if (!sitting) {
    ctx.fillStyle = PANTS;
    ctx.fillRect(cx - 3, feet - 4, 2, 4 - step);
    ctx.fillRect(cx + 1, feet - 4, 2, 4 - (1 - step) * (walking ? 1 : 0));
  }
  // telo
  ctx.fillStyle = shirt;
  ctx.fillRect(cx - 4, top + 7 + bob, 8, 5);
  // ruky
  if (e.activity === Activity.DRAMA_QUEEN) {
    ctx.fillRect(cx - 6, top + 3, 2, 5);
    ctx.fillRect(cx + 4, top + 3, 2, 5);
  } else {
    ctx.fillRect(cx - 5, top + 8 + bob, 1, 3);
    ctx.fillRect(cx + 4, top + 8 + bob, 1, 3);
  }
  // hlava
  const headY = top + 1 + bob;
  ctx.fillStyle = skin;
  ctx.fillRect(cx - 3, headY, 6, 6);
  ctx.fillStyle = hair;
  if (e.facing === 'up') {
    ctx.fillRect(cx - 3, headY, 6, 5);
  } else if (e.facing === 'down') {
    ctx.fillRect(cx - 3, headY, 6, 2);
    ctx.fillStyle = EYES;
    if (e.activity === Activity.ASLEEP) {
      ctx.fillRect(cx - 2, headY + 3, 2, 1);
      ctx.fillRect(cx + 1, headY + 3, 2, 1);
    } else {
      ctx.fillRect(cx - 2, headY + 3, 1, 1 + (hyper ? 1 : 0));
      ctx.fillRect(cx + 1, headY + 3, 1, 1 + (hyper ? 1 : 0));
    }
  } else {
    const dir = e.facing === 'left' ? -1 : 1;
    ctx.fillRect(cx - 3, headY, 6, 2);
    ctx.fillRect(dir > 0 ? cx - 3 : cx + 1, headY, 2, 5);
    ctx.fillStyle = EYES;
    ctx.fillRect(cx + dir * 2 - (dir > 0 ? 1 : 0), headY + 3, 1, 1);
  }
}

/** Kruh pod vybranou postavou. */
export function drawSelection(ctx, e) {
  const cx = Math.round(e.x * S + S / 2);
  const feet = Math.round(feetY(e));
  ctx.strokeStyle = '#f2b33d';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 6.5, feet - 1.5, 13, 4);
}
