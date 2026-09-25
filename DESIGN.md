---
name: Venture & Brand Intelligence System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4c'
  on-tertiary-container: '#7df1bd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  metric-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  metric-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style
The design system delivers an analytical, high-density, and uncompromisingly precise interface crafted for venture analysts, market strategists, and executive operators. It merges the focused craft and micro-interactions of Linear with the institutional trust of Stripe and the data rigor of enterprise business intelligence.

The visual tone is defined by sharp utility: crisp single-pixel structural boundaries, tabular clarity, high-signal information architecture, and zero superficial ornament. Color carries diagnostic meaning, typographic scale establishes immediate hierarchy, and spatial rhythm enforces rapid scannability under high information load.

## Colors
The palette balances a low-strain, cool-tinted canvas with surgical diagnostic accents:

- **Canvas & Surfaces:**
  - App Canvas: `#F8F9FB` (cool zinc tint)
  - Card & Container Surface: `#FFFFFF`
  - Elevated Popovers / Flyouts: `#FFFFFF`
- **Borders & Separators:**
  - Subtle Border: `#E5E7EB` (structural bounds, static tables, panels)
  - Interactive / Hover Border: `#D1D5DB`
  - Active / Focus Border: `#4F46E5`
- **Typography:**
  - Primary Text: `#0F172A` (deep slate/navy for maximum contrast and readability)
  - Secondary Text: `#475569` (supporting context, metadata, labels)
  - Muted Text: `#94A3B8` (placeholders, inactive icons, axis rules)
- **Brand & Analysis Triad:**
  - Primary (Insight/Observation): `#4F46E5` ("What the data says")
  - Accent Violet (Strategic Implication): `#7C3AED` ("Why it matters")
  - Action Emerald (Execution/Prescription): `#059669` ("What to do next")
- **Status & Risk:**
  - Critical / Negative: `#DC2626`
  - Risk / Caution: `#D97706`
  - Neutral Delta / Flat: `#64748B`

## Typography
Typographic discipline underpins rapid data comprehension:

- Display and head titles use tight negative tracking (`-0.02em` to `-0.03em`) to anchor dashboards and detail views with weight and authority.
- All metrics, financial indicators, valuations, and delta comparisons enforce OpenType tabular figures (`font-variant-numeric: tabular-nums`) or `JetBrains Mono` for vertical alignment across grids and columns.
- Labels, status tags, and metadata use medium-to-semibold weights with slight positive tracking to preserve legibility at micro scales (11px–12px).

## Layout & Spacing
The layout follows a fluid-responsive multi-column shell configured for high-density analytic tooling:

- **Desktop (>= 1280px):** 12-column grid, `gutter-lg` (24px), dynamic margins bounded within a maximum content container of 1600px, or full-width for multi-pane data consoles.
- **Tablet (768px - 1279px):** 8-column layout, `gutter` (16px), 24px canvas margins. Secondary sidebars collapse into slide-over panels.
- **Mobile (< 768px):** 4-column layout, `gutter` (16px), 16px outer margin. Metric tiles reflow into a 2-column or stacked 1-column progression.

A strict 4px base baseline spacing unit governs internal card padding and element alignments (`space-sm` = 8px, `space-md` = 12px, `space-lg` = 16px, `space-xl` = 24px).

## Elevation & Depth
Depth is produced through low-contrast physical outlines and microscopic, tinted drops:

- **Layer 0 (App Canvas):** Flat `#F8F9FB`.
- **Layer 1 (Cards, Metric Containers, Panels):** Background `#FFFFFF`, border `1px solid #E5E7EB`, shadow `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Layer 1 Interactive Hover:** Border shifts to `#D1D5DB`, shadow expands to `0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Layer 2 (Dropdowns, Command Menus, Flyouts):** Background `#FFFFFF`, border `1px solid #E5E7EB`, shadow `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Layer 3 (Modals, Overlays):** Background `#FFFFFF`, border `1px solid #E5E7EB`, shadow `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes
A roundedness factor of 2 provides structural balance between technological precision and modern ergonomics:

- Base radius (`rounded`): `8px` (`0.5rem`) for buttons, text inputs, segmented pills, and small elements.
- Container radius (`rounded-lg`): `12px` (`0.75rem`) for internal widgets, metric modules, and sub-panels.
- Master Card radius (`rounded-xl`): `14px`–`16px` for primary dashboard cards, overview panels, and modal shells.
- Linear-Style Pill Badges: fully rounded (`9999px`) with fixed vertical bounds to frame inline status indicators.

## Components

### Buttons
- **Primary:** Solid `#4F46E5`, white text, 1px subtle top highlight `inset 0 1px 0 rgba(255, 255, 255, 0.2)`, hover `#4338CA`.
- **Secondary / Outline:** Background `#FFFFFF`, 1px border `#E5E7EB`, text `#0F172A`, hover background `#F8F9FB`, hover border `#D1D5DB`.
- **Ghost:** Transparent background, text `#475569`, hover text `#0F172A`, hover background `rgba(15, 23, 42, 0.04)`.
- **Sizing:** Compact (28px height, 12px font), Standard (36px height, 13px font).

### Badges & Status Chips (Linear-Style)
- Ultra-compact height (20px to 22px), `9999px` radius, 1px perimeter border.
- **Neutral:** Background `#F1F5F9`, border `#E2E8F0`, text `#475569`.
- **Data Indicator:** `#EEF2FF` background, `#C7D2FE` border, `#4F46E5` text.
- **Risk / Warning:** `#FFFBEB` background, `#FDE68A` border, `#B45309` text.
- **Positive / Trend:** `#ECFDF5` background, `#A7F3D0` border, `#047857` text.

### Insight Callout Triad
Structured insight blocks render an unyielding 3-part diagnosis:
1. **"What the data says" (Observation):** Left accent border (3px) or micro-badge in `#4F46E5`, background `rgba(79, 70, 229, 0.03)`.
2. **"Why it matters" (Implication):** Left accent border (3px) or micro-badge in `#7C3AED`, background `rgba(124, 58, 237, 0.03)`.
3. **"What to do next" (Prescription):** Left accent border (3px) or micro-badge in `#059669`, background `rgba(5, 150, 105, 0.03)`.

### Metric Cards
- White surface, 14px border radius, 1px `#E5E7EB` border.
- Top row: Secondary label (`label-sm`) + contextual badge / icon.
- Middle row: Primary numeric value in `metric-xl` (tabular nums) paired inline with delta pill (+14.2% in Emerald `#059669` / -4.1% in Rose `#DC2626`).
- Bottom row: Inline SVG sparkline (24px–32px height) rendered with subtle gradient stroke and neutral baseline guide.

### Segmented Controls & Tabs
- Container with `#F1F5F9` background, 2px padding, 8px radius.
- Inactive segment: Text `#475569`, hover `#0F172A`.
- Active segment: `#FFFFFF` background, `#0F172A` text, 1px border `rgba(15, 23, 42, 0.06)`, shadow `0 1px 2px rgba(0, 0, 0, 0.05)`.

### Form Fields & Inputs
- Background `#FFFFFF`, 1px border `#E5E7EB`, 8px radius, text `#0F172A`.
- Focus state: Border `#4F46E5`, ring `0 0 0 3px rgba(79, 70, 229, 0.12)`.
- Mono-styled quick-filter search with trailing keyboard command shortcut (`⌘K`) badge in `#94A3B8`.