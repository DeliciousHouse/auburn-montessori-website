# Auburn Montessori School (Static Website)

Static marketing + parent information site for Auburn Montessori School - The Children's House.

- Static build (Astro + Tailwind), no login, no database, no backend API
- Mobile-first responsive, accessible, fast
- Content is kept in editable JSON files under `src/data/`

## Design system

Colors, typography, spacing, buttons, cards, and layout are defined as design tokens and components. See **[docs/design-system.md](docs/design-system.md)** for the full reference. A page-by-page summary of the design refresh is in **[docs/design-refresh-summary.md](docs/design-refresh-summary.md)**.

## Environment variable (required for production)

The canonical site/domain is configured via:

- `SITE_URL` (example: `https://amstch.com`)

This is wired into `astro.config.mjs` so canonical URLs and the sitemap are correct at build time.

## Local development (Node)

```bash
npm install
npm run dev
```

Dev server runs on `http://localhost:4321` by default.

Before committing, run `npm run build` to confirm the site builds. For type checking, install `@astrojs/check` and `typescript` and run `npm run check`.

To test sitemap/canonical behavior locally:

```bash
SITE_URL=https://amstch.com npm run build
```

## Docker (production container)

Build and run the production container on port `3000`:

```bash
SITE_URL=https://amstch.com docker compose up --build
```

Open `http://localhost:3000`.

## Docker (local dev)

```bash
docker compose --profile dev up --build
```

Open `http://localhost:4321`.

## Where to update content

Most content is in `src/data/`:

- `src/data/site.json` (address/phone/email + required Brightwheel link)
- `src/data/home.json` (home page hero + philosophy/mission/vision)
- `src/data/about.json` (purpose/objectives + Montessori approach bullets)
- `src/data/educators.json` (educator/staff bios)
- `src/data/fees-hours.json` (fees, hours, payment policies)
- `src/data/resources.json` (parent resources link groups)
- `src/data/calendar.json` (calendar links, optional calendar PDF)

## PDFs (public/static assets)

PDFs live in `public/documents/` and are linked consistently throughout the site:

- `public/documents/calendar.pdf` — **required for Calendar page**: place the current school-year calendar PDF here so the embed and download work.
- `public/documents/parent-handbook.pdf` (embedded + downloadable)
- `public/documents/fees-hours-2026-2027.pdf` (embedded + downloadable)
- `public/documents/school-readiness-guidelines.pdf`

Replace these files with the current-year versions as needed (keep filenames the same to avoid changing links).

## Images

- **Logo:** `public/images/brand/logo.webp`
- **Hero / carousel:** `public/images/carousel/` (slide-1.webp, etc.). The homepage hero uses the first slide; the list is in `src/data/carousel.json`. Use real school photography (JPG/PNG/WebP) for best results.

## Brightwheel registration link (required)

The "New Parent Registration" link must point to:

`https://schools.mybrightwheel.com/sign-in?redirect_path=forms/b83bf52b-9307-4e8d-992b-4bc2ad5a8a5a8a5a/self-service`

It opens in a new tab and is labeled accordingly.
