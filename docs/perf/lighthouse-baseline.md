# Mobile Lighthouse Baseline Workflow

This repo includes a reproducible Lighthouse run for mobile performance comparisons.

## 1) Build and run local preview

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

Keep preview running in one terminal.

## 2) Capture a baseline run (before changes)

```bash
npm run perf:lighthouse:mobile -- --url http://127.0.0.1:4321/ --output perf-results/before-mobile.json --summary perf-results/before-mobile.summary.json
```

## 3) Capture an after run

```bash
npm run perf:lighthouse:mobile -- --url http://127.0.0.1:4321/ --output perf-results/after-mobile.json --summary perf-results/after-mobile.summary.json
```

If Chrome is not auto-detected, pass a binary path:

```bash
npm run perf:lighthouse:mobile -- --chrome-path "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
```

## 4) Metrics to record

Use the summary JSON files to compare:

- `performanceScore`
- `lcpMs`
- `cls`
- `inpMs` (if available in the run)
- `ttfbMs`
- `totalTransferBytes`
- `requestCount`

These map to PSI-focused outcomes for render blocking, image delivery, and cache effectiveness.
