import { TIME } from '../data/balance.js';
import { t, formatMoney, getLocale, setLocale, onLocaleChange, LOCALES } from '../i18n/index.js';

// HTML/DOM overlay nad canvasom (GDD 8.1, 8.4).

/** Preloží všetky elementy s data-i18n / data-i18n-title. */
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
    el.setAttribute('aria-label', el.title);
  });
  document.documentElement.lang = getLocale();
}

function formatClock(minuteOfDay) {
  const h = Math.floor(minuteOfDay / 60);
  const m = Math.floor(minuteOfDay % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export class Hud {
  /**
   * @param {import('../sim/game.js').Game} game
   * @param {import('../core/loop.js').FixedStepLoop} loop
   * @param {{ onLocaleSelected: (locale: string) => void }} opts
   */
  constructor(game, loop, { onLocaleSelected }) {
    this.game = game;
    this.loop = loop;
    this.el = {
      cash: document.getElementById('cash-display'),
      day: document.getElementById('day-display'),
      clock: document.getElementById('clock-display'),
      marketPlayer: document.getElementById('market-player'),
      marketValue: document.getElementById('market-value'),
      scandalFill: document.getElementById('scandal-fill'),
      scandalValue: document.getElementById('scandal-value'),
      speedButtons: document.querySelectorAll('[data-speed]'),
      langButton: document.getElementById('btn-lang'),
      toast: document.getElementById('toast'),
    };

    this.el.speedButtons.forEach((btn) =>
      btn.addEventListener('click', () => this.setSpeed(Number(btn.dataset.speed))),
    );
    window.addEventListener('keydown', (e) => this.onKey(e));

    this.el.langButton.addEventListener('click', () => {
      const codes = Object.keys(LOCALES);
      const next = codes[(codes.indexOf(getLocale()) + 1) % codes.length];
      setLocale(next);
      onLocaleSelected(next);
    });

    document
      .querySelectorAll('#bottom-dock button:not(#tab-build)')
      .forEach((btn) => btn.addEventListener('click', () => this.toast(t('toast.comingSoon'))));

    game.events.on('month:end', ({ month }) => this.toast(t('toast.monthEnd', { month })));

    onLocaleChange(() => {
      applyTranslations();
      this.refresh();
    });
    applyTranslations();
    this.lastSpeed = 1;
    this.setSpeed(1);
  }

  setSpeed(speed) {
    if (!TIME.SPEEDS.includes(speed)) return;
    if (speed > 0) this.lastSpeed = speed;
    this.loop.speed = speed;
    this.el.speedButtons.forEach((btn) =>
      btn.classList.toggle('active', Number(btn.dataset.speed) === speed),
    );
  }

  onKey(e) {
    if (e.target instanceof HTMLInputElement) return;
    if (e.code === 'Space') {
      e.preventDefault();
      this.setSpeed(this.loop.speed === 0 ? this.lastSpeed : 0);
    } else if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
      this.setSpeed(Number(e.code.slice(-1)));
    }
  }

  toast(message) {
    const { toast } = this.el;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
  }

  /** Volané každú snímku; mení DOM len pri zmene textu. */
  refresh() {
    const { game, el } = this;
    setText(el.cash, formatMoney(game.cash));
    el.cash.classList.toggle('negative', game.cash < 0);
    const { clock } = game;
    setText(
      el.day,
      `${t(`cal.weekday.${clock.weekday}`)} ${formatClock(clock.minuteOfDay)} · ${t('cal.week', { week: clock.weekOfMonth })}`,
    );
    setText(
      el.clock,
      `${t(`cal.month.${clock.monthOfYear}`)}, ${t('cal.year', { year: clock.year })}`,
    );
    const { player, rival } = game.marketShare;
    el.marketPlayer.style.width = `${player}%`;
    el.marketPlayer.nextElementSibling.style.width = `${rival}%`;
    setText(el.marketValue, `${Math.round(player)} %`);
    el.scandalFill.style.width = `${game.scandal}%`;
    setText(el.scandalValue, `${Math.round(game.scandal)} %`);
    el.scandalFill.parentElement.classList.toggle('danger', game.scandal >= 70);
    setText(el.langButton, getLocale().toUpperCase());
  }
}

function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}
