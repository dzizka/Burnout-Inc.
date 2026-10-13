import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng.js';

describe('Rng', () => {
  it('rovnaký seed dá rovnakú postupnosť', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(
      Array.from({ length: 5 }, () => b.next()),
    );
  });

  it('hodnoty sú v intervale [0, 1) a int() rešpektuje hranice', () => {
    const rng = new Rng(1);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      const n = rng.int(3, 5);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(5);
    }
  });

  it('stav sa dá uložiť a obnoviť', () => {
    const rng = new Rng(7);
    rng.next();
    const restored = Rng.fromJSON(JSON.parse(JSON.stringify(rng)));
    expect(restored.next()).toBe(rng.next());
  });
});
