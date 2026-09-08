import { describe, expect, it } from 'vitest';
import { createPublicMapStyle, OFFSHORE_PLACE_LABELS } from '../src/map-style';

describe('public map labels', () => {
  it('does not include provider text layers in the built-in public style', () => {
    const style = createPublicMapStyle();
    expect(style.layers.some((layer) => layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout)).toBe(false);
  });

  it('defines both required labels at the requested coordinates', () => {
    expect(OFFSHORE_PLACE_LABELS).toEqual([
      { id: 'truong-sa', name: 'Quần đảo Trường Sa', latitude: 10.722304537073676, longitude: 115.84047241412652 },
      { id: 'hoang-sa', name: 'Quần đảo Hoàng Sa', latitude: 16.642258074877642, longitude: 112.75350799728493 },
    ]);
  });
});
