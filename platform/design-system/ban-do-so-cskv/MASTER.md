# DataForLife / Bản đồ số CSKV — product design rules

Updated: 2026-08-27. This revision replaces the earlier generated directory/landing-page recommendations.

## Intent

A conservative, production-facing public-service product: clean, legible and calm.
Preserve working workflows and recognizable navigation. Refine selectively, in order:
typography, spacing, color, controls, grouping, icons, map controls, responsive behavior,
then only motion that explains a state change.

Page-specific rules may refine these defaults but must not reintroduce decorative effects.

## Visual foundations

| Role | Token | Value |
| --- | --- | --- |
| Original institutional red | `--color-primary` | `#d71935` |
| Primary pressed | `--color-primary-deep` | `#8e1426` |
| Selected background | `--color-primary-soft` | `#fff0f2` |
| Geographic controls / CSKV marker | `--color-map` | `#24566a` |
| Body text | `--color-ink` | `#202b33` |
| Secondary text | `--color-muted` | `#596772` |
| Surface | `--color-surface` | `#ffffff` |
| Canvas | `--color-canvas` | `#f5f7f8` |
| Divider | `--color-line` | `#dce2e6` |
| SOS / serious warning | `--color-danger` | `#ba263b` |
| SOS pressed | `--color-danger-deep` | `#8e1c2e` |

- Keep Be Vietnam Pro for headings and Noto Sans for body; retain system fallbacks.
- Body and editable fields: 16px; labels/navigation: 13–14px; metadata: 12px.
  Compact counters and map attribution may use 11px, never critical instructions.
- Section headings: 18–20px; page headings: 22–24px. No landing-page hero typography.
- Weights: 400/500/600; 700 for limited emphasis. Body line-height 1.5.
- Spacing: 4/8/12/16/20/24px. Use 16px mobile gutters and 20px section padding.
- Buttons/inputs: 6px radius; overlay panels: 8px. Keep circles for actual circular controls.
- Prefer 1px dividers to shadows. A slight shadow is permitted where an overlay must
  remain distinct from map imagery; ordinary content does not need elevation.

## Composition

- Citizen map: map-dominant; Search, Location and SOS are the key actions.
  Secondary capabilities belong in the Tính năng menu or a disclosed panel.
- Restore the original red institutional header and active controls per the user's
  correction. Keep the existing official mark, compact layout and neutral content;
  do not reintroduce gradients, glass or heavy shadows.
- Officer queue: one numerical summary rail, readable list rows and divider-separated
  details. Do not wrap each metric, fact or subsection in another card.
- Keep authentic empty/loading/error/pilot states; never hide limitations for visual polish.
- Use Lucide outline icons consistently, generally in the text color. Spatial data
  categories and serious warnings may use meaningful colors, always accompanied by text.
- Preserve existing auth, permissions, API contracts, workflow transitions and SOS safeguards.

## Interaction and accessibility

- Target at least 44px for primary touch actions; preserve visible keyboard focus.
- Use text as well as color for status. Aim for 4.5:1 normal-text contrast.
- Inputs on compact screens remain at least 16px to avoid mobile auto zoom.
- Dialogs retain Escape, focus containment and focus return.
- Respect safe-area insets and reduced-motion preferences.
- No decorative pulse, glow, hover lift, glass blur or gradient.
- SOS hold progress and the tour scrim are functional feedback, not decoration.
- A restrained 150–180ms color/disclosure transition is sufficient; do not add an animation library.

## Review after each screen

If removing a shadow, gradient, card or icon does not reduce comprehension, remove it.
Test narrow phone, tablet, desktop and phone landscape with real-length Vietnamese text.
Check loading, empty, failure, selected and focused states, not only the default screen.

Implementation: shared tokens/base rules in `web/src/styles.css`; focused composition
refinements in `web/src/product.css`. Avoid duplicating literal colors in new components.
