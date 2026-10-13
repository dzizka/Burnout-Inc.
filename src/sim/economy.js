import { ECONOMY } from '../data/balance.js';

// Peňažné toky (GDD kap. 9): mesačná uzávierka, výkaz, bankrot (D12) a úvery (D13).
// Všetky zmeny hotovosti idú cez Game.earn / Game.spend, aby sa dali rozpísať do výkazu.

export const Category = Object.freeze({
  REVENUE: 'revenue',
  LOAN_IN: 'loanIn',
  ASSET_SALES: 'assetSales',
  WAGES: 'wages',
  RENT: 'rent',
  COFFEE: 'coffee',
  LOAN_PAYMENTS: 'loanPayments',
  PURCHASES: 'purchases',
  BONUSES: 'bonuses',
  PR: 'pr',
  FINES: 'fines',
});

/** Anuitná splátka: P × r / (1 − (1 + r)^−n). */
export function annuityPayment(principal, monthlyRate, months) {
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

export class Economy {
  constructor() {
    /** Príjmy (+) a výdavky (−) v aktuálnom mesiaci podľa kategórie. */
    this.current = {};
    /** @type {{ month: number, items: Record<string, number>, net: number, cash: number }[]} */
    this.history = [];
    /** @type {{ id: number, principal: number, rate: number, payment: number, remaining: number }[]} */
    this.loans = [];
    this.nextLoanId = 1;
    /** Počet uzávierok po sebe so záporným zostatkom (D12). */
    this.negativeMonths = 0;
  }

  record(category, amount) {
    this.current[category] = (this.current[category] ?? 0) + amount;
  }

  // --- úvery (D13) ------------------------------------------------------------------

  /** Ponuka ďalšieho úveru, alebo null, ak banka už nepožičia. */
  loanOffer() {
    if (this.loans.length >= ECONOMY.LOAN.MAX_ACTIVE) return null;
    const { AMOUNT, MONTHLY_INTEREST, INTEREST_STEP_PER_LOAN, TERM_MONTHS } = ECONOMY.LOAN;
    const rate = MONTHLY_INTEREST + this.loans.length * INTEREST_STEP_PER_LOAN;
    return {
      amount: AMOUNT,
      rate,
      months: TERM_MONTHS,
      payment: Math.round(annuityPayment(AMOUNT, rate, TERM_MONTHS)),
    };
  }

  /** @param {import('./game.js').Game} game */
  takeLoan(game) {
    const offer = this.loanOffer();
    if (!offer) return null;
    const loan = {
      id: this.nextLoanId++,
      principal: offer.amount,
      rate: offer.rate,
      payment: offer.payment,
      remaining: offer.months,
    };
    this.loans.push(loan);
    game.earn(offer.amount, Category.LOAN_IN);
    return loan;
  }

  // --- mesačná uzávierka (D5, D12) ------------------------------------------------

  /** Odhad nákladov najbližšej uzávierky (mzdy, nájom, splátky). */
  upcomingCosts(game) {
    return {
      wages: game.employees.reduce((sum, e) => sum + e.wage, 0),
      rent: ECONOMY.RENT_PER_MONTH * game.floors.length,
      loans: this.loans.reduce((sum, l) => sum + l.payment, 0),
    };
  }

  /**
   * Strhne mzdy, nájom a splátky, uloží výkaz a vyhodnotí bankrot.
   * @param {import('./game.js').Game} game
   * @returns {{ report: object, bankrupt: boolean, warning: boolean }}
   */
  closeMonth(game, month) {
    const costs = this.upcomingCosts(game);
    game.spend(costs.wages, Category.WAGES);
    game.spend(costs.rent, Category.RENT);
    if (costs.loans) game.spend(costs.loans, Category.LOAN_PAYMENTS);
    for (const loan of this.loans) loan.remaining--;
    this.loans = this.loans.filter((l) => l.remaining > 0);

    const items = this.current;
    const net = Object.entries(items)
      .filter(([k]) => k !== Category.LOAN_IN)
      .reduce((sum, [, v]) => sum + v, 0);
    const report = { month, items, net: Math.round(net), cash: Math.round(game.cash) };
    this.history.push(report);
    this.current = {};

    // D12 – záporný zostatok pri uzávierke spustí lehotu; ďalšia záporná = bankrot.
    let bankrupt = false;
    let warning = false;
    if (game.cash < 0) {
      this.negativeMonths++;
      if (this.negativeMonths > ECONOMY.BANKRUPTCY_GRACE_MONTHS) bankrupt = true;
      else warning = true;
    } else {
      this.negativeMonths = 0;
    }
    return { report, bankrupt, warning };
  }

  toJSON() {
    return {
      current: this.current,
      history: this.history,
      loans: this.loans,
      nextLoanId: this.nextLoanId,
      negativeMonths: this.negativeMonths,
    };
  }

  static fromJSON(data) {
    return Object.assign(new Economy(), structuredClone(data));
  }
}
