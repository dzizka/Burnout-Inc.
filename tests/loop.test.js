import { describe, expect, it } from 'vitest';
import { FixedStepLoop } from '../src/core/loop.js';

function makeLoop() {
  const steps = [];
  const loop = new FixedStepLoop({ stepSeconds: 0.05, update: (dt) => steps.push(dt) });
  return { loop, steps };
}

describe('FixedStepLoop', () => {
  it('vykonáva kroky s pevnou dĺžkou a zvyšok si pamätá', () => {
    const { loop, steps } = makeLoop();
    expect(loop.advance(0.12)).toBe(2);
    expect(loop.advance(0.03)).toBe(1);
    expect(steps).toEqual([0.05, 0.05, 0.05]);
  });

  it('rýchlosť 3x znamená 3× viac krokov, nie dlhší krok', () => {
    const { loop, steps } = makeLoop();
    loop.speed = 3;
    loop.advance(0.1);
    expect(steps).toHaveLength(6);
    expect(new Set(steps)).toEqual(new Set([0.05]));
  });

  it('pauza (speed 0) nevykoná žiadny krok', () => {
    const { loop } = makeLoop();
    loop.speed = 0;
    expect(loop.advance(1)).toBe(0);
  });

  it('obmedzí dlhú snímku (návrat z neaktívnej karty)', () => {
    const { loop } = makeLoop();
    expect(loop.advance(60)).toBe(5);
  });
});
