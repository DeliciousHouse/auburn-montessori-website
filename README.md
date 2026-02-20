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

The production image is built in CI and published to GitHub Container Registry (GHCR). To run it locally (e.g. after logging in to GHCR if the package is private):

```bash
docker compose up -d
```

The app listens on port `8080` by default (`APP_PORT` in `.env`). Open `http://localhost:8080`.

## Docker (local dev)

```bash
docker compose --profile dev up --build
```

Open `http://localhost:4321`.

## Deployment

Deploys run on push to `main`: the GitHub Action builds the image, pushes it to GHCR, then SSHs to the VPS and runs `docker compose pull && docker compose up -d` in `/opt/moms-website`. No local Docker build is required.

### One-time VPS setup

1. **Install Docker and the Compose plugin** (e.g. Docker Engine + `docker compose` v2).

2. **Create the app directory:**
   ```bash
   sudo mkdir -p /opt/moms-website
   sudo chown "$USER:$USER" /opt/moms-website
   cd /opt/moms-website
   ```

3. **Place the Compose file** (clone the repo or copy `docker-compose.yml` from this repo into `/opt/moms-website`).

4. **Create `.env`** in `/opt/moms-website` (do not commit this file):
   ```bash
   APP_PORT=8080
   SITE_URL=https://amstch.com
   ```
   `SITE_URL` is also set at build time via GitHub Secrets; the value here is for any runtime use.  
   If the GHCR package is **private**, add so the VPS can pull images:
   ```bash
   GHCR_USERNAME=your-github-username
   GHCR_PAT=your-personal-access-token-with-read-packages
   ```
   The deploy script will run `docker login ghcr.io` using these when present.

5. **Start the stack once (optional; CI will do this on first deploy):**
   ```bash
   docker compose up -d
   ```

6. **Point your reverse proxy** (Caddy, Nginx Proxy Manager, Cloudflare, etc.) at `http://127.0.0.1:8080` (or the host/port you set in `APP_PORT`).

### GitHub Secrets

In the repo: **Settings → Secrets and variables → Actions**, add:

| Secret | Required | Description |
|--------|----------|-------------|
| `VPS_HOST` | Yes | VPS hostname or IP |
| `VPS_USER` | Yes | SSH user for deploy |
| `MOMS_WEBSITE` | Yes | SSH private key for deploy (full key, including `-----BEGIN ... -----`) |
| `VPS_PORT` | No | SSH port (default `22`) |
| `SITE_URL` | No | Canonical site URL for build (sitemap/canonicals); defaults to `https://amstch.com` in the workflow |

**Note:** If the GHCR package is private, the VPS must be able to pull from `ghcr.io`. Set `GHCR_USERNAME` and `GHCR_PAT` in `/opt/moms-website/.env`; the deploy workflow will run `docker login ghcr.io` using that PAT (needs `read:packages`).

## Where to update content

Most content is in `src/data/`:

- `src/data/site.json` (address/phone/email/site metadata)
- `src/data/home.json` (home page hero + philosophy/mission/vision)
- `src/data/about.json` (purpose/objectives + Montessori approach bullets)
- `src/data/educators.json` (educator/staff bios)
- `src/data/fees-hours.json` (fees, hours, payment policies)
- `src/data/resources.json` (parent resources link groups)
- `src/data/calendar.json` (calendar links, optional calendar PDF)
- `src/data/programs.json` (Preschool + Elementary program content and images)
- `src/data/hero-slides.json` (homepage slideshow images + alt text)

Brightwheel links and photo source options are centralized in:

- `src/config/siteConfig.ts`

## PDFs (public/static assets)

PDFs live in `public/documents/` and are linked consistently throughout the site:

- `public/documents/calendar.pdf` — **required for Calendar page**: place the current school-year calendar PDF here so the embed and download work.
- `public/documents/parent-handbook.pdf` (embedded + downloadable)
- `public/documents/fees-hours-2026-2027.pdf` (embedded + downloadable)
- `public/documents/school-readiness-guidelines.pdf`

Replace these files with the current-year versions as needed (keep filenames the same to avoid changing links).

## Images

- **Logo:** `public/images/brand/logo.webp`
- **Welcome hero slideshow:** `public/images/hero/` (with README and placeholders)
- **Programs galleries:** `public/images/programs/preschool/` and `public/images/programs/elementary/`

Use local school-approved photography by default. If a public Brightwheel embed URL is available later, configure `photos.source` and `photos.brightwheelEmbedUrl` in `src/config/siteConfig.ts`.

## Brightwheel links (required)

Parent sign-in URL:

`https://schools.mybrightwheel.com/sign-in?redirect`

Other Brightwheel links (student registration and documents) are configured in `src/config/siteConfig.ts` and intentionally default to empty placeholders until published.
