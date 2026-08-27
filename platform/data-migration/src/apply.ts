import { Client } from 'pg';
import type { CanonicalPlan } from './types.js';

export async function applyCanonicalPlan(databaseUrl: string, plan: CanonicalPlan, options: { retireFixtures?: boolean } = {}): Promise<void> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '60s'");
    const localityIds = new Map<string, string>();
    const unitIds = new Map<string, string>();

    for (const item of plan.localities) {
      const result = await client.query<{ id: string }>(
        `INSERT INTO localities
          (code, name, locality_type, level, province_code, province_name, population,
           area_km2, density_per_km2, merger_note, visibility, source_system, source_id, raw_source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'firestore',$12,$13::jsonb)
         ON CONFLICT (code) DO UPDATE SET
           name=EXCLUDED.name, locality_type=EXCLUDED.locality_type, level=EXCLUDED.level,
           province_code=EXCLUDED.province_code, province_name=EXCLUDED.province_name,
           population=EXCLUDED.population, area_km2=EXCLUDED.area_km2,
           density_per_km2=EXCLUDED.density_per_km2, merger_note=EXCLUDED.merger_note,
           visibility=EXCLUDED.visibility, source_system=EXCLUDED.source_system, source_id=EXCLUDED.source_id,
           raw_source=EXCLUDED.raw_source, updated_at=now()
         RETURNING id`,
        [item.code, item.name, item.localityType, item.level, item.provinceCode, item.provinceName,
          item.population, item.areaKm2, item.densityPerKm2, item.mergerNote, item.visibility,
          item.sourceId, JSON.stringify(item.rawSource)],
      );
      localityIds.set(item.code, result.rows[0]!.id);
    }

    for (const item of plan.boundaries) {
      const localityId = localityIds.get(item.localityCode);
      if (!localityId) throw new Error(`Boundary references unknown locality ${item.localityCode}`);
      await client.query(
        `INSERT INTO boundaries (locality_id, geom, source_system, source_id, vertex_count)
         VALUES ($1, ST_Multi(ST_CollectionExtract(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($2),4326)),3)),
                 'geojson', $3, $4)
         ON CONFLICT (locality_id) DO UPDATE SET
           geom=EXCLUDED.geom, source_system=EXCLUDED.source_system, source_id=EXCLUDED.source_id,
           vertex_count=EXCLUDED.vertex_count, updated_at=now()`,
        [localityId, JSON.stringify(item.geometry), item.sourceId, item.vertexCount],
      );
    }

    for (const item of plan.units) {
      const localityId = item.localityCode ? localityIds.get(item.localityCode) ?? null : null;
      const result = await client.query<{ id: string }>(
        `INSERT INTO police_units
          (code, name, unit_type, level, locality_id, visibility, source_system, source_id,
           provenance_status, raw_source)
         VALUES ($1,$2,$3,$4,$5,$6,'firestore',$7,$8,$9::jsonb)
         ON CONFLICT (code) DO UPDATE SET
           name=EXCLUDED.name, unit_type=EXCLUDED.unit_type, level=EXCLUDED.level,
           locality_id=EXCLUDED.locality_id, visibility=EXCLUDED.visibility,
           source_system=EXCLUDED.source_system, source_id=EXCLUDED.source_id, provenance_status=EXCLUDED.provenance_status,
           raw_source=EXCLUDED.raw_source, updated_at=now()
         RETURNING id`,
        [item.code, item.name, item.unitType, item.level, localityId, item.visibility,
          item.sourceId, item.provenanceStatus, JSON.stringify(item.rawSource)],
      );
      unitIds.set(item.code, result.rows[0]!.id);
    }

    for (const item of plan.stations) {
      const unitId = unitIds.get(item.unitCode);
      if (!unitId) throw new Error(`Station references unknown unit ${item.unitCode}`);
      await client.query(
        `INSERT INTO stations
          (unit_id, name, address, location_source, visibility, source_system, source_id, raw_source)
         VALUES ($1,$2,$3,'address_only',$4,'firestore',$5,$6::jsonb)
         ON CONFLICT (unit_id) DO UPDATE SET
           name=EXCLUDED.name, address=EXCLUDED.address, visibility=EXCLUDED.visibility,
           source_system=EXCLUDED.source_system, source_id=EXCLUDED.source_id, raw_source=EXCLUDED.raw_source, updated_at=now()`,
        [unitId, item.name, item.address, item.visibility, item.sourceId, JSON.stringify(item.rawSource)],
      );
    }

    for (const item of plan.directoryEntries) {
      const unitId = unitIds.get(item.unitCode);
      if (!unitId) throw new Error(`Directory entry references unknown unit ${item.unitCode}`);
      const localityId = item.localityCode ? localityIds.get(item.localityCode) ?? null : null;
      await client.query(
        `INSERT INTO directory_entries
          (entry_type, unit_id, locality_id, display_name, rank, role_title, phone,
           phone_normalized, visibility, source_system, source_id, raw_source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'firestore',$10,$11::jsonb)
         ON CONFLICT (source_system, source_id) DO UPDATE SET
           entry_type=EXCLUDED.entry_type, unit_id=EXCLUDED.unit_id,
           locality_id=EXCLUDED.locality_id, display_name=EXCLUDED.display_name,
           rank=EXCLUDED.rank, role_title=EXCLUDED.role_title, phone=EXCLUDED.phone,
           phone_normalized=EXCLUDED.phone_normalized, visibility=EXCLUDED.visibility,
           raw_source=EXCLUDED.raw_source, updated_at=now()`,
        [item.entryType, unitId, localityId, item.displayName, item.rank, item.roleTitle,
          item.phone, item.phoneNormalized, item.visibility, item.sourceId,
          JSON.stringify(item.rawSource)],
      );
    }

    for (const item of plan.hotlineCategories) {
      await client.query(
        `INSERT INTO hotline_categories (code, label, sort_order, visibility)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (code) DO UPDATE SET
           label=EXCLUDED.label, sort_order=EXCLUDED.sort_order,
           visibility=EXCLUDED.visibility, updated_at=now()`,
        [item.code, item.label, item.sortOrder, item.visibility],
      );
    }

    for (const item of plan.hotlines) {
      await client.query(
        `INSERT INTO hotlines
          (category_code, label, phone, phone_normalized, visibility, source_system, source_id, raw_source)
         VALUES ($1,$2,$3,$4,$5,'firestore',$6,$7::jsonb)
         ON CONFLICT (source_system, source_id) DO UPDATE SET
           category_code=EXCLUDED.category_code, label=EXCLUDED.label,
           phone=EXCLUDED.phone, phone_normalized=EXCLUDED.phone_normalized,
           visibility=EXCLUDED.visibility, raw_source=EXCLUDED.raw_source, updated_at=now()`,
        [item.categoryCode, item.label, item.phone, item.phoneNormalized, item.visibility,
          item.sourceId, JSON.stringify(item.rawSource)],
      );
    }

    if (options.retireFixtures) {
      // Preserve demo rows and their foreign keys/history, but remove them from
      // public lookup. A demo rectangle must never beat a real GIS boundary.
      if (plan.localities.length !== 124 || plan.boundaries.length !== 124) throw new Error('Full source coverage required before retiring fixtures');
      const result = await client.query<{ total: string; invalid: string }>(
        `SELECT count(*)::text AS total,
                count(*) FILTER (WHERE NOT ST_IsValid(b.geom) OR ST_IsEmpty(b.geom))::text AS invalid
         FROM boundaries b JOIN localities l ON l.id=b.locality_id WHERE l.code=ANY($1::text[])`,
        [plan.localities.map(item => item.code)],
      );
      if (result.rows[0]?.total !== '124' || result.rows[0]?.invalid !== '0') throw new Error('Imported GIS coverage invalid');
      for (const table of ['localities', 'police_units', 'stations', 'directory_entries', 'hotlines']) {
        await client.query(`UPDATE ${table} SET visibility='internal', updated_at=now() WHERE source_system='fixture' AND visibility='public'`);
      }
      await client.query("UPDATE hotline_categories SET visibility='internal' WHERE code='DEMO'");
    }

    await client.query(
      `INSERT INTO migration_runs (migration_name, mode, source_summary, result_summary)
       VALUES ('firestore-canonical-v1','apply',$1::jsonb,$2::jsonb)`,
      [JSON.stringify({ communes: plan.summary.sourceCommunes, contacts: plan.summary.sourceContacts,
        boundaries: plan.summary.sourceBoundaries }), JSON.stringify(plan.summary)],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
