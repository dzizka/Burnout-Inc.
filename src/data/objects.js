// Katalóg objektov na stavanie (GDD 5.5). Rozmery sú v dlaždiciach, ceny v €.
// interaction = dlaždica relatívne k ľavému hornému rohu objektu, kam si postava
// stúpne pri používaní (GDD 2.3B). V 3/4 pohľade je to spravidla dlaždica pod objektom.

/**
 * @typedef {object} ObjectDef
 * @property {string} id
 * @property {'work' | 'needs' | 'relax' | 'infra'} category
 * @property {number} width
 * @property {number} height
 * @property {number} price
 * @property {{ dx: number, dy: number }} interaction
 * @property {string} [need] potreba, ktorú objekt dopĺňa (pre AI v M2)
 */

/** @type {Record<string, ObjectDef>} */
export const OBJECTS = {
  desk: {
    id: 'desk',
    category: 'work',
    width: 1,
    height: 1,
    price: 100,
    interaction: { dx: 0, dy: 1 },
  },
  coffee: {
    id: 'coffee',
    category: 'needs',
    width: 1,
    height: 1,
    price: 250,
    interaction: { dx: 0, dy: 1 },
    need: 'energy',
  },
  vending: {
    id: 'vending',
    category: 'needs',
    width: 1,
    height: 1,
    price: 250,
    interaction: { dx: 0, dy: 1 },
    need: 'satiety',
  },
  toilet: {
    id: 'toilet',
    category: 'needs',
    width: 1,
    height: 1,
    price: 200,
    interaction: { dx: 0, dy: 1 },
    need: 'hygiene',
  },
  smoking: {
    // D10 – lacný fajčiarsky kútik, dostupný aj v suteréne.
    id: 'smoking',
    category: 'needs',
    width: 1,
    height: 1,
    price: 80,
    interaction: { dx: 0, dy: 1 },
    need: 'peace',
  },
};

/** Podiel z ceny, ktorý sa vráti pri predaji objektu. */
export const SELL_REFUND_RATIO = 0.5;
