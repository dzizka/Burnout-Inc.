import { SCANDAL } from '../data/balance.js';
import { t, formatMoney, onLocaleChange } from '../i18n/index.js';

// Panel Financie (GDD 9): výkaz mesiaca, najbližšia uzávierka, história, úvery a škandál.
// Otvára sa klikom na hotovosť v hornom paneli.

const HISTORY_ROWS = 4;

export class FinancePanel {
  /**
   * @param {import('../sim/game.js').Game} game
   * @param {{ toast: (m: string) => void }} hud
   * @param {{ onOpen: () => void }} opts
   */
  constructor(game, hud, { onOpen }) {
    this.game = game;
    this.hud = hud;
    this.onOpen = onOpen;
    this.panel = document.getElementById('finance-panel');
    this.lastRefresh = 0;
    document.getElementById('cash-stat').addEventListener('click', () => this.toggle());
    document.getElementById('btn-finance-close').addEventListener('click', () => this.close());
    document.getElementById('btn-loan').addEventListener('click', () => {
      const loan = game.takeLoan();
      if (loan) {
        hud.toast(
          t('toast.loan', {
            amount: formatMoney(loan.principal),
            payment: formatMoney(loan.payment),
          }),
        );
      }
      this.render();
    });
    document.getElementById('btn-pr').addEventListener('click', () => {
      if (game.prCampaign()) hud.toast(t('toast.pr'));
      else hud.toast(t('toast.noMoney'));
      this.render();
    });
    game.events.on('month:end', () => this.isOpen && this.render());
    onLocaleChange(() => this.render());
  }

  get isOpen() {
    return !this.panel.hidden;
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.onOpen();
    this.panel.hidden = false;
    this.render();
  }

  close() {
    this.panel.hidden = true;
  }

  /** Volané každú snímku – prekreslí najviac 2× za sekundu. */
  refresh() {
    if (!this.isOpen) return;
    const now = performance.now();
    if (now - this.lastRefresh < 500) return;
    this.lastRefresh = now;
    this.render();
  }

  render() {
    const { game } = this;
    const { economy } = game;
    document.getElementById('finance-warning').hidden = economy.negativeMonths === 0;

    const month = Object.entries(economy.current);
    const total = month.reduce((sum, [k, v]) => (k === 'loanIn' ? sum : sum + v), 0);
    fill('finance-month', [
      ...month.map(([k, v]) => row(t(`cat.${k}`), v)),
      row(t('finance.total'), total, 'total'),
    ]);

    const up = economy.upcomingCosts(game);
    fill('finance-upcoming', [
      row(t('cat.wages'), -up.wages),
      row(t('cat.rent'), -up.rent),
      ...(up.loans ? [row(t('cat.loanPayments'), -up.loans)] : []),
    ]);

    const history = economy.history.slice(-HISTORY_ROWS).reverse();
    fill(
      'finance-history',
      history.length
        ? history.map((r) =>
            textRow(
              t('finance.monthRow', {
                month: r.month,
                net: signed(r.net),
                cash: formatMoney(r.cash),
              }),
              r.net >= 0 ? 'positive' : 'negative-text',
            ),
          )
        : [textRow(t('finance.noHistory'), 'note')],
    );

    fill(
      'finance-loans',
      economy.loans.length
        ? economy.loans.map((l) =>
            textRow(
              t('finance.loanRow', {
                payment: formatMoney(l.payment),
                months: l.remaining,
                rate: Math.round(l.rate * 100),
              }),
            ),
          )
        : [textRow(t('finance.noLoans'), 'note')],
    );
    const offer = economy.loanOffer();
    const loanBtn = document.getElementById('btn-loan');
    loanBtn.disabled = !offer;
    loanBtn.textContent = offer
      ? t('finance.takeLoan', {
          amount: formatMoney(offer.amount),
          payment: formatMoney(offer.payment),
          months: offer.months,
          rate: Math.round(offer.rate * 100),
        })
      : t('finance.noLoan');

    const level =
      game.scandal >= SCANDAL.RAID ? 'raid' : game.scandal >= SCANDAL.MEDIA ? 'media' : 'clean';
    document.getElementById('finance-scandal').textContent =
      `${Math.round(game.scandal)} % – ${t(`finance.scandal.${level}`)}`;
    const prBtn = document.getElementById('btn-pr');
    prBtn.disabled = game.scandal <= 0;
    prBtn.textContent = t('finance.pr', {
      reduction: SCANDAL.PR_REDUCTION,
      cost: formatMoney(game.prCost()),
    });
  }
}

/** Suma so znamienkom: „+1 200 €“ / „−600 €“. */
export function signed(amount) {
  const text = formatMoney(Math.abs(Math.round(amount)));
  return amount < 0 ? `−${text}` : `+${text}`;
}

function fill(id, children) {
  document.getElementById(id).replaceChildren(...children);
}

function row(label, amount, extra = '') {
  const el = document.createElement('div');
  el.className = `ledger-row ${extra}`;
  const l = document.createElement('span');
  l.textContent = label;
  const v = document.createElement('span');
  v.textContent = signed(amount);
  v.className = amount < 0 ? 'negative-text' : 'positive';
  el.append(l, v);
  return el;
}

function textRow(text, className = '') {
  const el = document.createElement('div');
  el.className = `ledger-row ${className}`;
  el.textContent = text;
  return el;
}
