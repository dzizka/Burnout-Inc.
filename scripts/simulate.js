// Headless balans simulácia: `npm run sim -- [mesiace] [seed] [scenár]`
// Postaví kanceláriu, najme zamestnancov a vypíše, ako trávia čas a koľko kolabujú.
// Scenáre: full (všetko vybavenie), minimal (len stoly a kávovar).

import { Game } from '../src/sim/game.js';
import { Activity } from '../src/sim/employee.js';
import { TIME } from '../src/data/balance.js';

const months = Number(process.argv[2] ?? 3);
const seed = Number(process.argv[3] ?? 1);
const scenario = process.argv[4] ?? 'full';

const SCENARIOS = {
  full: [
    ['desk', 2, 2],
    ['desk', 4, 2],
    ['desk', 6, 2],
    ['desk', 8, 2],
    ['coffee', 10, 2],
    ['vending', 10, 5],
    ['toilet', 10, 7],
    ['smoking', 1, 7],
  ],
  minimal: [
    ['desk', 2, 2],
    ['desk', 4, 2],
    ['desk', 6, 2],
    ['desk', 8, 2],
    ['coffee', 10, 2],
  ],
};

const game = new Game({ seed });
for (const [type, x, y] of SCENARIOS[scenario]) game.floors[0].place(type, x, y);
for (let i = 0; i < 4; i++) {
  game.refreshCandidates();
  game.hire(game.candidates[0]);
}

const counts = {};
game.events.on('employee:drama', () => (counts.drama = (counts.drama ?? 0) + 1));
game.events.on(
  'employee:collapse',
  ({ activity }) => (counts[activity] = (counts[activity] ?? 0) + 1),
);
game.events.on('employee:strike', () => (counts.strike = (counts.strike ?? 0) + 1));
game.events.on('employee:prank', ({ outcome }) => {
  counts[`prank:${outcome}`] = (counts[`prank:${outcome}`] ?? 0) + 1;
});
game.events.on('employee:hyper', () => (counts.hyper = (counts.hyper ?? 0) + 1));

const dt = 1 / TIME.TICKS_PER_SECOND;
const seconds = months * TIME.WEEKS_PER_MONTH * TIME.DAYS_PER_WEEK * TIME.DAY_DURATION_S;
const activityTime = {};
const needSum = {};
let samples = 0;
let breaksStarted = 0;
const lastActivity = new Map();

for (let i = 0; i < seconds / dt; i++) {
  game.update(dt);
  for (const e of game.employees) {
    const key = e.isWalking ? `${e.activity} (chôdza)` : e.activity;
    activityTime[key] = (activityTime[key] ?? 0) + dt;
    for (const [need, v] of Object.entries(e.stats)) needSum[need] = (needSum[need] ?? 0) + v;
    if (lastActivity.get(e) === Activity.WORKING && e.activity !== Activity.WORKING)
      breaksStarted++;
    lastActivity.set(e, e.activity);
  }
  samples += game.employees.length;
}

const total = Object.values(activityTime).reduce((a, b) => a + b, 0);
const minutes = seconds / 60;
console.log(`Scenár: ${scenario}, seed ${seed}, ${months} mes. = ${minutes} min pri 1x\n`);
console.log('Čas podľa činnosti:');
for (const [k, v] of Object.entries(activityTime).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(28)} ${((v / total) * 100).toFixed(1).padStart(5)} %`);
}
console.log('\nPriemerné potreby:');
for (const [k, v] of Object.entries(needSum)) {
  console.log(`  ${k.padEnd(10)} ${(v / samples).toFixed(0).padStart(4)}`);
}
console.log('\nUdalosti (spolu za 4 zamestnancov):');
for (const [k, v] of Object.entries(counts)) {
  console.log(`  ${k.padEnd(20)} ${String(v).padStart(4)}  (${(v / minutes).toFixed(2)}/min)`);
}
console.log(
  `\nPrestávky: ${(breaksStarted / 4 / minutes).toFixed(2)} na osobu za minútu, ` +
    `práca: ${(game.workDone / minutes).toFixed(0)} bodov/min`,
);
