# Release requirements

The user requires production parity with the validated local web application.
Before any deployment:

- Compare features, canonical data, configuration, authentication and browser
  capabilities, not just whether pages return HTTP 200.
- Verify all 124 source localities/boundaries and the complete source directory
  and hotlines. A fixture-only database is not a valid release.
- Back up the target database and web release. Test imports on a separate database
  before applying to production; preserve workflows, identities and approved GIS.
- Run typecheck, unit tests, production-build browser tests for guest/citizen/
  officer, actual map tile/worker checks, and read-only live checks after release.
- GPS needs trusted HTTPS. Check certificate renewal, cookies and upload limits.
- Stop and report any parity gap; never silently substitute demo/fixture data.
- Keep AI, official VNeID, 112/113, SMS/push and other unconnected integrations
  explicitly marked as unavailable. Do not imply they are live services.
- Do not publish test incidents/SOS to production or invent map coordinates.
- Record the exact release, data counts, tests, known limitations and backup.

Deploy to the existing VPS unless the user explicitly requests another host.
