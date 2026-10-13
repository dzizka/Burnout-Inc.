import { TIME } from '../data/balance.js';

// Skryté vývojárske menu (GDD 10.3). Otvára sa klávesou ~ / ` alebo Ctrl+Shift+D,
// na mobile trojitým ťuknutím na hotovosť. Je to nástroj pre vývoj, preto texty
// nejdú cez i18n.

const TRIPLE_TAP_MS = 500;
const WEEK_S = TIME.DAY_DURATION_S * TIME.DAYS_PER_WEEK;

export class DevMenu {
  /**
   * @param {object} deps
   * @param {import('../sim/game.js').Game} deps.game
   * @param {import('../core/loop.js').FixedStepLoop} deps.loop
   * @param {import('../render/renderer.js').Renderer} deps.renderer
   */
  constructor({ game, loop, renderer }) {
    this.game = game;
    this.loop = loop;
    this.renderer = renderer;
    this.tapCount = 0;
    this.tapTimer = null;

    const actions = [
      ['+ €10 000', () => (game.cash += 10000)],
      ['- €5 000', () => (game.cash -= 5000)],
      ['Škandál 0 %', () => (game.scandal = 0)],
      ['Škandál 95 %', () => (game.scandal = 95)],
      ['Debug mriežka', () => (renderer.overlay.debug = !renderer.overlay.debug)],
      ['Rýchlosť 10x', () => (loop.speed = loop.speed === 10 ? 1 : 10)],
      ['+1 týždeň', () => game.update(WEEK_S)],
      ['+1 mesiac', () => game.update(WEEK_S * TIME.WEEKS_PER_MONTH)],
    ];

    this.panel = document.createElement('div');
    this.panel.id = 'dev-menu';
    this.panel.hidden = true;
    const header = document.createElement('div');
    header.className = 'dev-header';
    header.textContent = '[DEV CONSOLE]';
    const close = document.createElement('button');
    close.textContent = '×';
    close.addEventListener('click', () => this.toggle());
    header.append(close);
    const grid = document.createElement('div');
    grid.className = 'dev-grid';
    for (const [label, action] of actions) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.addEventListener('click', action);
      grid.append(btn);
    }
    this.panel.append(header, grid);
    document.getElementById('ui-layer').append(this.panel);

    window.addEventListener('keydown', (e) => {
      if (e.key === '~' || e.key === '`' || (e.ctrlKey && e.shiftKey && e.code === 'KeyD')) {
        e.preventDefault();
        this.toggle();
      }
    });
    document.getElementById('cash-display').addEventListener('pointerdown', () => {
      this.tapCount++;
      clearTimeout(this.tapTimer);
      this.tapTimer = setTimeout(() => (this.tapCount = 0), TRIPLE_TAP_MS);
      if (this.tapCount >= 3) {
        this.tapCount = 0;
        this.toggle();
      }
    });
  }

  toggle() {
    this.panel.hidden = !this.panel.hidden;
  }
}
