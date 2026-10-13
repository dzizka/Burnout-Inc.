import { t } from '../i18n/index.js';
import { Activity } from '../sim/employee.js';

// Hlášky o dôležitých udalostiach v kancelárii. Bežné prestávky a pranky bez následkov
// sa nehlásia, aby hráč nebol zahltený.

/**
 * @param {import('../sim/game.js').Game} game
 * @param {{ toast: (m: string) => void }} hud
 */
export function bindEventToasts(game, hud) {
  const on = (type, fn) => game.events.on(type, fn);
  const g = (key, e) => `${key}.${e.gender}`;

  on('employee:drama', ({ employee }) => hud.toast(t('toast.drama', { name: employee.name })));
  on('employee:strike', ({ employee }) =>
    hud.toast(t(g('toast.strike', employee), { name: employee.name })),
  );
  on('employee:collapse', ({ employee, activity }) => {
    if (activity === Activity.ASLEEP) {
      hud.toast(t(g('toast.asleep', employee), { name: employee.name }));
    }
  });
  on('employee:prank', ({ employee, victim, outcome }) => {
    if (outcome === 'spill') {
      hud.toast(t(g('toast.spill', employee), { name: employee.name, victim: victim.name }));
    }
  });
  on('employee:hyper', ({ employee }) => hud.toast(t('toast.hyper', { name: employee.name })));
  on('employee:hygiene', ({ employee }) => hud.toast(t('toast.hygiene', { name: employee.name })));
}
