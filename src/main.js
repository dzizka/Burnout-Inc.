import { TIME } from './data/balance.js';
import { FixedStepLoop } from './core/loop.js';
import { Game } from './sim/game.js';
import { Renderer } from './render/renderer.js';
import { loadAssets } from './render/assets.js';
import { Hud } from './ui/hud.js';
import { BuildMenu } from './ui/buildMenu.js';
import { StaffPanel } from './ui/staffPanel.js';
import { ProjectsPanel } from './ui/projectsPanel.js';
import { FinancePanel } from './ui/financePanel.js';
import { GameMenu } from './ui/gameMenu.js';
import { loadGame, saveGame } from './ui/storage.js';
import { Inspector } from './ui/inspector.js';
import { DevMenu } from './ui/devMenu.js';
import { InputController } from './ui/input.js';
import { bindEventToasts } from './ui/eventToasts.js';
import { loadSettings, saveSettings } from './ui/settings.js';
import { detectLocale, setLocale, t } from './i18n/index.js';

const settings = loadSettings();
setLocale(detectLocale(settings.locale ?? null, navigator.languages ?? [navigator.language]));

// Uložená hra má prednosť; inak nová garáž so spoluzakladateľom.
const game =
  loadGame() ??
  (() => {
    const fresh = new Game();
    fresh.setupStarterOffice();
    return fresh;
  })();
const renderer = new Renderer(document.getElementById('gameCanvas'));
renderer.centerOn(game.floors[0]);
// Hra beží hneď s náhradnou grafikou; spritesheety sa doplnia po načítaní.
loadAssets().then((assets) => renderer.setAssets(assets));

let lastFrame = null;
const loop = new FixedStepLoop({
  stepSeconds: 1 / TIME.TICKS_PER_SECOND,
  update: (dt) => game.update(dt),
  render: () => {
    const now = performance.now();
    input.update(lastFrame === null ? 0 : Math.min((now - lastFrame) / 1000, 0.1));
    lastFrame = now;
    buildMenu.updateOverlay();
    renderer.render(game, now / 1000);
    hud.refresh();
    inspector.refresh();
    projectsPanel.refresh();
    financePanel.refresh();
  },
});

const hud = new Hud(game, loop, {
  onLocaleSelected: (locale) => saveSettings({ locale }),
});
const buildMenu = new BuildMenu(game, renderer, hud);
const inspector = new Inspector(game, renderer, hud);
const staffPanel = new StaffPanel(game, hud, {
  onSelect: (employee) => {
    staffPanel.close();
    inspector.select(employee);
  },
  onOpen: () => closePanels(staffPanel),
});
const projectsPanel = new ProjectsPanel(game, hud, { onOpen: () => closePanels(projectsPanel) });
const financePanel = new FinancePanel(game, hud, { onOpen: () => closePanels(financePanel) });
const gameMenu = new GameMenu(game, hud, { onOpen: () => closePanels(gameMenu) });
buildMenu.onOpen = () => closePanels(buildMenu);

/** Naraz je otvorený len jeden panel. */
function closePanels(except) {
  for (const panel of [buildMenu, staffPanel, projectsPanel, financePanel, gameMenu]) {
    if (panel !== except && panel.isOpen) panel.close();
  }
  if (except !== null) inspector.select(null);
}
bindEventToasts(game, hud);

const input = new InputController(renderer, {
  onTap: (tile, world) => {
    if (buildMenu.mode) {
      buildMenu.onTap(tile);
      return;
    }
    const employee = renderer.employeeAt(game, world);
    if (employee?.calmDown(game)) hud.toast(t('toast.calmed', { name: employee.name }));
    inspector.select(employee);
  },
  onHover: (tile) => buildMenu.onHover(tile),
  onCancel: () => {
    if (buildMenu.mode || buildMenu.isOpen) buildMenu.cancel();
    else if (staffPanel.isOpen) staffPanel.close();
    else if (projectsPanel.isOpen) projectsPanel.close();
    else if (financePanel.isOpen) financePanel.close();
    else if (gameMenu.isOpen) gameMenu.close();
    else inspector.select(null);
  },
});
new DevMenu({ game, loop, renderer });

window.addEventListener('resize', () => {
  renderer.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
  renderer.centerOn(game.floors[0]);
});

// Automatické ukladanie každý herný týždeň a pri odchode zo stránky.
game.events.on('week:end', () => saveGame(game));
window.addEventListener('pagehide', () => saveGame(game));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveGame(game);
});

loop.start((cb) => requestAnimationFrame(cb));

if (import.meta.env.DEV) {
  // Prístup z konzoly prehliadača počas vývoja.
  window.game = game;
}
