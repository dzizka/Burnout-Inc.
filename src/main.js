import { TIME } from './data/balance.js';
import { FixedStepLoop } from './core/loop.js';
import { Game } from './sim/game.js';
import { Renderer } from './render/renderer.js';
import { Hud } from './ui/hud.js';
import { BuildMenu } from './ui/buildMenu.js';
import { DevMenu } from './ui/devMenu.js';
import { InputController } from './ui/input.js';
import { loadSettings, saveSettings } from './ui/settings.js';
import { detectLocale, setLocale } from './i18n/index.js';

const settings = loadSettings();
setLocale(detectLocale(settings.locale ?? null, navigator.languages ?? [navigator.language]));

const game = new Game();
const renderer = new Renderer(document.getElementById('gameCanvas'));
renderer.centerOn(game.floors[0]);

let lastFrame = null;
const loop = new FixedStepLoop({
  stepSeconds: 1 / TIME.TICKS_PER_SECOND,
  update: (dt) => game.update(dt),
  render: () => {
    const now = performance.now();
    input.update(lastFrame === null ? 0 : Math.min((now - lastFrame) / 1000, 0.1));
    lastFrame = now;
    buildMenu.updateOverlay();
    renderer.render(game);
    hud.refresh();
  },
});

const hud = new Hud(game, loop, {
  onLocaleSelected: (locale) => saveSettings({ locale }),
});
const buildMenu = new BuildMenu(game, renderer, hud);
const input = new InputController(renderer, {
  onTap: (tile) => buildMenu.onTap(tile),
  onHover: (tile) => buildMenu.onHover(tile),
  onCancel: () => buildMenu.cancel(),
});
new DevMenu({ game, loop, renderer });

window.addEventListener('resize', () => {
  renderer.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
  renderer.centerOn(game.floors[0]);
});

loop.start((cb) => requestAnimationFrame(cb));

if (import.meta.env.DEV) {
  // Prístup z konzoly prehliadača počas vývoja.
  window.game = game;
}
