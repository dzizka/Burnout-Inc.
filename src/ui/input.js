// Jednotné ovládanie myšou aj dotykom cez Pointer Events (GDD 2.2, 8.3).
// - ťahanie (ľavé/pravé tlačidlo, jeden prst) = posun kamery
// - klik / ťuknutie bez pohybu = akcia na dlaždici
// - koliesko / pinch dvoma prstami = zoom
// - WASD / šípky = posun, Escape = zrušiť

const DRAG_THRESHOLD_PX = 8; // CSS pixely, kým sa ťuknutie zmení na ťahanie
const PINCH_STEP = 1.25; // pomer vzdialenosti prstov pre jeden krok zoomu
const KEY_PAN_SPEED = 180; // pixely pohľadu za sekundu

const PAN_KEYS = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

export class InputController {
  /**
   * @param {import('../render/renderer.js').Renderer} renderer
   * @param {{ onTap: (tile: {x: number, y: number}, world: {x: number, y: number}) => void,
   *           onHover: (tile: {x: number, y: number} | null) => void,
   *           onCancel: () => void }} handlers
   */
  constructor(renderer, handlers) {
    this.renderer = renderer;
    this.camera = renderer.camera;
    this.handlers = handlers;
    /** @type {Map<number, {x: number, y: number, startX: number, startY: number, dragging: boolean}>} */
    this.pointers = new Map();
    this.pinch = null;
    this.keys = new Set();

    const canvas = renderer.canvas;
    canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    canvas.addEventListener('pointermove', (e) => this.onMove(e));
    canvas.addEventListener('pointerup', (e) => this.onUp(e));
    canvas.addEventListener('pointercancel', (e) => this.onCancelPointer(e));
    canvas.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && !this.pointers.size) handlers.onHover(null);
    });
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      if (isTyping(e) || e.ctrlKey || e.metaKey) return;
      if (e.code in PAN_KEYS) this.keys.add(e.code);
      if (e.code === 'Escape') handlers.onCancel();
      if (e.code === 'Equal' || e.code === 'NumpadAdd') this.zoomCenter(+1);
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') this.zoomCenter(-1);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  /** Plynulý posun klávesnicou; volať každú snímku s reálnym časom. */
  update(realDt) {
    let dx = 0;
    let dy = 0;
    for (const code of this.keys) {
      dx += PAN_KEYS[code][0];
      dy += PAN_KEYS[code][1];
    }
    if (dx || dy) this.camera.panByView(-dx * KEY_PAN_SPEED * realDt, -dy * KEY_PAN_SPEED * realDt);
  }

  zoomCenter(direction) {
    this.camera.stepZoom(direction, this.camera.viewWidth / 2, this.camera.viewHeight / 2);
  }

  onDown(e) {
    this.renderer.canvas.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      dragging: e.pointerType === 'mouse' && e.button !== 0,
    });
    if (this.pointers.size === 2) this.startPinch();
  }

  onMove(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p) {
      if (e.pointerType === 'mouse') {
        this.handlers.onHover(this.renderer.clientToTile(e.clientX, e.clientY));
      }
      return;
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;

    if (this.pinch) {
      this.updatePinch();
      return;
    }
    if (!p.dragging && Math.hypot(p.x - p.startX, p.y - p.startY) > DRAG_THRESHOLD_PX) {
      p.dragging = true;
    }
    if (p.dragging) {
      const k = this.renderer.viewPerCss;
      this.camera.panByView(dx * k, dy * k);
    }
    if (e.pointerType === 'mouse') {
      this.handlers.onHover(this.renderer.clientToTile(e.clientX, e.clientY));
    }
  }

  onUp(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    this.pointers.delete(e.pointerId);
    if (this.pinch) {
      // Po pinchi nevyhodnocuj ťuknutie, kým sa nezdvihnú všetky prsty.
      if (this.pointers.size < 2) this.pinch = { ended: true };
      if (this.pointers.size === 0) this.pinch = null;
      return;
    }
    if (!p.dragging) {
      const tile = this.renderer.clientToTile(e.clientX, e.clientY);
      if (e.pointerType !== 'mouse') this.handlers.onHover(tile);
      this.handlers.onTap(tile, this.renderer.clientToWorld(e.clientX, e.clientY));
    }
  }

  onCancelPointer(e) {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 0) this.pinch = null;
  }

  onWheel(e) {
    e.preventDefault();
    const v = this.renderer.clientToView(e.clientX, e.clientY);
    this.camera.stepZoom(e.deltaY < 0 ? +1 : -1, v.x, v.y);
  }

  pinchGeometry() {
    const [a, b] = [...this.pointers.values()];
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
    };
  }

  startPinch() {
    const g = this.pinchGeometry();
    this.pinch = { baseDistance: g.distance, midX: g.midX, midY: g.midY };
  }

  updatePinch() {
    if (this.pointers.size !== 2 || this.pinch.ended) return;
    const g = this.pinchGeometry();
    const k = this.renderer.viewPerCss;
    this.camera.panByView((g.midX - this.pinch.midX) * k, (g.midY - this.pinch.midY) * k);
    this.pinch.midX = g.midX;
    this.pinch.midY = g.midY;
    const ratio = g.distance / this.pinch.baseDistance;
    if (ratio > PINCH_STEP || ratio < 1 / PINCH_STEP) {
      const v = this.renderer.clientToView(g.midX, g.midY);
      this.camera.stepZoom(ratio > 1 ? +1 : -1, v.x, v.y);
      this.pinch.baseDistance = g.distance;
    }
  }
}

function isTyping(e) {
  return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
}
