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
