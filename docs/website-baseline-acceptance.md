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
fallbacks. The earlier Chromium/390px rendering claim is withdrawn: no browser
test or captured result was retained to substantiate it. Footer source establishes
the credit text and destination only; horizontal overflow and keyboard focus remain
unverified. Rendered browser, keyboard and screen-reader acceptance remain open.

`npm run verify` stopped at the existing node-exporter shell tests: 7 passed and
3 failed when Bash received Windows paths with stripped separators (exit 127).
The affected test and infrastructure files are unchanged. Linux CI remains the
required full-suite check. Installation reported 20 dependency advisories
(7 moderate, 13 high); their applicability/remediation needs a separate B34 review.

### Claims-trace correction (24 October 2026)

The preceding command results are the original implementation report, not browser
evidence. On the documentation-only correction, `npm run verify` ran all 10 tests
successfully and Astro check reported 0 errors, 0 warnings and 8 hints. The Windows
build then failed with `Tsconfig not found astro/tsconfigs/strict` and a libuv
assertion (exit 127); no build success is claimed for this correction. Required
Linux CI must pass on the corrected PR head. No browser check was run or retained
for this correction; overflow, focus and rendered acceptance remain unverified.
