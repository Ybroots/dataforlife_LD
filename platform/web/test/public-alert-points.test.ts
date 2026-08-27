import { describe, expect, it } from 'vitest';
import { buildPublicAlertPoints } from '../src/citizen-map-points';
import type { AreaLookup, PublicAlert } from '../src/types';

const area = { code: '24781', serviceAreas: [] } as unknown as AreaLookup;
const alert = { id: 'test', areaCode: '24781', title: 'Cảnh báo kiểm thử', summary: 'Thông tin công khai',
  latitude: 11.944, longitude: 108.441 } as PublicAlert;

describe('published map alerts', () => {
  it('uses public alert coordinates without generating demo points', () => {
    expect(buildPublicAlertPoints(area, [alert])).toMatchObject([{ id: 'alert:test', demo: false, latitude: 11.944, longitude: 108.441 }]);
    expect(buildPublicAlertPoints(area, [])).toEqual([]);
  });
  it('does not invent coordinates or show alerts from another locality', () => {
    expect(buildPublicAlertPoints(area, [{ ...alert, latitude: null }, { ...alert, areaCode: 'other' }])).toEqual([]);
    expect(buildPublicAlertPoints(null, [alert])).toEqual([]);
  });
});
