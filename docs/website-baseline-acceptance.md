# Website baseline acceptance

Reviewed against the shared Websites Build and Launch v1.1 on 24 October 2026.
This draft adds the required B09 footer credit to the shared Footer component.
Client approval (O14/B09), rendered browser evidence, and release authorization
remain required; this source change does not establish acceptance or deployment.

The reviewed Layout and Footer already include language, main/skip navigation,
favicon links, canonical/social metadata, branded imagery and policy links.
Their presence does not certify asset approval, browser rendering, legal approval,
accessibility conformance or deployed behavior.

B38 and B39 remain open. O36 must establish the owner-approved GA property/stream,
events, production domain, consent/data requirements and exclusions, and the
feedback destination, recipient/queue, response owner, fields, retention and
authorized synthetic test method. Do not repurpose the school contact/tour form
or introduce child/parent data collection as assumed feedback routing.

The repository deploys on main pushes. Keep this PR draft; do not merge as an
indirect deployment without the project-specific approval and acceptance evidence.

## Local validation (24 October 2026)

`npm ci --ignore-scripts`, `npm run check` (0 errors, 0 warnings, 8 hints) and
`npm run build` passed. The build produced 18 pages and verified 51 raster-image
fallbacks. Local Chromium rendered the exact credit at a 390px viewport with no
horizontal overflow and a focusable link to the confirmed HIDconsult destination.
This is a narrow footer check, not complete keyboard or screen-reader acceptance.

`npm run verify` stopped at the existing node-exporter shell tests: 7 passed and
3 failed when Bash received Windows paths with stripped separators (exit 127).
The affected test and infrastructure files are unchanged. Linux CI remains the
required full-suite check. Installation reported 20 dependency advisories
(7 moderate, 13 high); their applicability/remediation needs a separate B34 review.
