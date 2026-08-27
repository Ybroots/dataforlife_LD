BEGIN;

INSERT INTO localities (
  code, name, locality_type, level, province_name, population,
  area_km2, density_per_km2, source_system, source_id
) VALUES (
  'DEMO-DA-LAT', 'Phường Xuân Hương - Đà Lạt', 'Phường', 2, 'Lâm Đồng',
  72000, 31.2, 2307.7, 'fixture', 'DEMO-DA-LAT'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  locality_type = EXCLUDED.locality_type,
  province_name = EXCLUDED.province_name,
  population = EXCLUDED.population,
  area_km2 = EXCLUDED.area_km2,
  density_per_km2 = EXCLUDED.density_per_km2,
  updated_at = now();

INSERT INTO boundaries (locality_id, geom, source_system, source_id, vertex_count)
SELECT id,
       ST_Multi(ST_GeomFromText(
         'POLYGON((108.414 11.924,108.466 11.924,108.466 11.965,108.414 11.965,108.414 11.924))',
         4326
       )),
       'fixture', 'DEMO-DA-LAT', 5
FROM localities WHERE code = 'DEMO-DA-LAT'
ON CONFLICT (locality_id) DO UPDATE SET
  geom = EXCLUDED.geom,
  vertex_count = EXCLUDED.vertex_count,
  updated_at = now();

INSERT INTO police_units (
  code, name, unit_type, level, locality_id, source_system, source_id,
  provenance_status
)
SELECT 'UNIT-DEMO-DA-LAT', 'Công an phường Xuân Hương - Đà Lạt',
       'commune_police', 2, id, 'fixture', 'UNIT-DEMO-DA-LAT',
       'manually_verified'
FROM localities WHERE code = 'DEMO-DA-LAT'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  locality_id = EXCLUDED.locality_id,
  updated_at = now();

INSERT INTO stations (
  unit_id, name, address, location_source, source_system, source_id
)
SELECT id, 'Trụ sở Công an phường (dữ liệu minh họa)',
       '01 Đường Minh Họa, Lâm Đồng', 'address_only', 'fixture',
       'STATION-DEMO-DA-LAT'
FROM police_units WHERE code = 'UNIT-DEMO-DA-LAT'
ON CONFLICT (unit_id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  location_source = EXCLUDED.location_source,
  updated_at = now();

INSERT INTO directory_entries (
  entry_type, unit_id, locality_id, display_name, role_title, phone,
  phone_normalized, source_system, source_id
)
SELECT 'officer', u.id, l.id, v.display_name, v.role_title, v.phone,
       v.phone_normalized, 'fixture', v.source_id
FROM localities l
JOIN police_units u ON u.locality_id = l.id
CROSS JOIN (VALUES
  ('Cảnh sát khu vực - dữ liệu minh họa', 'Phụ trách địa bàn', '090 000 0000', '0900000000', 'demo-officer-1'),
  ('Trực ban - dữ liệu minh họa', 'Tiếp nhận thông tin', '091 000 0000', '0910000000', 'demo-officer-2')
) AS v(display_name, role_title, phone, phone_normalized, source_id)
WHERE l.code = 'DEMO-DA-LAT'
ON CONFLICT (source_system, source_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  locality_id = EXCLUDED.locality_id,
  display_name = EXCLUDED.display_name,
  role_title = EXCLUDED.role_title,
  phone = EXCLUDED.phone,
  phone_normalized = EXCLUDED.phone_normalized,
  updated_at = now();

INSERT INTO hotline_categories (code, label, description, sort_order)
VALUES ('DEMO', 'Đầu mối khẩn cấp', 'Dữ liệu minh họa để kiểm thử API', 0)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO hotlines (
  category_code, label, phone, phone_normalized, source_system, source_id
) VALUES (
  'DEMO', 'Trực ban - dữ liệu minh họa', '090 000 0000', '0900000000',
  'fixture', 'demo-hotline-1'
)
ON CONFLICT (source_system, source_id) DO UPDATE SET
  category_code = EXCLUDED.category_code,
  label = EXCLUDED.label,
  phone = EXCLUDED.phone,
  phone_normalized = EXCLUDED.phone_normalized,
  updated_at = now();

COMMIT;
