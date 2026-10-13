import { serializeGame, deserializeGame } from '../sim/save.js';

// Uloženie hry do localStorage. Prístup môže zlyhať (súkromné okno, plné úložisko),
// preto všetko v try/catch – hra beží aj bez ukladania.

const SAVE_KEY = 'burnout-inc.save';

/** Po zmazaní uloženia (nová hra) sa už neukladá – inak by pagehide zapísal starú hru späť. */
let enabled = true;

/** @returns {boolean} true, ak sa podarilo uložiť */
export function saveGame(game) {
  if (!enabled) return false;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serializeGame(game)));
    return true;
  } catch {
    return false;
  }
}

/** @returns {import('../sim/game.js').Game | null} */
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? deserializeGame(JSON.parse(raw)) : null;
  } catch {
    // Poškodený alebo starý formát – začne sa nová hra.
    return null;
  }
}

export function clearSave() {
  enabled = false;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // nič
  }
}
