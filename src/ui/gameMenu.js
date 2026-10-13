import { t, onLocaleChange } from '../i18n/index.js';
import { saveGame, clearSave } from './storage.js';

// Menu hry (uložiť / nová hra) a obrazovka konca hry (bankrot, likvidácia).
// Nová hra = zmazať uloženie a znovu načítať stránku – najjednoduchší čistý štart.

export class GameMenu {
  /**
   * @param {import('../sim/game.js').Game} game
   * @param {{ toast: (m: string) => void }} hud
   * @param {{ onOpen: () => void }} opts
   */
  constructor(game, hud, { onOpen }) {
    this.game = game;
    this.panel = document.getElementById('menu-panel');
    this.overlay = document.getElementById('game-over');
    document.getElementById('btn-menu').addEventListener('click', () => {
      if (this.panel.hidden) {
        onOpen();
        this.panel.hidden = false;
      } else {
        this.close();
      }
    });
    document.getElementById('btn-menu-close').addEventListener('click', () => this.close());
    document.getElementById('btn-save').addEventListener('click', () => {
      hud.toast(t(saveGame(game) ? 'menu.saved' : 'menu.saveFailed'));
    });
    document.getElementById('btn-new-game').addEventListener('click', () => {
      if (window.confirm(t('menu.confirmNew'))) newGame();
    });
    document.getElementById('btn-game-over-new').addEventListener('click', newGame);

    game.events.on('game:over', () => this.showGameOver());
    onLocaleChange(() => this.game.over && this.showGameOver());
    if (game.over) this.showGameOver();
  }

  get isOpen() {
    return !this.panel.hidden;
  }

  close() {
    this.panel.hidden = true;
  }

  showGameOver() {
    const { game } = this;
    const reason = game.over.reason;
    document.getElementById('game-over-title').textContent = t(`gameover.${reason}`);
    document.getElementById('game-over-text').textContent = t(`gameover.${reason}.text`);
    document.getElementById('game-over-stats').textContent = t('gameover.stats', {
      months: game.clock.monthIndex - 1,
      products: game.studio.launchedCount,
      market: game.marketShare.player.toFixed(1),
    });
    this.overlay.hidden = false;
    saveGame(game);
  }
}

function newGame() {
  clearSave();
  window.location.reload();
}
