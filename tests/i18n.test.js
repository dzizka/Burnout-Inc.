import { afterEach, describe, expect, it } from 'vitest';
import { LOCALES, detectLocale, setLocale, t } from '../src/i18n/index.js';

afterEach(() => setLocale('sk'));

describe('i18n', () => {
  it('všetky jazyky majú rovnakú sadu kľúčov', () => {
    const reference = Object.keys(LOCALES.sk).sort();
    for (const [code, dict] of Object.entries(LOCALES)) {
      expect(Object.keys(dict).sort(), `jazyk ${code}`).toEqual(reference);
    }
  });

  it('dosadí parametre a prepne jazyk', () => {
    expect(t('hud.day', { day: 3 })).toBe('Deň 3');
    setLocale('en');
    expect(t('hud.day', { day: 3 })).toBe('Day 3');
  });

  it('neznámy kľúč vráti samotný kľúč', () => {
    expect(t('neexistuje.kluc')).toBe('neexistuje.kluc');
  });

  it('detectLocale: uložená voľba > jazyk prehliadača > angličtina', () => {
    expect(detectLocale('en', ['sk-SK'])).toBe('en');
    expect(detectLocale(null, ['cs-CZ'])).toBe('sk');
    expect(detectLocale(null, ['en-US'])).toBe('en');
    expect(detectLocale(null, ['de-DE'])).toBe('en');
  });
});
