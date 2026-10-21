# Design System

Auburn Montessori School website uses a token-based design system for consistency, accessibility, and maintainability. All tokens and component patterns live in `src/styles/global.css` and shared components.

## Colors

| Token | Usage |
|-------|--------|
| `--color-primary` | Primary brand (navy). Buttons, links, active states. |
| `--color-primary-hover` | Hover for primary. |
| `--color-primary-light` | Light tint for backgrounds (active nav, callouts). |
| `--color-accent` | Accent (clay). Badges, secondary emphasis. |
| `--color-accent-light` | Light accent background. |
| `--color-surface` | Page/content background (white). |
| `--color-surface-alt` | Alternate sections (e.g. footer, bands). |
| `--color-text` | Primary text. |
| `--color-text-muted` | Secondary text. |
| `--color-text-subtle` | Labels, captions. |
| `--color-border` | Borders, dividers. |
| `--color-border-strong` | Stronger borders. |
| `--color-focus` | Focus ring (matches primary). |

Use these in `style` or in CSS. Legacy aliases (`--color-brand-primary`, `--color-neutral-*`) remain for compatibility.

## Typography

- **Body:** `--font-sans` (Inter), `--text-body` (1rem), `--leading-body` (1.7).
- **Headings:** `--font-display` (Fraunces), tight line-height, slight negative letter-spacing.
- **Scale:** H1 clamp(1.75rem–2.5rem), H2 1.5rem, H3 1.125rem, H4 1rem.
- **Readable width:** `--content-max` (42rem) for long-form text.

Fonts are self-hosted, not loaded from Google Fonts. The WOFF2 files live in `public/fonts/` (from the `@fontsource/inter` and `@fontsource/fraunces` packages) and are declared with `@font-face` (`font-display: swap`) at the top of `src/styles/global.css`:

- Inter: 400, 500, 600, 700.
- Fraunces: 400, 400 italic, 600, 700.

`Layout.astro` preloads only `inter-latin-400-normal.woff2`. See `PERF_NOTES.md` section 4.

## Logo colors (sampled)

The logo's own blue and yellow are not site tokens. They were sampled from `src/assets/brand/logo.webp` (512 x 512, lossy WebP) with Pillow: the median of every pixel that is clearly blue (about 32,200 px) or clearly yellow (about 7,200 px). Because the file is lossy, treat these as approximations of the school's print colors.

| Logo color | Sampled hex | Most frequent exact pixel value |
|------------|-------------|---------------------------------|
| Blue (emblem, lettering) | `#046DF7` | `#006DF9` |
| Yellow (magnifying-glass ring and handle) | `#FCD607` | `#FFD703` |

These are not used by the site UI (the UI uses the navy and clay tokens above); record them here so any future logo-matched artwork uses the same values.

## Brand images

- `src/assets/brand/logo.webp` (and the identical `public/images/brand/logo.webp`): header and footer logo. It is a 512 x 512 crop of a wider lockup, and the right edge of the wording is cut off. The uncropped original is not in this repo or the older `ams-webpage`, `ams-website` or `ams-web-v2` repos.
- `public/images/brand/og-card.png`: 1200 x 630 social-share card used for `og:image` and `twitter:image`. It places the existing `logo.webp` unscaled on the white page background, with the school name set in Fraunces (700 and italic) in the `--color-primary`, `--color-text-muted` and `--color-accent` token colors. Nothing in it is redrawn; replace it when the full logo is supplied.

## Spacing

8px-based scale:

- `--space-1` (4px) through `--space-16` (64px).
- `--section-padding-y`: `clamp(2rem, 5vw, 3.5rem)` for section vertical padding.
- **Utilities:** `.stack` (vertical gap between siblings), `.stack-sm`, `.stack-lg`.

## Radius & shadow

- **Radius:** `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px).
- **Shadow:** `--shadow-sm`, `--shadow-md` for cards and buttons.

## Buttons

- **Base:** `.btn` — inline-flex, rounded-lg, font-semibold, transition. Supports `:focus-visible` and `[aria-disabled]` / `:disabled`.
- **Variants:** `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`.
- **Sizes:** `.btn-sm`, `.btn-lg`, `.btn-icon` (adds gap for icon + text).

## Cards & callouts

- **Card:** `.card`, `.card-body` — white background, border, radius-xl, shadow-sm, hover shadow-md.
- **Callout:** `.callout` + `.callout-info` / `.callout-warn` / `.callout-accent` — left border, padded, with `.callout-title` and `.callout-body`.

## Media

- **Frame:** `.media-frame` — overflow hidden, border-radius-lg, consistent image treatment.
- **Aspect ratios:** `.ratio-4x3`, `.ratio-16x9`, `.ratio-3x2` (use with `.media-frame`).

## Tables

- **Desktop:** `.data-table` — sticky header, zebra rows, token-based colors.
- **Mobile:** Add `.table-cards` so rows become cards with `data-label` on cells; thead is hidden.

## Layout

- **Container:** `.container-page` — max-width 72rem, horizontal padding (responsive).
- **Sections:** `.section`, `.section-alt` use `--section-padding-y`. Legacy `.section-band` / `.section-band-alt` still available.

## Components

- **PageNav:** `src/components/PageNav.astro` — “On this page” links (used on Admissions, Parent Resources, Educators).
- **Icon:** `src/components/Icon.astro` — SVG icons by `name` (location, phone, mail, clock, calendar, document, fees, people, edit, search, external).
- **Accordion, ExternalLink:** Existing; styled via global CSS (accordion-item, icon-external-wrap).
