import { describe, expect, it } from 'vitest';
import { buildCanonicalPlan, normalizePhone } from './transform.js';
import type { FirestoreCommune, FirestoreContact, GeoJSONCollection } from './types.js';

const geojson: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: { ma_xa: '10001' },
    geometry: {
      type: 'MultiPolygon',
      coordinates: [[[[108.4, 11.9], [108.5, 11.9], [108.5, 12], [108.4, 11.9]]]],
    },
  }],
};

describe('canonical transform', () => {
  it('normalizes locality, hotline duplicates and synthesized KCN units', () => {
    const communes: FirestoreCommune[] = [
      { id: 'u1', ma_xa: '10001', ten_xa: 'Phường Mẫu', cap: 2, address: '1 Đường Mẫu', visibility: 'public' },
      { id: 'e1', ma_xa: 'EMERGENCYI', ten_xa: 'Khẩn cấp ANTT', cap: 3 },
      { id: 'e2', ma_xa: 'EMERGENCYI', ten_xa: 'Khẩn cấp ANTT', cap: 3 },
    ];
    const contacts: FirestoreContact[] = [
      { id: 'c1', ma_xa: '10001', ten_xa: 'Phường Mẫu', chief: 'CSKV Mẫu', mobile: '090.000.0000', cap: 2 },
      { id: 'h1', ma_xa: 'EMERGENCYI', chief: 'Trực ban', mobile: '0123 456 789', cap: 3 },
      { id: 'k1', ma_xa: '24647', ten_xa: 'Đồn Công an KCN Tân Rai', chief: 'Trực ban KCN', mobile: '090-111-1111', cap: 2 },
    ];

    const plan = buildCanonicalPlan(communes, contacts, geojson);

    expect(plan.localities).toHaveLength(1);
    expect(plan.boundaries).toHaveLength(1);
    expect(plan.hotlineCategories).toHaveLength(1);
    expect(plan.hotlineCategories[0]?.sortOrder).toBe(1);
    expect(plan.hotlines).toHaveLength(1);
    expect(plan.units.find((item) => item.code === '24647')).toMatchObject({
      unitType: 'industrial_post',
      provenanceStatus: 'synthesized_from_contact',
    });
    expect(plan.stations.find((item) => item.unitCode === '24647')?.address).toBeNull();
    expect(plan.issues.some((item) => item.code === 'HOTLINE_METADATA_COLLAPSED')).toBe(true);
    expect(plan.summary.errors).toBe(0);
  });

  it('keeps only dialable characters when normalizing phones', () => {
    expect(normalizePhone('+84 (263) 123-456')).toBe('+84263123456');
  });
});
