import type { StyleSpecification } from 'maplibre-gl';

/**
 * Public, keyless basemap used by every citizen workflow.
 *
 * The style deliberately contains no remote sprite or glyph dependency. This
 * prevents provider watermarks/error labels from leaking into the public UI
 * while retaining roads, water, land use and buildings from OpenStreetMap.
 */
export function createPublicMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      openmaptiles: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        attribution: '© OpenStreetMap contributors · OpenFreeMap',
      },
    },
    layers: [
      { id: 'public-background', type: 'background', paint: { 'background-color': '#eef1ef' } },
      { id: 'public-landcover', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover', paint: { 'fill-color': '#e2eadb', 'fill-opacity': 0.78 } },
      { id: 'public-landuse', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse', paint: { 'fill-color': '#ece8e1', 'fill-opacity': 0.7 } },
      { id: 'public-park', type: 'fill', source: 'openmaptiles', 'source-layer': 'park', paint: { 'fill-color': '#d5e8cf', 'fill-opacity': 0.9 } },
      { id: 'public-water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water', paint: { 'fill-color': '#a9d5e5' } },
      { id: 'public-waterway', type: 'line', source: 'openmaptiles', 'source-layer': 'waterway', paint: { 'line-color': '#8fc5da', 'line-width': 1.2 } },
      { id: 'public-boundary', type: 'line', source: 'openmaptiles', 'source-layer': 'boundary', paint: { 'line-color': '#aeb5b2', 'line-width': 1, 'line-dasharray': [3, 2] } },
      { id: 'public-road-casing', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', paint: { 'line-color': '#c8c0b6', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.4, 15, 6] } },
      { id: 'public-road', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', paint: { 'line-color': '#fffdf9', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 15, 4] } },
      { id: 'public-building', type: 'fill', source: 'openmaptiles', 'source-layer': 'building', minzoom: 13, paint: { 'fill-color': '#d7d0c7', 'fill-outline-color': '#c4bbb0', 'fill-opacity': 0.82 } },
    ],
  };
}
