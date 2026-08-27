# Product UI regression checks

These Playwright CLI functions are manual local QA helpers, separate from Vitest.
They refuse non-local origins and require an already authenticated browser session.
Never run against the production API.

1. From `platform`, run `npm --workspace @cskv/api run dev:fixture` and
   `npm run dev:web`. Use the local credentials in
   your configured environment; do not commit them.
2. Open and sign into two Playwright CLI sessions at `http://127.0.0.1:5173`:
   `design` as a citizen, `design-officer` as an officer.
3. Use local fixture data with at least one SOS/report visible to that officer.
4. From the repository root, run:

```powershell
playwright-cli -s=design run-code --filename=platform/web/qa/product-review.js
playwright-cli -s=design-officer run-code --filename=platform/web/qa/officer-product-review.js
```

The scripts cover six viewports, root horizontal overflow, directory disclosure,
map dominance, the six-step tour, the visible mobile account spotlight, and a
short keyboard SOS press that must send nothing. Officer checks cover queue,
case detail and operations. They do not certify all business workflows or WCAG
compliance. Inspect the returned result: Playwright CLI may return shell exit
code zero even when a script reports an assertion failure.

Manual visual review also checks map layers, selected-zone lists, public map
attribution, location-denied recovery, menu-to-login navigation and focus return.
The 2026-08-27 refinement passed typecheck, 18 Vitest tests and the web build;
the existing large MapLibre bundle warning remains.

## Required release check: the production map

Dev-server canvas checks alone do not catch MapLibre 6 worker packaging failures.
Run `npm --workspace @cskv/web run build` and serve that dist with Vite preview
on port 4173. The build now fails if the bundled worker is absent, unreferenced,
or still imports an unshipped shared module. All three map surfaces use the same
configured runtime.

Open the preview in a separate Playwright CLI session, then run:

```powershell
playwright-cli -s=map-production-test run-code --filename=platform/web/qa/production-map-review.js
```

This read-only check also supports the deployed pilot origin. It checks a real
worker response (JavaScript, not an HTML fallback), vector tile responses, GIS
boundary initialization, the restored red header, and screenshots at desktop,
tablet and phone sizes. Inspect the screenshots before considering the release
verified. Do not treat DOM markers or HTTP 200 alone as proof of a working map.

## Required release check: features on real HTTP and a production build

Localhost is a secure context even over HTTP. The pilot IP is not. A localhost-only
test missed `crypto.randomUUID` crashing signed-in Reports and SOS. Request IDs now
use cryptographic random bytes when the native UUID method is unavailable; the
five web unit tests cover both paths. `npm test` from `platform` includes them.

With the **fixture** API on 3001 and a freshly built Vite preview on 4173:

```powershell
python -m pip install -r platform/web/qa/requirements.txt
python -m playwright install chromium
python platform/web/qa/release-regression.py
```

Pass `--browser <path-to-existing-chromium>` to reuse an installed test browser.
The script reads local fixture credentials from `platform/.env` or environment
variables without printing them. It refuses any API that does not report
`dataSource: fixture` or the explicit isolated-database flag `releaseValidation: true`.
It uses isolated browser contexts, never the user's browser
profile. The reserved `http://dataforlife.test` origin is intercepted and forwarded
only to loopback preview: `isSecureContext` is genuinely false, without mocking
the crypto API. There are no production writes.

Coverage includes seven citizen features as guest and signed-in citizen at phone,
tablet and desktop sizes, on HTTP and localhost; actual SPA navigation and browser
back/forward; directory collapse and mobile tabs; report validation, attachment,
map location, local submission and tracking; SOS short-press safety and local
submission with GPS on localhost; four officer panes and six operations tabs;
and a failed lazy chunk with visible recovery and navigation back to the map.
The suite checks uncaught JavaScript errors, overflow and red branding, and saves
screenshots under `tmp/release-regression`. An assertion failure exits nonzero.

`--flows-only` skips the citizen viewport matrix for focused debugging.
`--reproduce-only` is a historical negative test: it expects the original blank
screen and must **fail** against the fixed build.

Limits: HTTP cannot provide secure-context GPS; this is checked as an explicit
unavailable state, not claimed as a successful SOS dispatch. GPS-enabled SOS needs
HTTPS in deployment. AI and official VNeID remain labeled development/demo flows.
Screens and navigation checks do not certify every backend business transition.
Run the separate production-map check and inspect its screenshots before release.

## Full-province release gate

Fixtures are useful for tests, but are not valid evidence of production data parity.
Point `QA_PREVIEW_URL` to a loopback production-build preview whose API uses a
separate PostgreSQL database with the complete canonical dataset and
`API_RELEASE_VALIDATION=true`. Never enable this flag on production.

- `data-parity.py --base <origin> --snapshot <private-canonical.json>`: read-only
  comparison of all 124 boundaries/localities, 296 contacts and 34 hotlines.
- `province-overview.py`: read-only browser checks for the 124-region default,
  native selector, four sample localities at three sizes including landscape,
  a real rendered polygon click, deep-link reload, GPS and network-error recovery.
  Set `QA_CHROME` to the installed Chromium executable. `QA_OVERVIEW_URL` may
  target production for this read-only test; it never sends reports or SOS.
- `full-data-browser.py`: **isolated QA only**, public-alert/map consistency,
  directory, patrol lifecycle, shift reports and statistics.
- `platform/e2e/final_dual_role_workflow.cjs`: **isolated QA only**, complete
  citizen/officer transitions including attachments, SOS and satisfaction rating.

Default province mode must not silently choose Xuân Hương or claim a GPS fix.
Select a locality to see its original detailed boundary/directory; simplified
overview geometry is display-only and must not replace authoritative lookup GIS.
