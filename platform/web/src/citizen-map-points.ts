import { DEMO_ALERTS } from './features';
import type { AreaLookup, ServiceArea } from './types';

export interface CitizenMapPoint {
  id: string;
  kind: 'station' | 'officer' | 'alert';
  serviceAreaCode: string;
  name: string;
  detail: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  demo: boolean;
}

// Polygon membership is for display only, never for operational dispatch.
function ringContains(longitude: number, latitude: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x, y] = ring[i]!;
    const [px, py] = ring[j]!;
    if (x === undefined || y === undefined || px === undefined || py === undefined) continue;
    const cross = (longitude - x) * (py - y) - (latitude - y) * (px - x);
    if (Math.abs(cross) < 1e-12 && longitude >= Math.min(x, px) && longitude <= Math.max(x, px)
      && latitude >= Math.min(y, py) && latitude <= Math.max(y, py)) return true;
    if ((y > latitude) !== (py > latitude) && longitude < (px - x) * (latitude - y) / (py - y) + x) inside = !inside;
  }
  return inside;
}

export function pointInBoundary(longitude: number, latitude: number, boundary: ServiceArea['boundary']): boolean {
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return false;
  const polygons = boundary.type === 'Polygon' ? [boundary.coordinates as number[][][]] : boundary.coordinates as number[][][][];
  return polygons.some(([outer, ...holes]) => outer && ringContains(longitude, latitude, outer)
    && !holes.some((hole) => ringContains(longitude, latitude, hole)));
}

function demoStationPosition(zone: ServiceArea) {
  // Separate demo pins geographically; never shift existing officer markers in screen pixels.
  for (const distance of [0.006, 0.003, 0.001, 0.0003]) {
    for (let direction = 0; direction < 8; direction++) {
      const angle = direction * Math.PI / 4;
      const latitude = zone.center.latitude + Math.sin(angle) * distance;
      const longitude = zone.center.longitude + Math.cos(angle) * distance;
      if (pointInBoundary(longitude, latitude, zone.boundary)) return { latitude, longitude };
    }
  }
  return zone.center;
}

export function buildCitizenMapPoints(area: AreaLookup | null): CitizenMapPoint[] {
  // The fixtures are specific to this demo, not other wards returned by lookup.
  if (area?.code !== '24781' || !area.serviceAreas.length) return [];
  const contacts = area.directory.filter((entry) => entry.phone.trim());
  const points: CitizenMapPoint[] = [];
  area.serviceAreas.forEach((zone, index) => {
    const contact = contacts.length ? contacts[index % contacts.length] : null;
    points.push({
      id: `officer:${zone.code}`, kind: 'officer', serviceAreaCode: zone.code,
      name: `${contact?.displayName ?? 'Đầu mối CSKV'} · P.${zone.legacyWardCode} cũ`,
      detail: 'Liên hệ công khai của phường; vị trí pin minh họa.',
      phone: contact?.phone ?? null, ...zone.center, demo: true,
    });
    const isMain = zone.legacyWardCode === '3' && Boolean(area.station);
    const mainPosition = { latitude: 11.9327, longitude: 108.4426 };
    const position = isMain && pointInBoundary(mainPosition.longitude, mainPosition.latitude, zone.boundary)
      ? mainPosition : demoStationPosition(zone);
    points.push({
      id: `station:${zone.code}`, kind: 'station', serviceAreaCode: zone.code,
      name: isMain ? area.station!.name : `Điểm tiếp dân Công an Xuân Hương · Khu P.${zone.legacyWardCode}`,
      detail: isMain ? area.station!.address ?? 'Phường Xuân Hương – Đà Lạt'
        : `Điểm tiếp dân giả định trong khu Phường ${zone.legacyWardCode} cũ, chưa có địa chỉ chính thức.`,
      phone: contact?.phone ?? null, ...position, demo: true,
    });
  });
  for (const alert of DEMO_ALERTS) {
    const zone = area.serviceAreas.find((candidate) => pointInBoundary(alert.longitude, alert.latitude, candidate.boundary));
    if (zone) points.push({
      id: `alert:${alert.id}`, kind: 'alert', serviceAreaCode: zone.code, name: alert.title,
      detail: alert.summary, phone: null, latitude: alert.latitude, longitude: alert.longitude, demo: true,
    });
  }
  return points;
}

export function pointsWithinZone(points: CitizenMapPoint[], zone: ServiceArea): CitizenMapPoint[] {
  return points.filter((point) => pointInBoundary(point.longitude, point.latitude, zone.boundary));
}
