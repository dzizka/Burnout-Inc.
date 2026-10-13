// Kamera: posun a zoom nad svetom (GDD 2.2). Súradnice:
// - "view" = pixely virtuálneho plátna (po celočíselnom škálovaní)
// - "world" = pixely herného sveta (dlaždica = TILE_SIZE)

export const ZOOM_LEVELS = [1, 1.5, 2];

export class Camera {
  constructor() {
    this.x = 0; // svetová súradnica ľavého horného rohu pohľadu
    this.y = 0;
    this.zoom = 1;
    this.viewWidth = 0;
    this.viewHeight = 0;
  }

  setViewport(width, height) {
    this.viewWidth = width;
    this.viewHeight = height;
  }

  viewToWorld(vx, vy) {
    return { x: this.x + vx / this.zoom, y: this.y + vy / this.zoom };
  }

  worldToView(wx, wy) {
    return { x: (wx - this.x) * this.zoom, y: (wy - this.y) * this.zoom };
  }

  /** Posun o vzdialenosť v pixeloch pohľadu (ťahanie prstom/myšou). */
  panByView(dvx, dvy) {
    this.x -= dvx / this.zoom;
    this.y -= dvy / this.zoom;
  }

  /** Zmení zoom a zachová svetový bod pod (vx, vy) na mieste. */
  zoomAt(newZoom, vx, vy) {
    const before = this.viewToWorld(vx, vy);
    this.zoom = newZoom;
    this.x = before.x - vx / newZoom;
    this.y = before.y - vy / newZoom;
  }

  /** Krok v ZOOM_LEVELS (+1 / -1). */
  stepZoom(direction, vx, vy) {
    const index = ZOOM_LEVELS.indexOf(this.zoom);
    const next = ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + direction))];
    if (next !== this.zoom) this.zoomAt(next, vx, vy);
  }

  centerOn(worldWidth, worldHeight) {
    this.x = worldWidth / 2 - this.viewWidth / this.zoom / 2;
    this.y = worldHeight / 2 - this.viewHeight / this.zoom / 2;
  }

  /** Nedovolí odísť so svetom úplne mimo obrazovky (ostane aspoň `margin` px). */
  clamp(worldWidth, worldHeight, margin = 32) {
    const w = this.viewWidth / this.zoom;
    const h = this.viewHeight / this.zoom;
    this.x = Math.min(Math.max(this.x, margin - w), worldWidth - margin);
    this.y = Math.min(Math.max(this.y, margin - h), worldHeight - margin);
  }
}
