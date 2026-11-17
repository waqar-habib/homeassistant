# Naming

Follows Bootstrap 6: a base name, then sub-parts with a hyphen, then modifiers. No owner or household name in any element, class or option, so the library stays generic.

| Level | Pattern | Examples |
|---|---|---|
| Element (what goes in `type:`) | `custom:ui-<component>` | `ui-page`, `ui-section`, `ui-card`, `ui-accordion` |
| Sub-part (CSS class inside a component) | `<component>-<part>` | `section-header`, `section-body`, `drawer-header`, `drawer-done` |
| Modifier (CSS class) | `<component>-<modifier>` | `badge-on`, `badge-off`, `badge-error` |
| Variant (config option) | plain words | `variant: control`, `size: wide`, `collapsed_view: compact` |
| Token (CSS variable) | `--<group>-<name>` | `--t-title`, `--s-12`, `--z-touch`, `--r-card`, `--m-fast` |

Token groups: `--g-` colour, `--t-` type, `--ls-` letter spacing, `--s-` space, `--r-` radius, `--z-` size, `--m-` motion, `--k-` state factor.

## Old names

Dashboards built before library v1 use `custom:habib-*`. Those names stay registered with their old defaults, so nothing breaks. New dashboards use `ui-*` only.

| Old | Library | Difference |
|---|---|---|
| `habib-layout` | `ui-page` | none |
| `habib-light` | `ui-card` | default layout is the Large card (`layout: row`) |
| `habib-climate` | `ui-climate` | a tap opens the climate drawer (`controls: true`) |
| `habib-label` | `ui-heading` | none |
| `habib-hero`, `-prayer`, `-security`, `-media`, `-todo`, `-dock`, `-button` | `ui-hero`, `ui-prayer`, `ui-security`, `ui-media`, `ui-list`, `ui-dock`, `ui-button` | none |
| `habib-room` | `ui-section` with `collapsed_view: compact` | section starts open; room started folded |

The theme keys `habib-base` and `habib-scale` and the theme name "Habib Glass" keep their names for now: renaming them changes the live theme (planned with the cutover).
