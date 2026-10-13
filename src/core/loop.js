// Herná slučka s pevným simulačným krokom (fixed timestep).
// Rýchlosť 2x/3x znamená viac krokov za snímku, nie dlhší krok – postavy tak
// nepreskakujú dlaždice a simulácia je deterministická.

const MAX_FRAME_S = 0.25; // ochrana pri návrate z neaktívnej karty prehliadača
const EPSILON = 1e-9; // tolerancia zaokrúhľovania desatinných čísel

export class FixedStepLoop {
  /**
   * @param {object} opts
   * @param {number} opts.stepSeconds dĺžka jedného simulačného kroku
   * @param {(dt: number) => void} opts.update
   * @param {(alpha: number) => void} [opts.render]
   */
  constructor({ stepSeconds, update, render = () => {} }) {
    this.stepSeconds = stepSeconds;
    this.update = update;
    this.render = render;
    this.speed = 1;
    this.accumulator = 0;
    this.lastTimestamp = null;
    this.rafId = null;
  }

  /**
   * Posunie simuláciu o reálny čas. Vracia počet vykonaných krokov.
   * @param {number} realSeconds
   */
  advance(realSeconds) {
    this.accumulator += Math.min(realSeconds, MAX_FRAME_S) * this.speed;
    let steps = 0;
    while (this.accumulator + EPSILON >= this.stepSeconds) {
      this.update(this.stepSeconds);
      this.accumulator -= this.stepSeconds;
      steps++;
    }
    if (this.accumulator < 0) this.accumulator = 0;
    return steps;
  }

  /** @param {(cb: FrameRequestCallback) => number} raf */
  start(raf) {
    const frame = (timestamp) => {
      if (this.lastTimestamp !== null) this.advance((timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;
      this.render(this.accumulator / this.stepSeconds);
      this.rafId = raf(frame);
    };
    this.rafId = raf(frame);
  }
}
