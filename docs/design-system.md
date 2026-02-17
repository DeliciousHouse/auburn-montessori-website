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

Fonts are loaded from Google Fonts in `Layout.astro` (Inter + Fraunces).

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
