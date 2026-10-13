import { t, formatMoney } from '../i18n/index.js';
import { Activity } from '../sim/employee.js';
import { OBJECTS } from '../data/objects.js';

/** Pri koľkých tiketoch bez stola podpory upozorníme hráča. */
const NO_SUPPORT_TICKETS = 20;

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

  const productName = (p) => t(`product.${p.type}`);
  on('project:ready', ({ project }) =>
    hud.toast(t('toast.projectReady', { name: productName(project) })),
  );
  on('product:launched', ({ product, score }) =>
    hud.toast(
      t(score >= 4 ? 'toast.launched' : 'toast.launchedBad', {
        name: productName(product),
        score: score.toFixed(1),
      }),
    ),
  );
  on('product:retired', ({ product }) =>
    hud.toast(
      t('toast.retired', { name: productName(product), amount: formatMoney(product.totalRevenue) }),
    ),
  );

  // Upozornenie raz za deň, keď zvonia telefóny a nie je stôl podpory (GDD 6.2C).
  on('day:end', () => {
    const hasSupport = game.floors.some((f) =>
      f.objects.some((o) => OBJECTS[o.type].seat === 'support'),
    );
    if (!hasSupport && game.studio.pendingTickets >= NO_SUPPORT_TICKETS) {
      hud.toast(t('toast.noSupport'));
    }
  });
}
