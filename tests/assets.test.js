import { describe, expect, it } from 'vitest';
import { SHEETS, frameRect } from '../src/render/assets.js';

describe('frameRect', () => {
  it('počíta s medzerou medzi dlaždicami (Kenney Indoor)', () => {
    expect(frameRect(SHEETS.indoor, 0)).toEqual({ sx: 0, sy: 0 });
    expect(frameRect(SHEETS.indoor, 27)).toEqual({ sx: 17, sy: 17 });
  });

  it('packed sheet bez medzier (Kenney Urban)', () => {
    expect(frameRect(SHEETS.urban, 117)).toEqual({ sx: 9 * 16, sy: 4 * 16 });
  });
});
