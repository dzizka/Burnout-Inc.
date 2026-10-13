import { OBJECTS } from '../data/objects.js';
import { BuyError } from '../sim/game.js';
import { PlaceError } from '../sim/floor.js';
import { t, formatMoney, onLocaleChange } from '../i18n/index.js';

// Režim stavania (GDD 8.1C „Stavať“, 8.3): výber objektu z katalógu, náhľad
// na dlaždici, umiestnenie ťuknutím/klikom a predaj.

const ERROR_KEYS = {
  [BuyError.NO_MONEY]: 'toast.noMoney',
  [PlaceError.OUT_OF_BOUNDS]: 'toast.blocked',
  [PlaceError.BLOCKED]: 'toast.blocked',
  [PlaceError.NO_ACCESS]: 'toast.noAccess',
  [PlaceError.BLOCKS_ACCESS]: 'toast.blocksAccess',
};

export class BuildMenu {
  /**
   * @param {import('../sim/game.js').Game} game
   * @param {import('../render/renderer.js').Renderer} renderer
   * @param {{ toast: (message: string) => void }} hud
   */
  constructor(game, renderer, hud) {
    this.game = game;
    this.renderer = renderer;
    this.hud = hud;
    this.floorIndex = 0;
    /** @type {null | { kind: 'place', type: string } | { kind: 'sell' }} */
    this.mode = null;
    this.hover = null;

    this.panel = document.getElementById('build-panel');
    this.list = document.getElementById('build-items');
    this.dockButton = document.getElementById('tab-build');
    this.sellButton = document.getElementById('btn-sell');

    this.dockButton.addEventListener('click', () => this.toggle());
    document.getElementById('btn-build-close').addEventListener('click', () => this.close());
    this.sellButton.addEventListener('click', () =>
      this.setMode(this.mode?.kind === 'sell' ? null : { kind: 'sell' }),
    );

    this.renderItems();
    onLocaleChange(() => this.renderItems());
  }

  get isOpen() {
    return !this.panel.hidden;
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.panel.hidden = false;
    this.dockButton.classList.add('active');
  }

  close() {
    this.panel.hidden = true;
    this.dockButton.classList.remove('active');
    this.setMode(null);
  }

  /** Escape / späť: najprv zruší režim, potom zavrie panel. */
  cancel() {
    if (this.mode) this.setMode(null);
    else if (this.isOpen) this.close();
  }

  setMode(mode) {
    this.mode = mode;
    this.list.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', mode?.kind === 'place' && btn.dataset.type === mode.type);
    });
    this.sellButton.classList.toggle('active', mode?.kind === 'sell');
    this.updateOverlay();
  }

  renderItems() {
    this.list.replaceChildren(
      ...Object.values(OBJECTS).map((def) => {
        const btn = document.createElement('button');
        btn.dataset.type = def.id;
        btn.className = 'build-item';
        btn.innerHTML = `<span class="name"></span><span class="price"></span>`;
        btn.querySelector('.name').textContent = t(`object.${def.id}`);
        btn.querySelector('.price').textContent = formatMoney(def.price);
        btn.addEventListener('click', () =>
          this.setMode(
            this.mode?.kind === 'place' && this.mode.type === def.id
              ? null
              : { kind: 'place', type: def.id },
          ),
        );
        return btn;
      }),
    );
    this.setMode(this.mode);
  }

  /** @param {{x: number, y: number} | null} tile */
  onHover(tile) {
    this.hover = tile;
    this.updateOverlay();
  }

  /** @param {{x: number, y: number}} tile */
  onTap(tile) {
    const floor = this.game.floors[this.floorIndex];
    if (this.mode?.kind === 'place') {
      const result = this.game.buyObject(this.floorIndex, this.mode.type, tile.x, tile.y);
      if (!result.ok) this.hud.toast(t(ERROR_KEYS[result.error]));
    } else if (this.mode?.kind === 'sell') {
      const obj = floor.objectAt(tile.x, tile.y);
      if (obj) {
        const refund = this.game.sellObject(this.floorIndex, obj);
        this.hud.toast(
          t('toast.sold', { name: t(`object.${obj.type}`), amount: formatMoney(refund) }),
        );
      }
    }
    this.updateOverlay();
  }

  /** Prepočíta náhľad pre renderer (volať aj po zmene peňazí). */
  updateOverlay() {
    const overlay = this.renderer.overlay;
    const floor = this.game.floors[this.floorIndex];
    overlay.hover = this.hover;
    overlay.ghost = null;
    overlay.highlight = null;
    if (!this.hover) return;
    if (this.mode?.kind === 'place') {
      const def = OBJECTS[this.mode.type];
      overlay.ghost = {
        type: def.id,
        x: this.hover.x,
        y: this.hover.y,
        valid:
          floor.checkPlacement(def.id, this.hover.x, this.hover.y) === null &&
          this.game.canAfford(def.price),
      };
    } else if (this.mode?.kind === 'sell') {
      overlay.highlight = floor.objectAt(this.hover.x, this.hover.y) ?? null;
    }
  }
}
