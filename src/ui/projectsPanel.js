import { BUSINESS_MODELS, PRODUCT_TYPES } from '../data/products.js';
import { OBJECTS } from '../data/objects.js';
import { ProjectPhase, productScore } from '../sim/studio.js';
import { t, formatMoney, onLocaleChange } from '../i18n/index.js';

// Panel Projekty (GDD 6.1, 8.1C, 8.2): nový projekt, priebeh vývoja s rozhodnutím
// Vydať / Ladiť a zoznam produktov na trhu.

/** Bugy sa zobrazujú voči tejto časti cieľa (plný pruh = veľmi zabugované). */
const BUG_BAR_SCALE = 0.5;

export class ProjectsPanel {
  /**
   * @param {import('../sim/game.js').Game} game
   * @param {{ toast: (m: string) => void }} hud
   * @param {{ onOpen: () => void }} opts
   */
  constructor(game, hud, { onOpen }) {
    this.game = game;
    this.hud = hud;
    this.onOpen = onOpen;
    this.panel = document.getElementById('projects-panel');
    this.area = document.getElementById('project-area');
    this.productList = document.getElementById('product-list');
    this.ticketsLine = document.getElementById('tickets-line');
    this.dockButton = document.getElementById('tab-rd');
    this.selectedType = 'mobileApp';
    this.selectedModel = 'oneTime';
    this.refs = null;
    this.lastListRefresh = 0;

    this.dockButton.addEventListener('click', () => (this.isOpen ? this.close() : this.open()));
    document.getElementById('btn-projects-close').addEventListener('click', () => this.close());
    for (const type of [
      'project:started',
      'project:ready',
      'product:launched',
      'product:retired',
    ]) {
      game.events.on(type, () => this.render());
    }
    game.events.on('project:ready', () => this.dockButton.classList.add('attention'));
    onLocaleChange(() => this.render());
    this.render();
  }

  get isOpen() {
    return !this.panel.hidden;
  }

  open() {
    this.onOpen();
    this.panel.hidden = false;
    this.dockButton.classList.add('active');
    this.dockButton.classList.remove('attention');
    this.render();
  }

  close() {
    this.panel.hidden = true;
    this.dockButton.classList.remove('active');
  }

  render() {
    const { project } = this.game.studio;
    this.refs = null;
    this.area.replaceChildren(...(project ? this.renderProject(project) : this.renderNewForm()));
    this.renderProducts();
  }

  renderNewForm() {
    const nodes = [heading(t('projects.new')), heading(t('projects.type'), 'h3')];
    nodes.push(
      choiceList(
        Object.values(PRODUCT_TYPES),
        (type) => ({
          title: t(`product.${type.id}`),
          desc: t(`product.${type.id}.desc`),
          meta: `${t('projects.target', { points: type.target })} · ${t('projects.revenue', {
            amount: formatMoney(type.revenue),
          })}`,
        }),
        (type) => type.id === this.selectedType,
        (type) => {
          this.selectedType = type.id;
          this.render();
        },
      ),
    );
    nodes.push(heading(t('projects.model'), 'h3'));
    nodes.push(
      choiceList(
        Object.values(BUSINESS_MODELS),
        (model) => ({ title: t(`model.${model.id}`), desc: t(`model.${model.id}.desc`) }),
        (model) => model.id === this.selectedModel,
        (model) => {
          this.selectedModel = model.id;
          this.render();
        },
      ),
    );
    const start = button(t('projects.start'), 'btn-primary', () => {
      this.game.studio.startProject(this.selectedType, this.selectedModel, this.game);
    });
    const actions = div('project-actions', [start]);
    nodes.push(actions);
    if (!this.hasDevDesk()) nodes.push(note(t('projects.noDev')));
    if (this.game.studio.products.length) nodes.push(note(t('projects.hotfix')));
    return nodes;
  }

  renderProject(project) {
    const name = `${t(`product.${project.type}`)} · ${t(`model.${project.model}`)}`;
    const phase = note('');
    const features = progress(t('projects.features'), 'blue');
    const bugs = progress(t('projects.bugs'), 'red');
    const score = note('');
    // Rozhodnutie je hore, aby bolo viditeľné aj na nízkom displeji mobilu.
    const nodes = [heading(t('projects.current')), heading(name, 'h3'), phase];

    const actions = [];
    if (project.phase === ProjectPhase.READY) {
      actions.push(
        button(t('projects.polish'), '', () => this.game.studio.polish() && this.render()),
      );
    }
    if (project.phase !== ProjectPhase.DEVELOPMENT) {
      actions.push(
        button(t('projects.ship'), 'btn-primary', () => this.game.studio.launch(this.game)),
      );
    }
    if (actions.length) nodes.push(div('project-actions', actions));
    nodes.push(features.el, bugs.el, score);
    if (!this.hasDevDesk()) nodes.push(note(t('projects.noDev')));
    this.refs = { project, phase, features, bugs, score };
    this.refresh(true);
    return nodes;
  }

  renderProducts() {
    const { products, pendingTickets } = this.game.studio;
    this.productList.replaceChildren(
      ...(products.length
        ? products.map((p) => {
            const row = div('product-row', []);
            const nameEl = document.createElement('div');
            nameEl.className = 'name';
            nameEl.textContent = `${t(`product.${p.type}`)} · ${t(`model.${p.model}`)}`;
            const info = document.createElement('div');
            info.textContent = t('projects.liveRow', {
              score: productScore(p, pendingTickets).toFixed(1),
              bugs: Math.round(p.bugs),
              revenue: formatMoney(p.revenueToday),
              days: p.age,
            });
            row.append(nameEl, info);
            return row;
          })
        : [note(t('projects.noLive'))]),
    );
    this.ticketsLine.textContent =
      pendingTickets >= 1 ? t('projects.tickets', { count: Math.round(pendingTickets) }) : '';
  }

  /** Volané každú snímku – aktualizuje len čísla a pruhy. */
  refresh(force = false) {
    if (!force && !this.isOpen) return;
    const r = this.refs;
    if (r) {
      const p = r.project;
      setText(r.phase, t(`projects.phase.${p.phase}`));
      r.features.set(p.points / p.target, `${Math.floor(p.points)}/${p.target}`);
      r.bugs.set(p.bugs / (p.target * BUG_BAR_SCALE), `${Math.round(p.bugs)}`);
      setText(r.score, t('projects.score', { score: productScore(p).toFixed(1) }));
    }
    const now = performance.now();
    if (this.isOpen && now - this.lastListRefresh > 500) {
      this.lastListRefresh = now;
      this.renderProducts();
    }
  }

  hasDevDesk() {
    return this.game.floors.some((f) => f.objects.some((o) => OBJECTS[o.type].seat === 'dev'));
  }
}

// --- malé DOM pomocníky ------------------------------------------------------------

function heading(text, tag = 'strong') {
  const el = document.createElement(tag);
  el.textContent = text;
  if (tag === 'strong') el.style.display = 'block';
  return el;
}

function note(text) {
  const p = document.createElement('p');
  p.className = 'note';
  p.textContent = text;
  return p;
}

function div(className, children) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...children);
  return el;
}

function button(label, className, onClick) {
  const btn = document.createElement('button');
  btn.textContent = label;
  if (className) btn.className = className;
  btn.addEventListener('click', onClick);
  return btn;
}

function choiceList(items, describe, isActive, onPick) {
  return div(
    'choice-list',
    items.map((item) => {
      const { title, desc, meta } = describe(item);
      const btn = button('', `choice${isActive(item) ? ' active' : ''}`, () => onPick(item));
      const titleEl = document.createElement('span');
      titleEl.className = 'title';
      titleEl.textContent = title;
      const descEl = document.createElement('span');
      descEl.textContent = desc;
      btn.append(titleEl, descEl);
      if (meta) {
        const metaEl = document.createElement('span');
        metaEl.className = 'meta';
        metaEl.textContent = meta;
        btn.append(metaEl);
      }
      return btn;
    }),
  );
}

function progress(label, color) {
  const el = div('progress', []);
  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  const bar = div('bar', []);
  const fill = div(`fill ${color}`, []);
  bar.append(fill);
  const value = document.createElement('span');
  el.append(labelEl, bar, value);
  return {
    el,
    set(ratio, text) {
      fill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
      setText(value, text);
    },
  };
}

function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}
