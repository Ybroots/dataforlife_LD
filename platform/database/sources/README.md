# Boundary reference sources

`xuan-huong-old-wards.arcgis.geojson` is a reproducible snapshot used to rebuild
the five former Đà Lạt wards that compose locality `24781` (Xuân Hương - Đà Lạt).

- Source item: [3rd Level Administrative Boundaries Vietnam](https://www.arcgis.com/home/item.html?id=64bc0640738f4256896c73816c3665b5)
- Source vintage: Global Administrative Areas 2015 (v2.8)
- Selected wards: former wards 1, 2, 3, 4 and 10 of Đà Lạt
- Generator: `database/tools/generate-xuan-huong-service-areas.mjs`
- Public status: reference reconstruction (`is_demo=true`), not an approved CSKV
  operational boundary

The historical source covers about 98% of the current canonical parent polygon.
Migration `004` clips the historical features to the current boundary and assigns
small uncovered perimeter slivers deterministically to the adjacent old ward. It
then rejects invalid, overlapping or incomplete topology.
