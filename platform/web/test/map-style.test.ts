import { describe, expect, it } from 'vitest';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { createPublicMapStyle, suppressHiddenPlaceLabels } from '../src/map-style';

type LabelFilterMap = Pick<MapLibreMap, 'getStyle' | 'getFilter' | 'setFilter'>;

describe('public map labels', () => {
  it('does not include provider text layers in the built-in public style', () => {
    const style = createPublicMapStyle();
    expect(style.layers.some((layer) => layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout)).toBe(false);
  });

  it('filters only text symbol layers and preserves their existing filter', () => {
    const applied: Array<{ id: string; filter: unknown }> = [];
    const existingFilter = ['==', ['get', 'class'], 'place'];
    const map = {
      getStyle: () => ({
        version: 8 as const,
        sources: {},
        layers: [
          { id: 'place-label', type: 'symbol' as const, layout: { 'text-field': ['get', 'name'] } },
          { id: 'place-icon', type: 'symbol' as const, layout: { 'icon-image': 'marker' } },
          { id: 'water', type: 'fill' as const },
        ],
      }),
      getFilter: (id: string) => id === 'place-label' ? existingFilter : undefined,
      setFilter: (id: string, filter: unknown) => { applied.push({ id, filter }); return map; },
    } as unknown as LabelFilterMap;

    suppressHiddenPlaceLabels(map);

    expect(applied).toHaveLength(1);
    expect(applied[0]?.id).toBe('place-label');
    expect(JSON.stringify(applied[0]?.filter)).toContain('quần đảo trường sa');
    expect(JSON.stringify(applied[0]?.filter)).toContain('hoàng sa');
    expect(JSON.stringify(applied[0]?.filter)).toContain(JSON.stringify(existingFilter));
  });
});
