import {
  BUSINESS_MODELS,
  DEVELOPMENT,
  LAUNCH,
  PRODUCT_TYPES,
  SCORE,
  SUBSCRIPTION,
  SUPPORT,
} from '../data/products.js';

// Vývoj produktov, vydanie, tržby a zákaznícka podpora (GDD kap. 6, 9.2).
// Jeden projekt naraz; vydané produkty zarábajú denne a generujú tikety podľa bugov.

export const ProjectPhase = Object.freeze({
  DEVELOPMENT: 'development', // zbierajú sa modré body a bugy
  READY: 'ready', // cieľ splnený, hráč rozhoduje: vydať alebo ladiť
  POLISHING: 'polishing', // práca opravuje bugy
});

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * D11 – skóre 0–10: kvalita podľa splnenia cieľa mínus hustota bugov a nevybavené tikety.
 * @param {{ points: number, bugs: number, target: number }} p
 */
export function productScore(p, pendingTickets = 0) {
  const quality = 10 * Math.min(1, p.points / p.target);
  const bugPenalty = (p.bugs / p.target) * SCORE.BUG_DENSITY_PENALTY;
  const ticketPenalty = Math.min(SCORE.TICKET_MAX_PENALTY, pendingTickets / SCORE.TICKET_DIVISOR);
  return clamp(quality - bugPenalty - ticketPenalty, 0, 10);
}

export class Studio {
  constructor() {
    /** @type {null | { id: number, type: string, model: string, phase: string, points: number, bugs: number, target: number }} */
    this.project = null;
    /** @type {{ id: number, type: string, model: string, points: number, bugs: number, target: number, age: number, subscribers: number, launchScore: number, revenueToday: number, totalRevenue: number }[]} */
    this.products = [];
    this.pendingTickets = 0;
    this.ticketsHandled = 0;
    this.nextId = 1;
  }

  // --- projekt ---------------------------------------------------------------------

  /** @returns {boolean} false, ak už nejaký projekt beží */
  startProject(typeId, modelId, game) {
    if (this.project || !PRODUCT_TYPES[typeId] || !BUSINESS_MODELS[modelId]) return false;
    this.project = {
      id: this.nextId++,
      type: typeId,
      model: modelId,
      phase: ProjectPhase.DEVELOPMENT,
      points: 0,
      bugs: 0,
      target: PRODUCT_TYPES[typeId].target,
    };
    game.events.emit('project:started', { project: this.project });
    return true;
  }

  /**
   * Práca zamestnanca pri vývojárskom stole. Kam ide, závisí od fázy projektu;
   * bez projektu (alebo pri čakaní na rozhodnutie) sa opravujú bugy živých produktov.
   */
  addWork(amount, employee, game) {
    const p = this.project;
    if (p?.phase === ProjectPhase.DEVELOPMENT) {
      p.points = Math.min(p.target, p.points + amount);
      let bugFactor = 1;
      if (employee?.stats.peace < 50) bugFactor *= DEVELOPMENT.STRESS_BUG_FACTOR;
      if (employee?.activity === 'HYPERACTIVE') bugFactor *= DEVELOPMENT.HYPER_BUG_FACTOR;
      p.bugs += amount * PRODUCT_TYPES[p.type].bugRate * bugFactor;
      if (p.points >= p.target) {
        p.phase = ProjectPhase.READY;
        game.events.emit('project:ready', { project: p });
      }
      return;
    }
    if (p?.phase === ProjectPhase.POLISHING) {
      p.bugs = Math.max(0, p.bugs - amount * DEVELOPMENT.FIX_PER_POINT);
      return;
    }
    this.hotfix(amount);
  }

  /** Hotfix – opravuje najzabugovanejší živý produkt (GDD 6.2C). */
  hotfix(amount) {
    const worst = this.products.reduce((a, b) => (b.bugs > (a?.bugs ?? 0) ? b : a), null);
    if (worst) worst.bugs = Math.max(0, worst.bugs - amount * DEVELOPMENT.FIX_PER_POINT);
  }

  /** Hráč sa rozhodol ladiť chyby (Polishing). */
  polish() {
    if (this.project?.phase !== ProjectPhase.READY) return false;
    this.project.phase = ProjectPhase.POLISHING;
    return true;
  }

  /** Vydať hneď (Ship It) – aj počas ladenia. */
  launch(game) {
    const p = this.project;
    if (!p || p.phase === ProjectPhase.DEVELOPMENT) return null;
    const score = productScore(p);
    const product = {
      id: p.id,
      type: p.type,
      model: p.model,
      points: p.points,
      bugs: p.bugs,
      target: p.target,
      age: 0,
      subscribers: 1,
      launchScore: score,
      revenueToday: 0,
      totalRevenue: 0,
    };
    this.products.push(product);
    this.project = null;

    // Trh (GDD 7.1): dobrý produkt berie podiel rivalovi, zlý spôsobí škandál.
    if (score >= LAUNCH.BAD_SCORE) {
      const gain = PRODUCT_TYPES[p.type].market * (score / 10);
      const taken = Math.min(gain, game.marketShare.rival);
      game.marketShare.rival -= taken;
      game.marketShare.player += taken;
    } else {
      game.addScandal((LAUNCH.BAD_SCORE - score) * LAUNCH.SCANDAL_PER_MISSING_POINT);
    }
    game.events.emit('product:launched', { product, score });
    return product;
  }

  // --- priebeh -----------------------------------------------------------------------

  /** Tikety pribúdajú podľa bugov; nevybavené zvyšujú škandál (GDD 6.2B). */
  update(dt, game) {
    for (const product of this.products) {
      const factor = BUSINESS_MODELS[product.model].ticketFactor;
      this.pendingTickets += product.bugs * SUPPORT.TICKETS_PER_BUG_S * factor * dt;
    }
    if (this.pendingTickets > 0) {
      const counted = Math.min(this.pendingTickets, SUPPORT.SCANDAL_TICKET_CAP);
      game.addScandal(counted * SUPPORT.SCANDAL_PER_TICKET_S * dt);
    }
  }

  /**
   * Operátor pri stole podpory vybavuje tikety. `work` = odvedená práca (už so zručnosťou).
   * Vracia počet vybavených.
   */
  handleTickets(employee, work, dt) {
    if (this.pendingTickets <= 0) return 0;
    const handled = Math.min(this.pendingTickets, SUPPORT.HANDLE_RATE_S * work);
    this.pendingTickets -= handled;
    this.ticketsHandled += handled;
    employee.stats.peace = Math.max(0, employee.stats.peace - SUPPORT.OPERATOR_PEACE_S * dt);
    return handled;
  }

  /** Denná uzávierka predajov: tržby, starnutie, predplatitelia (GDD 9.2). */
  onDayEnd(game) {
    for (const product of this.products) {
      const type = PRODUCT_TYPES[product.type];
      const model = BUSINESS_MODELS[product.model];
      const quality = productScore(product, this.pendingTickets) / 10;
      let revenue = type.revenue * model.revenueFactor * quality;
      if (product.model === 'subscription') {
        if (product.bugs >= SUBSCRIPTION.BUG_THRESHOLD) {
          product.subscribers *= 1 - SUBSCRIPTION.CHURN_PER_DAY;
        }
        revenue *= product.subscribers;
      } else {
        revenue *= Math.max(0, 1 - product.age / type.lifetime);
      }
      revenue = Math.round(revenue * game.scandalRevenueFactor());
      product.revenueToday = revenue;
      product.totalRevenue += revenue;
      game.earn(revenue, 'revenue');
      if (model.scandalPerDay) game.addScandal(model.scandalPerDay);
      product.age++;
    }
    const expired = this.products.filter((p) =>
      p.model === 'subscription'
        ? p.subscribers < SUBSCRIPTION.MIN_SUBSCRIBERS
        : p.age >= PRODUCT_TYPES[p.type].lifetime,
    );
    for (const product of expired) {
      this.products = this.products.filter((p) => p !== product);
      game.events.emit('product:retired', { product });
    }
  }

  /** Súčet dnešných tržieb všetkých produktov. */
  get revenueToday() {
    return this.products.reduce((sum, p) => sum + p.revenueToday, 0);
  }
}
