import type {
  CanonicalPlan,
  FirestoreCommune,
  FirestoreContact,
  GeoJSONCollection,
  GeoJSONFeature,
  Visibility,
} from './types.js';

const HOTLINE_PREFIX = 'EMERGENCY';
const HOTLINE_ORDER: Record<string, number> = {
  EMERGENCYI: 1,
  EMERGENCYII: 2,
  EMERGENCYIII: 3,
  EMERGENCYIV: 4,
};

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function visibility(value: unknown): Visibility {
  return value === 'private' || value === 'internal' ? value : 'public';
}

export function normalizePhone(value: unknown): string {
  return text(value).replace(/[^0-9+]/g, '');
}

function countVertices(input: unknown): number {
  if (!Array.isArray(input)) return 0;
  if (input.length === 2 && input.every((item) => typeof item === 'number')) return 1;
  return input.reduce((sum, item) => sum + countVertices(item), 0);
}

function localityName(commune: FirestoreCommune): string {
  return text(commune.ten_xa || commune.name || commune.ma_xa);
}

function isHotlineCode(code: string): boolean {
  return code.toUpperCase().startsWith(HOTLINE_PREFIX);
}

function communeUnitCode(code: string): string {
  return `CA-${code}`;
}

function featureCode(feature: GeoJSONFeature): string {
  return text(feature.properties?.ma_xa);
}

export function buildCanonicalPlan(
  communes: FirestoreCommune[],
  contacts: FirestoreContact[],
  geojson: GeoJSONCollection,
): CanonicalPlan {
  const issues: CanonicalPlan['issues'] = [];
  const communeGroups = new Map<string, FirestoreCommune[]>();
  const contactGroups = new Map<string, FirestoreContact[]>();
  const featureByCode = new Map<string, GeoJSONFeature>();

  for (const commune of communes) {
    const code = text(commune.ma_xa);
    if (!code) {
      issues.push({ severity: 'error', code: 'COMMUNE_WITHOUT_CODE', message: 'Commune is missing ma_xa.', sourceIds: [commune.id] });
      continue;
    }
    const group = communeGroups.get(code) ?? [];
    group.push(commune);
    communeGroups.set(code, group);
  }

  for (const contact of contacts) {
    const code = text(contact.ma_xa);
    if (!code) {
      issues.push({ severity: 'error', code: 'CONTACT_WITHOUT_CODE', message: 'Contact is missing ma_xa.', sourceIds: [contact.id] });
      continue;
    }
    const group = contactGroups.get(code) ?? [];
    group.push(contact);
    contactGroups.set(code, group);
  }

  for (const feature of geojson.features) {
    const code = featureCode(feature);
    if (code) featureByCode.set(code, feature);
  }

  const plan: CanonicalPlan = {
    localities: [],
    boundaries: [],
    units: [],
    stations: [],
    directoryEntries: [],
    hotlineCategories: [],
    hotlines: [],
    issues,
    summary: {},
  };

  for (const [code, group] of communeGroups) {
    const commune = group[0];
    if (!commune) continue;

    if (group.length > 1) {
      issues.push({
        severity: isHotlineCode(code) ? 'info' : 'warning',
        code: isHotlineCode(code) ? 'HOTLINE_METADATA_COLLAPSED' : 'DUPLICATE_COMMUNE_CODE',
        message: `${code} has ${group.length} source rows; canonical metadata uses one record.`,
        sourceIds: group.map((item) => item.id),
      });
    }

    if (isHotlineCode(code)) {
      plan.hotlineCategories.push({
        code,
        label: localityName(commune),
        sortOrder: HOTLINE_ORDER[code.toUpperCase()] ?? plan.hotlineCategories.length + 100,
        visibility: visibility(commune.visibility),
      });
      continue;
    }

    const level = numeric(commune.cap) ?? 2;
    if (level === 2) {
      plan.localities.push({
        code,
        name: localityName(commune),
        localityType: text(commune.loai) || null,
        level,
        provinceCode: text(commune.ma_tinh) || null,
        provinceName: text(commune.ten_tinh) || null,
        population: numeric(commune.dan_so),
        areaKm2: numeric(commune.dtich_km2),
        densityPerKm2: numeric(commune.matdo_km2),
        mergerNote: text(commune.sap_nhap) || null,
        visibility: visibility(commune.visibility),
        sourceId: commune.id,
        rawSource: commune,
      });

      plan.units.push({
        code: communeUnitCode(code),
        name: `Công an ${localityName(commune)}`,
        unitType: 'commune_police',
        level,
        localityCode: code,
        visibility: visibility(commune.visibility),
        sourceId: commune.id,
        provenanceStatus: 'source_record',
        rawSource: commune,
      });

      plan.stations.push({
        unitCode: communeUnitCode(code),
        name: `Trụ sở Công an ${localityName(commune)}`,
        address: text(commune.address || commune.tru_so) || null,
        visibility: visibility(commune.visibility),
        sourceId: commune.id,
        rawSource: commune,
      });

      const feature = featureByCode.get(code);
      if (feature) {
        plan.boundaries.push({
          localityCode: code,
          sourceId: code,
          geometry: feature.geometry,
          vertexCount: countVertices(feature.geometry.coordinates),
        });
      } else {
        issues.push({ severity: 'warning', code: 'LOCALITY_WITHOUT_BOUNDARY', message: `${code} has no GeoJSON boundary.`, sourceIds: [commune.id] });
      }
      continue;
    }

    plan.units.push({
      code,
      name: localityName(commune),
      unitType: level === 1 ? 'department' : 'provincial',
      level,
      localityCode: null,
      visibility: visibility(commune.visibility),
      sourceId: commune.id,
      provenanceStatus: 'source_record',
      rawSource: commune,
    });
  }

  for (const [code, group] of contactGroups) {
    if (isHotlineCode(code)) {
      if (!plan.hotlineCategories.some((item) => item.code === code)) {
        plan.hotlineCategories.push({ code, label: text(group[0]?.ten_xa || code), sortOrder: 0, visibility: 'public' });
        issues.push({ severity: 'warning', code: 'HOTLINE_CATEGORY_SYNTHESIZED', message: `${code} was synthesized from contacts because commune metadata is missing.` });
      }
      for (const contact of group) {
        const phone = text(contact.mobile);
        if (!phone) {
          issues.push({ severity: 'error', code: 'HOTLINE_WITHOUT_PHONE', message: `${contact.id} has no phone.`, sourceIds: [contact.id] });
          continue;
        }
        plan.hotlines.push({
          sourceId: contact.id,
          categoryCode: code,
          label: text(contact.chief || contact.ten_xa || code),
          phone,
          phoneNormalized: normalizePhone(phone),
          visibility: visibility(contact.visibility),
          rawSource: contact,
        });
      }
      continue;
    }

    const commune = communeGroups.get(code)?.[0];
    const level = numeric(commune?.cap ?? group[0]?.cap);
    let unitCode: string;
    let localityCode: string | null = null;
    let entryType: 'officer' | 'unit_contact' = 'unit_contact';

    if (level === 2 && commune) {
      unitCode = communeUnitCode(code);
      localityCode = code;
      entryType = 'officer';
    } else if (commune) {
      unitCode = code;
    } else {
      unitCode = code;
      const first = group[0];
      const unitName = text(first?.ten_xa || code);
      plan.units.push({
        code,
        name: unitName,
        unitType: code === '24647' || code === '24648' ? 'industrial_post' : 'other',
        level,
        localityCode: null,
        visibility: visibility(first?.visibility),
        sourceId: `synth:${code}`,
        provenanceStatus: 'synthesized_from_contact',
        rawSource: { contactSourceIds: group.map((item) => item.id) },
      });
      plan.stations.push({
        unitCode,
        name: unitName,
        address: null,
        visibility: visibility(first?.visibility),
        sourceId: `synth:${code}`,
        rawSource: { contactSourceIds: group.map((item) => item.id) },
      });
      issues.push({
        severity: 'warning',
        code: 'UNIT_SYNTHESIZED_FROM_CONTACT',
        message: `${code} (${unitName}) has no commune/unit source row; address and coordinates require verification.`,
        sourceIds: group.map((item) => item.id),
      });
    }

    for (const contact of group) {
      const phone = text(contact.mobile);
      if (!phone) {
        issues.push({ severity: 'error', code: 'DIRECTORY_ENTRY_WITHOUT_PHONE', message: `${contact.id} has no phone.`, sourceIds: [contact.id] });
        continue;
      }
      plan.directoryEntries.push({
        sourceId: contact.id,
        entryType,
        unitCode,
        localityCode,
        displayName: text(contact.chief || contact.ten_xa || 'Liên hệ Công an'),
        rank: null,
        roleTitle: null,
        phone,
        phoneNormalized: normalizePhone(phone),
        visibility: visibility(contact.visibility),
        rawSource: contact,
      });
    }
  }

  plan.summary = {
    sourceCommunes: communes.length,
    sourceContacts: contacts.length,
    sourceBoundaries: geojson.features.length,
    localities: plan.localities.length,
    boundaries: plan.boundaries.length,
    units: plan.units.length,
    stations: plan.stations.length,
    directoryEntries: plan.directoryEntries.length,
    hotlineCategories: plan.hotlineCategories.length,
    hotlines: plan.hotlines.length,
    warnings: issues.filter((item) => item.severity === 'warning').length,
    errors: issues.filter((item) => item.severity === 'error').length,
  };

  return plan;
}
