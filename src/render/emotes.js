import { RENDER } from '../data/balance.js';
import { Activity } from '../sim/employee.js';
import { feetY } from './characters.js';

// Plávajúce stavové ikony nad hlavou (GDD 2.3C) – 7×7 pixel art v bubline.

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

/** @param {CanvasRenderingContext2D} ctx */
export function drawEmote(ctx, e, time) {
  const emote = emoteFor(e);
  if (!emote) return;
  const cx = Math.round(e.x * S + S / 2);
  const float = Math.round(Math.sin(time * 3 + e.id) * 1);
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
  const rows = ICONS[emote.icon];
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === '.') continue;
      ctx.fillStyle = COLORS[ch];
      ctx.fillRect(x + 2 + c, y + 2 + r, 1, 1);
    }
  }
}
