BEGIN;

CREATE OR REPLACE VIEW public_locality_directory AS
SELECT
  l.code,
  l.name,
  l.locality_type,
  l.province_name,
  l.population,
  l.area_km2,
  l.density_per_km2,
  u.id AS unit_id,
  u.name AS unit_name,
  s.name AS station_name,
  s.address AS station_address,
  CASE WHEN s.geom IS NULL THEN NULL ELSE ST_Y(s.geom) END AS station_latitude,
  CASE WHEN s.geom IS NULL THEN NULL ELSE ST_X(s.geom) END AS station_longitude,
  s.location_source
FROM localities l
LEFT JOIN police_units u
  ON u.locality_id = l.id
  AND u.unit_type = 'commune_police'
  AND u.visibility = 'public'
LEFT JOIN stations s
  ON s.unit_id = u.id
  AND s.visibility = 'public'
WHERE l.visibility = 'public';

COMMIT;
