import { NEED_KEYS, PLAYER_ACTIONS } from '../data/needs.js';
import { t, formatMoney, onLocaleChange } from '../i18n/index.js';
import { applyTranslations } from './hud.js';

// Karta zamestnanca (GDD 8.2): stav, 6 potrieb a rýchle akcie.

const MISSING_ITEM = {
  energy: 'object.coffee',
  satiety: 'object.vending',
  hygiene: 'object.toilet',
  peace: 'object.smoking',
  fun: 'need.fun',
};

export class Inspector {
  /**
   * @param {import('../sim/game.js').Game} game
   * @param {import('../render/renderer.js').Renderer} renderer
   * @param {{ toast: (m: string) => void }} hud
   */
  constructor(game, renderer, hud) {
    this.game = game;
    this.renderer = renderer;
    this.hud = hud;
    this.el = document.getElementById('inspector');
    this.employee = null;

    const bars = this.el.querySelector('.needs');
    this.bars = {};
    for (const need of NEED_KEYS) {
      const row = document.createElement('div');
      row.className = 'need';
      row.innerHTML = `<span class="label"></span><div class="bar"><div class="fill"></div></div>`;
      row.querySelector('.label').dataset.i18n = `need.${need}`;
      bars.append(row);
      this.bars[need] = row.querySelector('.fill');
    }
    applyTranslations(this.el);

    this.el.querySelector('#btn-inspect-close').addEventListener('click', () => this.select(null));
    this.el.querySelector('#btn-bonus').addEventListener('click', () => {
      if (this.employee && !game.giveBonus(this.employee)) this.hud.toast(t('toast.noMoney'));
    });
    this.el.querySelector('#btn-break').addEventListener('click', () => {
      if (this.employee && !game.sendOnBreak(this.employee)) this.hud.toast(t('toast.noBreak'));
    });
    this.el.querySelector('#btn-fire').addEventListener('click', () => {
      if (!this.employee) return;
      const name = this.employee.name;
      game.fire(this.employee);
      this.hud.toast(t('toast.fired', { name }));
    });
    game.events.on('employee:fired', ({ employee }) => {
      if (employee === this.employee) this.select(null);
    });
    onLocaleChange(() => this.refresh(true));
  }

  select(employee) {
    this.employee = employee;
    this.renderer.overlay.selected = employee;
    this.el.hidden = !employee;
    this.refresh(true);
  }

  /** Volané každú snímku. */
  refresh(force = false) {
    const e = this.employee;
    if (!e || (this.el.hidden && !force)) return;
    setText(this.el.querySelector('.name'), e.name);
    setText(this.el.querySelector('.activity'), describeActivity(e));
    setText(
      this.el.querySelector('.wage'),
      `${t('inspect.wage')}: ${t('staff.wage', { amount: formatMoney(e.wage) })}`,
    );
    setText(
      this.el.querySelector('#btn-bonus'),
      t('inspect.bonus', { amount: formatMoney(PLAYER_ACTIONS.BONUS_COST) }),
    );
    for (const need of NEED_KEYS) {
      const v = e.stats[need];
      const fill = this.bars[need];
      fill.style.width = `${v}%`;
      fill.dataset.level = v < 25 ? 'critical' : v < 50 ? 'low' : 'ok';
    }
  }
}

export function describeActivity(e) {
  let text = t(`activity.${e.activity}`);
  if (e.waiting) text = t('activity.waiting', { activity: text });
  else if (e.isWalking) text = t('activity.walking', { activity: text });
  if (e.missing) text += ` · ${t('activity.missing', { item: t(MISSING_ITEM[e.missing]) })}`;
  return text;
}

function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}
