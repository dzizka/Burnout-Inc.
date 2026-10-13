import { RENDER } from '../data/balance.js';
import { Activity } from '../sim/employee.js';
import { feetY } from './characters.js';
import { SHEETS, drawTile } from './assets.js';

// Plávajúce stavové ikony nad hlavou (GDD 2.3C). Bublina a väčšina ikon je z Kenney
// Emotes Pack; čo tam nie je (káva, jedlo, cigareta, lietadielko), dokreslíme 7×7 pixelmi
// do prázdnej bubliny. Bez spritesheetu sa kreslí celá bublina kódom.

/** Kenney Emotes Pack (pixel style 1) – poradové čísla dlaždíc. */
const KENNEY_EMOTE = {
  bubble: 0,
  dots: 3,
  bang: 7,
  question: 9,
  zzz: 11,
  sweat: 12,
  bolt: 18,
  ball: 19,
  drop: 20,
  dollar: 23,
  plane: 28, // „HAHA“ – prank
  smoke: 29, // obláčik dymu
};

const S = RENDER.TILE_SIZE;

const COLORS = {
  k: '#1a1a1a',
  w: '#ffffff',
  b: '#7a4a2a',
  r: '#d84a3a',
  o: '#e07b39',
  y: '#f2c53d',
  g: '#4fb36b',
  u: '#4f8fd8',
  s: '#b8bcc4',
};

/** Ikony ako mriežka znakov (. = priehľadné). */
const ICONS = {
  coffee: ['.......', '.wwwww.', '.wbbbww', '.wbbbw.', '.wwwww.', '..www..', '.......'],
  food: ['...g...', '..g....', '.rrrrr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..r.r..'],
  drop: ['...u...', '...u...', '..uuu..', '.uuuuu.', '.uuwuu.', '.uuuuu.', '..uuu..'],
  smoke: ['....s..', '...s...', '....s..', '.......', 'wwwwwoo', 'wwwwwoo', '.......'],
  bang: ['...r...', '..rrr..', '..rrr..', '..rrr..', '...r...', '.......', '...r...'],
  zzz: ['.......', '.kkkk..', '...k...', '..k....', '.kkkk..', '.......', '.......'],
  ball: ['..ooo..', '.ookoo.', 'ookkkoo', 'oookooo', 'ookkkoo', '.ookoo.', '..ooo..'],
  bolt: ['...yy..', '..yy...', '.yyyyy.', '...yy..', '..yy...', '.yy....', '.......'],
  dollar: ['...g...', '.gggg..', '.g.....', '..ggg..', '.....g.', '.gggg..', '...g...'],
  plane: ['.......', 'w......', 'www....', 'wwwww..', 'wwwwwww', 'swss...', '.......'],
  dots: ['.......', '.......', '.......', 'k.k.k..', '.......', '.......', '.......'],
  question: ['..kkk..', '.k...k.', '.....k.', '...kk..', '...k...', '.......', '...k...'],
  sweat: ['...u...', '..uu...', '.uuu...', '.uuu...', '..u....', '.......', '.......'],
};

/** Ikona potreby, ktorej objekt chýba (D10). */
const NEED_ICON = {
  energy: 'coffee',
  satiety: 'food',
  hygiene: 'drop',
  peace: 'smoke',
  fun: 'ball',
};

const ACTIVITY_ICON = {
  [Activity.COFFEE_BREAK]: 'coffee',
  [Activity.VENDING_MACHINE]: 'food',
  [Activity.TOILET]: 'drop',
  [Activity.SMOKE_BREAK]: 'smoke',
  [Activity.PRANK_COWORKER]: 'plane',
  [Activity.DRAMA_QUEEN]: 'bang',
  [Activity.ASLEEP]: 'zzz',
  [Activity.SLACKING]: 'ball',
  [Activity.LOUNGE]: 'ball',
  [Activity.HYPERACTIVE]: 'bolt',
  [Activity.STRIKE]: 'dollar',
  [Activity.IDLE]: 'question',
};

/** @returns {{ icon: string, alert: boolean } | null} */
export function emoteFor(e) {
  if (e.flash?.kind === 'prank') return { icon: 'sweat', alert: false };
  if (e.waiting) return { icon: 'dots', alert: false };
  const icon = ACTIVITY_ICON[e.activity];
  if (icon) {
    const alert = [Activity.DRAMA_QUEEN, Activity.STRIKE, Activity.IDLE].includes(e.activity);
    return { icon, alert };
  }
  if (e.missing) return { icon: NEED_ICON[e.missing], alert: true };
  return null;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./assets.js').Assets} assets
 */
export function drawEmote(ctx, e, time, assets) {
  const emote = emoteFor(e);
  if (!emote) return;
  const cx = Math.round(e.x * S + S / 2);
  const float = Math.round(Math.sin(time * 3 + e.id) * 1);
  if (assets.emotes) {
    const x = cx - 8;
    const y = Math.round(feetY(e)) - 31 + float;
    const kenney = KENNEY_EMOTE[emote.icon];
    if (kenney !== undefined) {
      drawTile(ctx, assets.emotes, SHEETS.emotes, kenney, x, y);
    } else {
      drawTile(ctx, assets.emotes, SHEETS.emotes, KENNEY_EMOTE.bubble, x, y);
      // Kenney bublina je biela – biele pixely ikony prefarbíme na sivú.
      drawPixels(ctx, ICONS[emote.icon], x + 4, y + 3, { w: '#8a8f99' });
    }
    if (emote.alert) {
      // Červená bodka = problém, ktorý by mal hráč riešiť.
      ctx.fillStyle = '#e0533f';
      ctx.fillRect(x + 12, y + 1, 3, 3);
    }
    return;
  }
  const x = cx - 5;
  const y = Math.round(feetY(e)) - 28 + float;
  // bublina s chvostíkom
  ctx.fillStyle = emote.alert ? '#e0533f' : '#f4f1ea';
  ctx.fillRect(x + 1, y, 9, 11);
  ctx.fillRect(x, y + 1, 11, 9);
  ctx.fillRect(x + 4, y + 11, 3, 1);
  ctx.fillRect(x + 5, y + 12, 1, 1);
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(x + 1, y + 1, 9, 9);
  drawPixels(ctx, ICONS[emote.icon], x + 2, y + 2);
}

function drawPixels(ctx, rows, x, y, overrides = {}) {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === '.') continue;
      ctx.fillStyle = overrides[ch] ?? COLORS[ch];
      ctx.fillRect(x + c, y + r, 1, 1);
    }
  }
}
