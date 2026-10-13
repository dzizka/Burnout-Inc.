// Produkty, biznis modely a zákaznícka podpora (GDD 6.1–6.6, 9.2, D11).
// Čas: tržby sa pripisujú denne (pracovný deň = 9 s pri 1x, D6), tikety a body vývoja
// bežia v reálnych sekundách. Overuje `npm run sim -- 3 1 studio`. Tržby sa doladia
// v M4 spolu s mesačnými mzdami.

/**
 * Typy produktov kampane 1 (Garážové IT & sociálne siete, GDD 1.3).
 * target = modré body potrebné na dokončenie; bugRate = červené bugy na 1 bod práce;
 * revenue = základná denná tržba pri skóre 10; lifetime = životnosť v pracovných dňoch;
 * market = zisk trhového podielu (%) pri skóre 10.
 */
export const PRODUCT_TYPES = {
  mobileApp: { id: 'mobileApp', target: 150, bugRate: 0.3, revenue: 200, lifetime: 40, market: 3 },
  clickbait: { id: 'clickbait', target: 250, bugRate: 0.25, revenue: 260, lifetime: 60, market: 4 },
  dataBroker: {
    id: 'dataBroker',
    target: 400,
    bugRate: 0.35,
    revenue: 600,
    lifetime: 80,
    market: 6,
  },
};

/**
 * Biznis modely (GDD 6.1, 9.2).
 * oneTime: Tržba(t) = Základ × (1 − t / Životnosť)
 * subscription: stabilná nižšia tržba, bugy odháňajú predplatiteľov
 * aggressive: vyššia tržba, ale viac tiketov a škandál každý deň
 */
export const BUSINESS_MODELS = {
  oneTime: { id: 'oneTime', revenueFactor: 1.6, ticketFactor: 1, scandalPerDay: 0 },
  subscription: { id: 'subscription', revenueFactor: 0.7, ticketFactor: 1, scandalPerDay: 0 },
  aggressive: { id: 'aggressive', revenueFactor: 1.4, ticketFactor: 1.5, scandalPerDay: 0.3 },
};

export const SUBSCRIPTION = {
  /** GDD 9.2 – predplatitelia ubúdajú o 5 % denne, keď má produkt ≥ BUG_THRESHOLD bugov. */
  CHURN_PER_DAY: 0.05,
  BUG_THRESHOLD: 10,
  /** Pod týmto podielom predplatiteľov produkt končí. */
  MIN_SUBSCRIBERS: 0.1,
};

export const DEVELOPMENT = {
  /** Koľko bugov opraví 1 bod práce pri ladení alebo hotfixe. */
  FIX_PER_POINT: 0.5,
  /** Stres (Pokoj < 50) a kofeínový šok pridávajú bugy. */
  STRESS_BUG_FACTOR: 1.5,
  HYPER_BUG_FACTOR: 1.5,
};

/** D11 – skóre 0–10 podľa hustoty bugov a nevybavených tiketov. */
export const SCORE = {
  BUG_DENSITY_PENALTY: 20, // skóre −= (bugy / cieľ) × 20
  TICKET_DIVISOR: 50, // skóre −= min(MAX, tikety / 50)
  TICKET_MAX_PENALTY: 3,
};

/** GDD 6.2 – zákaznícka podpora. */
export const SUPPORT = {
  /** Nové tikety za sekundu na 1 neopravený bug živého produktu. */
  TICKETS_PER_BUG_S: 0.03,
  /** Koľko tiketov vybaví operátor za sekundu (× zručnosť). */
  HANDLE_RATE_S: 1.2,
  /** Operátorovi pri vybavovaní ubúda Pokoj navyše (GDD: −0.8/s spolu). */
  OPERATOR_PEACE_S: 0.45,
  /** Zvoniaci stôl ruší okolie (AoE hluk): Pokoj navyše za sekundu v okruhu. */
  RING_RADIUS: 4,
  RING_PEACE_S: 0.3,
  /** Nevybavené tikety zvyšujú škandál: % za sekundu na tiket (max. 100 tiketov). */
  SCANDAL_PER_TICKET_S: 0.0002,
  SCANDAL_TICKET_CAP: 100,
};

/** Vydanie produktu so zlým skóre poškodí reputáciu (GDD 6.3, 7.1). */
export const LAUNCH = {
  /** Pod týmto skóre pridá vydanie škandál a trh nezíska nič. */
  BAD_SCORE: 4,
  SCANDAL_PER_MISSING_POINT: 2,
};
