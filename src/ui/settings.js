// Používateľské nastavenia (jazyk…) v localStorage. Prístup môže zlyhať
// (súkromné okno, zablokované úložisko) – hra musí fungovať aj bez neho.

const KEY = 'burnout-inc.settings';

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

export function saveSettings(patch) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...loadSettings(), ...patch }));
  } catch {
    // Nastavenie sa neuloží, hra pokračuje.
  }
}
