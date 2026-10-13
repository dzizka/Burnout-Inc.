// Nábor zamestnancov (GDD 5.1, 8.2, D5).

/** Tier 1 (suterén) – max. počet zamestnancov. */
export const MAX_STAFF_TIER1 = 4;

/** Počet uchádzačov v ponuke; obnovujú sa každý týždeň. */
export const CANDIDATE_COUNT = 3;

/** Zručnosť = násobok rýchlosti práce. Mzda rastie so zručnosťou (D5: mesačná). */
export const SKILL_RANGE = [0.6, 1.5];
export const WAGE_RANGE = [400, 2400];
export const WAGE_NOISE = 0.1;

/** Mená sú rovnaké vo všetkých jazykoch. Pary (meno, priezvisko) držia rod. */
export const NAMES = {
  male: {
    first: [
      'Peter',
      'Marek',
      'Tomáš',
      'Jakub',
      'Martin',
      'Juraj',
      'Lukáš',
      'Ondrej',
      'Rasťo',
      'Igor',
    ],
    last: [
      'Novák',
      'Horváth',
      'Kováč',
      'Varga',
      'Tóth',
      'Baláž',
      'Šimko',
      'Hudák',
      'Kollár',
      'Lukáč',
    ],
  },
  female: {
    first: [
      'Jana',
      'Zuzana',
      'Lucia',
      'Katarína',
      'Monika',
      'Eva',
      'Simona',
      'Petra',
      'Veronika',
      'Ivana',
    ],
    last: [
      'Nováková',
      'Horváthová',
      'Kováčová',
      'Vargová',
      'Tóthová',
      'Balážová',
      'Šimková',
      'Hudáková',
      'Kollárová',
      'Lukáčová',
    ],
  },
};

/** Farby oblečenia pre placeholder postavy. */
export const SHIRT_COLORS = [
  '#4f7cc4',
  '#c45a4f',
  '#5aa36b',
  '#c49a3d',
  '#8a5ac4',
  '#3db3b3',
  '#d4d4d4',
  '#444a55',
];
export const HAIR_COLORS = ['#2b1d14', '#5a3a22', '#c8a060', '#1a1a1a', '#8a4a2a', '#b0b0b0'];
export const SKIN_COLORS = ['#f1c9a5', '#e0ac85', '#c68a62', '#8d5a3b'];
