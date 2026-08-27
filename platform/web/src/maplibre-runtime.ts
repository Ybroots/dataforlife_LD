import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// MapLibre 6 loads its worker separately. Let Vite bundle the worker AND its
// shared imports; the default sibling URL only works in unbundled ESM.
// https://maplibre.org/maplibre-gl-js/docs/#vite
setWorkerUrl(workerUrl);

export * from 'maplibre-gl';
