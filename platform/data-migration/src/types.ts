export type Visibility = 'public' | 'private' | 'internal';

export interface FirestoreCommune {
  id: string;
  ma_xa: string;
  ten_xa?: string;
  name?: string;
  loai?: string;
  cap?: number | string;
  ma_tinh?: string;
  ten_tinh?: string;
  dan_so?: number;
  dtich_km2?: number;
  matdo_km2?: number;
  address?: string;
  tru_so?: string;
  sap_nhap?: string;
  visibility?: string;
  [key: string]: unknown;
}

export interface FirestoreContact {
  id: string;
  ma_xa: string;
  ten_xa?: string;
  chief?: string;
  mobile?: string;
  cap?: number | string;
  visibility?: string;
  [key: string]: unknown;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: unknown[];
  };
  properties?: Record<string, unknown>;
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface CanonicalLocality {
  code: string;
  name: string;
  localityType: string | null;
  level: number;
  provinceCode: string | null;
  provinceName: string | null;
  population: number | null;
  areaKm2: number | null;
  densityPerKm2: number | null;
  mergerNote: string | null;
  visibility: Visibility;
  sourceId: string;
  rawSource: FirestoreCommune;
}

export interface CanonicalBoundary {
  localityCode: string;
  sourceId: string;
  geometry: GeoJSONFeature['geometry'];
  vertexCount: number;
}

export interface CanonicalUnit {
  code: string;
  name: string;
  unitType: 'commune_police' | 'department' | 'industrial_post' | 'provincial' | 'other';
  level: number | null;
  localityCode: string | null;
  visibility: Visibility;
  sourceId: string;
  provenanceStatus: 'source_record' | 'synthesized_from_contact' | 'manually_verified';
  rawSource: Record<string, unknown>;
}

export interface CanonicalStation {
  unitCode: string;
  name: string;
  address: string | null;
  visibility: Visibility;
  sourceId: string;
  rawSource: Record<string, unknown>;
}

export interface CanonicalDirectoryEntry {
  sourceId: string;
  entryType: 'officer' | 'unit_contact';
  unitCode: string;
  localityCode: string | null;
  displayName: string;
  rank: string | null;
  roleTitle: string | null;
  phone: string;
  phoneNormalized: string;
  visibility: Visibility;
  rawSource: FirestoreContact;
}

export interface CanonicalHotlineCategory {
  code: string;
  label: string;
  sortOrder: number;
  visibility: Visibility;
}

export interface CanonicalHotline {
  sourceId: string;
  categoryCode: string;
  label: string;
  phone: string;
  phoneNormalized: string;
  visibility: Visibility;
  rawSource: FirestoreContact;
}

export interface MigrationIssue {
  severity: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  sourceIds?: string[];
}

export interface CanonicalPlan {
  localities: CanonicalLocality[];
  boundaries: CanonicalBoundary[];
  units: CanonicalUnit[];
  stations: CanonicalStation[];
  directoryEntries: CanonicalDirectoryEntry[];
  hotlineCategories: CanonicalHotlineCategory[];
  hotlines: CanonicalHotline[];
  issues: MigrationIssue[];
  summary: Record<string, number>;
}
