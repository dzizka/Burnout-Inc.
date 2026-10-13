import sk from './sk.js';
import en from './en.js';

// Lokalizácia: t('cal.week', { week: 2 }) → "2. týždeň". Chýbajúci preklad padá späť
// na slovenčinu a potom na samotný kľúč, aby hra nikdy nespadla na texte.

export const LOCALES = { sk, en };
export const DEFAULT_LOCALE = 'sk';

const INTL_LOCALE = { sk: 'sk-SK', en: 'en-GB' };

let current = DEFAULT_LOCALE;
const listeners = new Set();

export function getLocale() {
  return current;
}

export function setLocale(locale) {
  if (!(locale in LOCALES) || locale === current) return;
  current = locale;
  listeners.forEach((fn) => fn(locale));
}

/** @param {(locale: string) => void} fn */
export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 */
export function t(key, params = {}) {
  const template = LOCALES[current][key] ?? LOCALES[DEFAULT_LOCALE][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}

/** Mena podľa aktuálneho jazyka, napr. "2 500 €" / "€2,500". */
export function formatMoney(amount) {
  return new Intl.NumberFormat(INTL_LOCALE[current], {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Vyberie jazyk: uložená voľba → jazyk prehliadača (sk/cs → sk) → angličtina.
 * @param {string | null} saved
 * @param {readonly string[]} browserLanguages
 */
export function detectLocale(saved, browserLanguages) {
  if (saved && saved in LOCALES) return saved;
  for (const lang of browserLanguages) {
    const base = lang.toLowerCase().split('-')[0];
    if (base === 'sk' || base === 'cs') return 'sk';
    if (base in LOCALES) return base;
  }
  return 'en';
}
