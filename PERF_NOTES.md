# Performance Notes

This change set targets PSI issues around caching, image delivery, render-blocking resources, critical request chains, and key Lighthouse accessibility warnings.

## What changed and why

### 1) Reproducible Lighthouse workflow (mobile)
- Added `npm run perf:lighthouse:mobile` via `scripts/perf/lighthouse-mobile.mjs`.
- Added `docs/perf/lighthouse-baseline.md` with exact before/after commands and tracked metrics.
- Purpose: make perf checks repeatable and comparable in local runs.

### 2) Cache policy hardening (Nginx)
- Updated `nginx.conf` cache headers:
  - HTML: `Cache-Control: max-age=0, must-revalidate`
  - `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`
  - `/images/*`: `Cache-Control: public, max-age=2592000`
  - `/fonts/*`: `Cache-Control: public, max-age=31536000, immutable`
- Purpose: satisfy efficient cache lifetime guidance while preserving fast content freshness for HTML.

### 3) Hero and logo image delivery
- Copied hero/logo sources into `src/assets/*` and migrated hero/logo rendering to `astro:assets`.
- Hero slideshow now uses responsive image widths (`480,640,768,960,1280`) plus `sizes="(min-width: 1024px) 900px, 100vw"`.
- LCP prioritization preserved:
  - Slide 1: `loading="eager"` + `fetchpriority="high"`
  - Slides 2-4: lazy-loaded
- Header logo uses a true small variant (`width=70`, `height=70`, density variants), avoiding oversized downloads for a small slot.
- Purpose: reduce transferred bytes for above-the-fold media and improve LCP on mobile.

### 4) Fonts and render-blocking requests
- Removed render-blocking Google Fonts stylesheet.
- Self-hosted Inter/Fraunces WOFF2 files under `public/fonts`.
- Added `@font-face` with `font-display: swap`.
- Added preload for primary Inter regular WOFF2 in `<head>`.
- Purpose: remove third-party render-blocking stylesheet and improve first render path.

### 5) Critical request chain and a11y updates
- Added homepage-only preload for the LCP hero candidate with `imagesrcset` + `imagesizes`.
- Improved carousel semantics by using button `aria-pressed` state instead of invalid tablist pattern.
- Increased touch target sizing:
  - Larger carousel dots
  - Button min-heights for tap comfort
- Adjusted muted/subtle text token contrast for stronger AA compliance on light surfaces.

## Mobile Lighthouse before/after

Source files:
- `perf-results/before-mobile.summary.json`
- `perf-results/after-mobile.summary.json`

Metrics:
- Performance score: **79 -> 94**
- LCP: **4882 ms -> 3081 ms**
- CLS: **0.0332 -> 0.0330** (stable)
- INP: **not reported** in these local runs
- TTFB: **7 ms -> 2 ms**
- Total transfer size: **1,191,912 B -> 806,714 B**
- Request count: **11 -> 14** (increased due responsive image/font/preload requests, while overall byte cost dropped materially)

## Trade-offs
- `font-display: swap` may briefly show fallback fonts on first render, but avoids blocking.
- Request count can increase with responsive image strategies; byte savings and faster LCP are prioritized.
- Nginx header behavior is configured in repo and should be validated in deployed runtime with `curl -I` checks.
