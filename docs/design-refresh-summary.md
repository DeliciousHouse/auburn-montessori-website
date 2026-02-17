# Design Refresh — Page-by-Page Summary

This document summarizes the visual and structural changes made in the AMS website design refresh. Use it as a before/after reference; for token and component details see [design-system.md](design-system.md).

---

## Global

- **Typography:** Inter (body) and Fraunces (headings) loaded from Google Fonts. Heading scale and body line-height standardized.
- **Colors:** New token set (primary, accent, surface, text, border) with legacy aliases kept. Consistent use across header, footer, buttons, cards.
- **Spacing:** 8px rhythm (--space-*), section padding via --section-padding-y and .section / .section-alt.
- **Buttons:** Primary, secondary, outline, ghost with hover/focus/disabled states. Clear focus ring (--color-focus).
- **Cards & callouts:** Border and shadow use design tokens; radius and padding consistent.
- **Media:** .media-frame and .ratio-* (4x3, 16x9, 3x2) applied to hero image, iframes (map, PDFs), and carousel slides where used.

---

## Home

- **Hero:** Replaced gradient + dual carousel (desktop + mobile) with a single hero: one strong image (first carousel slide) in a 3:2 media frame, headline, one supporting line, and two CTAs — primary “Schedule a Tour” (→ /contact#tour-request-form), secondary “Register” (Brightwheel). Mobile: stacked with image above copy and CTAs. No Prev/Next or duplicate carousel block.
- **Trust bar:** Same info (address, phone, ages, STARS badge); emoji replaced with SVG icons (location, phone, people).
- **Quick links grid:** Card icons changed from emoji to Icon component (document, calendar, fees, people, edit). Register card still uses primary-light background and primary icon.
- **Our Foundation:** Unchanged structure; typography and spacing use design tokens.
- **CTA band:** “Schedule a Tour” as primary CTA; “Admissions Process” as secondary. Padding uses --space-10.

---

## Admissions

- **On this page:** Replaced inline nav with `PageNav` component (same links: How to Enroll, Interview Process, Signs of Readiness, Admission Requirements, Admissions Philosophy). Styling aligned to tokens (border, text-muted).
- **Rest:** Stepper, accordions, callouts, and CTA panel unchanged in structure; colors and spacing use tokens.

---

## Fees & Hours

- **Key facts row:** New row of four cards above the Programs table: Hours (summary), Monthly tuition (range), Annual enrollment (range), Registration ($50). Gives at-a-glance info without scanning the full table.
- **Tables:** Border color uses --color-border. Table-to-cards on mobile unchanged; styling uses tokens.
- **Policies:** Callout titles use Icon (clock, fees, document) instead of emoji.
- **PDF preview:** Wrapper uses .media-frame.

---

## Parent Resources

- **On this page:** Replaced inline nav with `PageNav` (Documents, Registration & Forms, Learning Resources).
- **Documents / Registration / Learning:** Card icons use Icon (external, document) instead of emoji. PDF preview iframe wrapper uses .media-frame.

---

## Educators

- **On this page:** Replaced inline nav with `PageNav`; links built from leadership/guides/support so only existing sections show (Leadership, Lead Guides, Assistants & Support).
- **Rest:** Cards and layout unchanged; typography and colors use tokens.

---

## About

- **Montessori in Practice:** Feature icons changed from emoji to Icon (document, clock, people as appropriate). Heading color uses --color-text.

---

## Contact

- **Contact items:** Emoji (📍, 📞, ✉️, 🕐) replaced with Icon (location, phone, mail, clock). contact-icon styling unchanged (primary-light bg, primary color).
- **Tour form:** Submit button uses Icon (mail) instead of emoji.
- **Map:** Iframe wrapper uses .media-frame and --color-border.

---

## 404

- **Illustration:** Replaced 🔍 emoji with Icon (search) at 64px, subtle color (--color-border-strong).

---

## Header

- **Nav:** Increased link padding (px-4 py-2.5); active state uses --color-primary-light and --color-primary. Hover uses neutral-100 / --color-text.
- **CTAs:** “Schedule a Tour” (ghost) added next to “Register” (primary) on desktop. Both hidden on small screens; mobile menu unchanged.
- **Mobile menu panel:** Border uses --color-border. Active and hover states use design tokens.
- **Logo block:** Wordmark uses --color-text and --color-text-subtle.

---

## Footer

- **Background and borders:** --color-surface-alt and --color-border.
- **Text and links:** --color-text, --color-text-muted, --color-text-subtle. Link hover: underline.
- **Spacing:** First column uses .stack for vertical rhythm; section headings and nav gaps unchanged in intent.

---

## Legal (Privacy, Terms, Accessibility, Non-Discrimination)

- No structural changes. They already use .legal-layout and .mini-nav; any color references benefit from token usage in base styles.

---

## Calendar

- **PDF container:** Wrapper uses .media-frame and --color-border. No other layout changes.

---

## Verification notes

- **Responsive:** Layouts remain mobile-first; breakpoints (e.g. lg for nav, md for CTAs) unchanged.
- **Contrast:** Text on surfaces uses existing palette (primary and neutrals) chosen for readability.
- **Focus:** Buttons and links use :focus-visible with 3px outline (--color-focus).
- **Content and links:** All existing pages and links preserved; no content removed.
