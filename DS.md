# Design System - PDV Electron App
> Based on Material Design 3 (Material You) Guidelines

## 1. Color System
Derived from **Purple Content Seed** (ref: uploaded image).
The application uses a **Dark Theme** by default.

### Key Colors
| Role | Token | Hex (Dark) | Usage |
|------|-------|------------|-------|
| **Primary** | `--md-primary` | `#D0BCFF` | Main actions, active states, key components |
| On Primary | `--md-on-primary` | `#381E72` | Text on primary backgrounds |
| Primary Container | `--md-primary-container` | `#4F378B` | Lower emphasis primary containers |
| On Pri. Container | `--md-on-primary-container` | `#EADDFF` | Text on primary containers |
| **Secondary** | `--md-secondary` | `#CCC2DC` | Less prominent actions, chips, tonal buttons |
| On Secondary | `--md-on-secondary` | `#332D41` | Text on secondary backgrounds |
| Secondary Container | `--md-secondary-container` | `#4A4458` | Secondary containers |
| On Sec. Container | `--md-on-secondary-container` | `#E8DEF8` | Text on secondary containers |
| **Tertiary** | `--md-tertiary` | `#EFB8C8` | Accents, contrasting elements |
| On Tertiary | `--md-on-tertiary` | `#492532` | Text on tertiary backgrounds |
| Tertiary Container | `--md-tertiary-container` | `#633B48` | Tertiary containers |
| On Ter. Container | `--md-on-tertiary-container` | `#FFD8E4` | Text on tertiary containers |
| **Error** | `--md-error` | `#F2B8B5` | Error states, critical alerts |
| On Error | `--md-on-error` | `#601410` | Text on error backgrounds |

### Surfaces (Neutral)
| Role | Token | Hex (Dark) | Usage |
|------|-------|------------|-------|
| **Surface** | `--md-surface` | `#141218` | Base background of the app |
| Surface Dim | `--md-surface-dim` | `#141218` | Dimmed background |
| Surface Bright | `--md-surface-bright` | `#3B383E` | Brighter surface (rare) |
| Container Lowest | `--md-surface-container-lowest` | `#0F0D13` | Lowest importance containers |
| Container Low | `--md-surface-container-low` | `#1D1B20` | Low importance, cards |
| Container | `--md-surface-container` | `#211F26` | Default containers, dialogs |
| Container High | `--md-surface-container-high` | `#2B2930` | Higher elevation, modals |
| Container Highest | `--md-surface-container-highest` | `#36343B` | Highest elevation, inputs |

### Outlines
| Role | Token | Hex (Dark) | Usage |
|------|-------|------------|-------|
| Outline | `--md-outline` | `#938F99` | Borders, dividers, icons |
| Outline Variant | `--md-outline-variant` | `#49454F` | Subtle borders, dividers |

---

## 2. Typography
**Font Family**: `Roboto`, `Roboto Flex`, system-ui.

| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| **Display Large** | 57px | 400 | 64px | -0.25px |
| **Display Medium** | 45px | 400 | 52px | 0px |
| **Headline Large** | 32px | 400 | 40px | 0px |
| **Headline Medium** | 28px | 400 | 36px | 0px |
| **Title Large** | 22px | 400 | 28px | 0px |
| **Title Medium** | 16px | 500 | 24px | 0.15px |
| **Body Large** | 16px | 400 | 24px | 0.5px |
| **Body Medium** | 14px | 400 | 20px | 0.25px |
| **Label Large** | 14px | 500 | 20px | 0.1px |
| **Label Small** | 11px | 500 | 16px | 0.5px |

---

## 3. Shapes (Corner Radius)
| Token | Value | Usage |
|-------|-------|-------|
| `--shape-corner-none` | 0px | Full screen elements |
| `--shape-corner-extra-small` | 4px | Progress bars, small inputs |
| `--shape-corner-small` | 8px | Chips, simple cards |
| `--shape-corner-medium` | 12px | Standard cards, dialogs |
| `--shape-corner-large` | 16px | Large cards, floating sheets |
| `--shape-corner-extra-large` | 28px | Large dialogs, menus |
| `--shape-corner-full` | 9999px | Buttons, badges, FABs |

---

## 4. Components Implementation
### Buttons
*   **Filled**: Primary action. Uses `md-primary` bg and `md-on-primary` text.
*   **Tonal**: Secondary action. Uses `md-secondary-container` bg.
*   **Outlined**: Low emphasis. Uses `md-outline` border.
*   **Text**: Lowest emphasis. Transparent bg.

### Cards
*   **Elevated**: Standard container for content. Uses `md-surface-container-low`.
*   **Outlined**: Content with border boundary.
*   **Filled**: Higher emphasis content. Uses `md-surface-container-highest`.

### Navigation & Actions
*   **FAB**: Floating Action Button for primary screen action. Square-ish with rounded corners (large/medium).
*   **Chips**: Filter and selection elements. Pill shaped.
