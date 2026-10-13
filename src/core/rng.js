// Seedovateľný generátor náhody (mulberry32). Simulácia nesmie používať Math.random(),
// aby sa dali incidenty Chaos Engine reprodukovať, testovať a ukladať do save.

export class Rng {
  /** @param {number} seed */
  constructor(seed) {
    this.state = seed >>> 0;
  }

  /** @returns {number} v intervale [0, 1) */
  next() {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** @returns {number} celé číslo v intervale [min, max] */
  int(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** @param {number} probability 0..1 */
  chance(probability) {
    return this.next() < probability;
  }

  /** @template T @param {T[]} items @returns {T | undefined} */
  pick(items) {
    return items.length ? items[Math.floor(this.next() * items.length)] : undefined;
  }

  toJSON() {
    return { state: this.state };
  }

  static fromJSON(data) {
    const rng = new Rng(0);
    rng.state = data.state >>> 0;
    return rng;
  }
}
