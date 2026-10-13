import { t, formatMoney, onLocaleChange } from '../i18n/index.js';

// Panel Personál (GDD 8.1C): zoznam zamestnancov a nábor uchádzačov (D5 – mesačná mzda).

function stars(skill) {
  // 0.6–1.5 → 1–5 hviezdičiek
  const n = Math.max(1, Math.min(5, Math.round((skill - 0.5) * 4.5)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export class StaffPanel {
  /**
   * @param {import('../sim/game.js').Game} game
   * @param {{ toast: (m: string) => void }} hud
   * @param {{ onSelect: (e: import('../sim/employee.js').Employee) => void, onOpen: () => void }} opts
   */
  constructor(game, hud, { onSelect, onOpen }) {
    this.game = game;
    this.hud = hud;
    this.onSelect = onSelect;
    this.onOpen = onOpen;
    this.panel = document.getElementById('staff-panel');
    this.dockButton = document.getElementById('tab-staff');
    this.dockButton.addEventListener('click', () => (this.isOpen ? this.close() : this.open()));
    document.getElementById('btn-staff-close').addEventListener('click', () => this.close());
    for (const type of ['employee:hired', 'employee:fired', 'week:end']) {
      game.events.on(type, () => this.isOpen && this.render());
    }
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
    this.render();
  }

  close() {
    this.panel.hidden = true;
    this.dockButton.classList.remove('active');
  }

  render() {
    const { game } = this;
    this.panel.querySelector('.title').textContent = t('staff.title', {
      count: game.employees.length,
      max: game.maxStaff,
    });

    const list = this.panel.querySelector('#staff-list');
    list.replaceChildren(
      ...(game.employees.length
        ? game.employees.map((e) => {
            const row = document.createElement('button');
            row.className = 'staff-row';
            const desk = e.deskId === null ? ` · ${t('staff.noDesk')}` : '';
            row.textContent = `${e.name} · ${t('staff.wage', { amount: formatMoney(e.wage) })}${desk}`;
            row.addEventListener('click', () => this.onSelect(e));
            return row;
          })
        : [note(t('staff.none'))]),
    );

    const full = game.employees.length >= game.maxStaff;
    const cands = this.panel.querySelector('#candidate-list');
    cands.replaceChildren(
      ...(game.candidates.length
        ? game.candidates.map((c) => {
            const card = document.createElement('div');
            card.className = 'candidate';
            card.innerHTML = `<span class="name"></span><span class="skill"></span><span class="wage"></span>`;
            card.querySelector('.name').textContent = c.name;
            card.querySelector('.skill').textContent = `${t('staff.skill')} ${stars(c.skill)}`;
            card.querySelector('.wage').textContent = t('staff.wage', {
              amount: formatMoney(c.wage),
            });
            const btn = document.createElement('button');
            btn.textContent = full ? t('staff.full') : t('staff.hire');
            btn.disabled = full;
            btn.addEventListener('click', () => {
              const result = game.hire(c);
              if (result.ok) this.hud.toast(t('toast.hired', { name: c.name }));
              this.render();
            });
            card.append(btn);
            return card;
          })
        : [note(t('staff.noCandidates'))]),
    );
  }
}

function note(text) {
  const p = document.createElement('p');
  p.className = 'note';
  p.textContent = text;
  return p;
}
