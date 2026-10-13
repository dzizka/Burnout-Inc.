import { TIME } from './data/balance.js';
import { FixedStepLoop } from './core/loop.js';
import { Game } from './sim/game.js';
import { Renderer } from './render/renderer.js';
import { Hud } from './ui/hud.js';
import { loadSettings, saveSettings } from './ui/settings.js';
import { detectLocale, setLocale } from './i18n/index.js';

const settings = loadSettings();
setLocale(detectLocale(settings.locale ?? null, navigator.languages ?? [navigator.language]));

const game = new Game();
const renderer = new Renderer(document.getElementById('gameCanvas'));
renderer.centerOn(game.floors[0]);

const loop = new FixedStepLoop({
  stepSeconds: 1 / TIME.TICKS_PER_SECOND,
  update: (dt) => game.update(dt),
  render: () => {
    renderer.render(game);
    hud.refresh();
  },
});

const hud = new Hud(game, loop, {
  onLocaleSelected: (locale) => saveSettings({ locale }),
});

window.addEventListener('resize', () => {
  renderer.resize(window.innerWidth, window.innerHeight);
  renderer.centerOn(game.floors[0]);
});

loop.start((cb) => requestAnimationFrame(cb));

if (import.meta.env.DEV) {
  // Prístup z konzoly prehliadača počas vývoja.
  window.game = game;
}
