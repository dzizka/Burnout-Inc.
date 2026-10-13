// Spritesheety z free/CC0 balíkov (docs/ASSETS.md). Ak sa obrázok nenačíta, renderer
// použije náhradnú grafiku kreslenú kódom – hra tak funguje aj bez assetov.

export const SHEETS = {
  /** Kenney Roguelike Indoor pack – 16×16, medzera 1 px, 26 stĺpcov. */
  indoor: { url: 'assets/kenney/indoor.png', tile: 16, spacing: 1, cols: 26 },
  /** Kenney RPG Urban Pack (packed) – 16×16 bez medzier, 27 stĺpcov. */
  urban: { url: 'assets/kenney/urban.png', tile: 16, spacing: 0, cols: 27 },
  /** Kenney Emotes Pack, pixel štýl 1 – 16×16, 10 stĺpcov. */
  emotes: { url: 'assets/kenney/emotes.png', tile: 16, spacing: 0, cols: 10 },
  /**
   * LimeZu Modern Office (platené) – v repe NIE JE, pribalí sa pri deployi zo súkromného
   * repa. Objekty nie sú zarovnané na mriežku, preto sa z neho reže podľa pixelov.
   */
  lzOffice: { url: 'assets/limezu/office.png', tile: 16, spacing: 0, cols: 16 },
  /** LimeZu Room Builder Office (platené) – steny a podlahy. */
  lzRoom: { url: 'assets/limezu/room.png', tile: 16, spacing: 0, cols: 16 },
};

/** Ľavý horný roh dlaždice s poradovým číslom `id` v spritesheete. */
export function frameRect(sheet, id) {
  const step = sheet.tile + sheet.spacing;
  return { sx: (id % sheet.cols) * step, sy: Math.floor(id / sheet.cols) * step };
}

/**
 * @typedef {{ indoor: HTMLImageElement | null, urban: HTMLImageElement | null,
 *             emotes: HTMLImageElement | null, lzOffice: HTMLImageElement | null,
 *             lzRoom: HTMLImageElement | null }} Assets
 */

/** Prázdna sada – renderer kreslí náhradnú grafiku. */
export const NO_ASSETS = { indoor: null, urban: null, emotes: null, lzOffice: null, lzRoom: null };

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** @returns {Promise<Assets>} */
export async function loadAssets() {
  const entries = await Promise.all(
    Object.entries(SHEETS).map(async ([key, sheet]) => [key, await loadImage(sheet.url)]),
  );
  return Object.fromEntries(entries);
}

/**
 * Nakreslí dlaždicu `id` zo spritesheetu.
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawTile(ctx, image, sheet, id, dx, dy, flip = false) {
  const { sx, sy } = frameRect(sheet, id);
  const t = sheet.tile;
  if (!flip) {
    ctx.drawImage(image, sx, sy, t, t, dx, dy, t, t);
    return;
  }
  ctx.save();
  ctx.translate(dx + t, dy);
  ctx.scale(-1, 1);
  ctx.drawImage(image, sx, sy, t, t, 0, 0, t, t);
  ctx.restore();
}
