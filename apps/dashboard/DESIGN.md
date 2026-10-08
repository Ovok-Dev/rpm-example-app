---
name: Ovok CHF RPM Clinician Dashboard
description: A quiet, single-clinic workspace for reviewing remote patient measurements.
colors:
  primary: "#5C3F96"
  primary-deep: "#483077"
  navigation-selected: "#E9E3F2"
  workspace: "#F8F7FB"
  navigation: "#F3F0F9"
  surface: "#FFFFFF"
  ink: "#171426"
  muted: "#676274"
  quiet: "#6E697A"
  divider: "#EAE8EF"
  positive: "#376A58"
  warning: "#76501E"
  synthetic-surface: "#FAF4E9"
  danger: "#874744"
  focus: "#765D9D"
typography:
  display:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(26px, 2.4vw, 34px)"
    fontWeight: 670
    lineHeight: 1.15
    letterSpacing: "-1.2px"
  headline:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "20px"
    fontWeight: 670
    letterSpacing: "-0.5px"
  title:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 670
    letterSpacing: "-0.3px"
  compact:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "11px"
    fontWeight: 670
  caption:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "9px"
    fontWeight: 570
  micro:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "8px"
    fontWeight: 720
rounded:
  sm: "8px"
  md: "9px"
  card: "11px"
  lg: "12px"
  xl: "16px"
  pill: "99px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  measurement-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px 16px 12px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "#393547"
    typography: "{typography.compact}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "42px"
  source-chip:
    backgroundColor: "{colors.synthetic-surface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
---

# Design System: Ovok CHF RPM Clinician Dashboard

## Overview

**Creative North Star: "The Quiet Review Desk"**

The dashboard gives a clinician one calm place to read a patient's latest check-in. A cool lavender workspace, a single clinic context, and white reading surfaces keep patient context visually distinct from the three peer measurement areas. The page favors clear source and time labels over decorative framing.

Its visual voice is restrained and practical: Ovok purple marks actions and current navigation, while muted green, amber, and red communicate recorded, synthetic or caution, and error states. ECG, weight, and questionnaire marks use their own soft category tints; reading values stay near-black. The ECG trace and weight history are simple SVG data graphics, and the demo identifies synthetic records as examples. On narrow screens the clinic rail is hidden, its four destinations move to a fixed bottom bar, and the measurement cards stack in reading order.

**Key Characteristics:**

- Quiet lavender workspace with one purple action color and a soft selected-navigation tint.
- Patient context first; ECG, weight, and questionnaire remain equal peers.
- Fine dividers and soft corners define reading surfaces.
- Compact labels support scanning while values and headings stay prominent.

## Colors

The palette uses a deep Ovok purple against cool, lightly tinted neutrals; muted green, amber, and red distinguish recorded, synthetic or caution, and error states.

### Primary

- **Ovok Purple** (#5C3F96): Main action, selected navigation, and links.
- **Deep Ovok Purple** (#483077): Hover emphasis, without introducing another accent.
- **Selected Lavender** (#E9E3F2): The active desktop navigation background.

### Tertiary

- **Recorded Green** (#376A58): Recorded or connected status.
- **Warm Amber** (#76501E): Synthetic and caution labels.
- **Muted Red** (#874744): Recoverable request errors.
- **Focus Plum** (#765D9D): Visible keyboard focus.

### Neutral

- **Cool Workspace** (#F8F7FB): The page canvas.
- **Lavender Rail** (#F3F0F9): Persistent clinic navigation on wide screens.
- **Reading White** (#FFFFFF): Patient, measurement, directory, and dialog surfaces.
- **Near-Black Plum** (#171426): Main text and values.
- **Muted Plum** (#676274): Supporting text on light surfaces.
- **Quiet Plum** (#6E697A): Small clinic, navigation, and timestamp labels.
- **Fine Divider** (#EAE8EF): Borders between surfaces and rows.
- **Synthetic Sand** (#FAF4E9): Background behind the synthetic-data source chip.

### Named Rules

**The Purple Action Rule.** Use Ovok purple for the primary action and current navigation; keep measurement surfaces white.

## Typography

**Display Font:** Inter (with the system sans-serif stack)
**Body Font:** Inter (with the system sans-serif stack)
**Label/Mono Font:** No separate mono face; tabular numerals are used for measurement values and reading-card timestamps.

**Character:** A clean sans-serif hierarchy keeps patient names and measured values distinct without a separate display voice. Supporting copy remains compact and muted; headings use modest weight and close tracking.

### Hierarchy

- **Display** (670, clamp(26px, 2.4vw, 34px), 1.15): Page title.
- **Headline** (670, 20px): Sign-in dialog title.
- **Title** (650–670, 14–16px): Patient names and larger surface headings; compact measurement-card titles use 11px.
- **Body** (400, 10–12px, 1.5–1.7): Instructions, descriptions, and questionnaire answers.
- **Label** (400–750, 8–12px): Source, state, time, navigation, and control labels; micro labels use the smallest size.

**The Value Contrast Rule.** Use size, weight, and near-black color to separate measurement values from their supporting units and context.

## Layout

On wide screens the clinic rail is fixed at 248px and the reading area uses a centered content column with a 1390px maximum. Patient identity precedes a three-column measurement row, followed by recent activity. At 1160px the rail narrows to 220px and the measurement grid becomes two columns, with the questionnaire spanning both. At 780px the rail is hidden, a separate four-destination bottom bar appears, and measurement cards stack. At 470px the page gutters tighten while search and source labels remain readable.

The spacing rhythm uses 8–12px control gaps, 16px card padding, a 27px desktop gap between page groups (22px on narrow screens), and 44px desktop page gutters (13px below 470px). Keep labels close to their data and give page groups more room than the rows inside them.

## Elevation & Depth

Depth comes primarily from tonal layering, white surfaces, and thin dividers. Measurement cards use a barely visible ambient shadow; the sign-in dialog receives a broad shadow above its backdrop, while the fixed mobile navigation has a faint upward lift. The sticky top bar uses a translucent blurred surface as content moves beneath it. Focus is shown with a visible plum outline rather than elevation.

### Shadow Vocabulary

- **Surface lift** (`0 2px 6px #261a3803`): Barely visible separation on measurement cards.
- **Dialog lift** (`0 22px 90px #10091e40`): Clear separation for the modal sign-in task.
- **Mobile navigation lift** (`0 -4px 18px #21172a08`): A faint edge above the fixed bottom bar.

**The Flat Reading Rule.** Keep measurement surfaces quiet; use shadow only to distinguish a surface from what sits behind it.

## Shapes

Controls use gently rounded corners (8–9px), reading cards use soft 11–12px corners, and the sign-in dialog is more generously rounded (16px). Fine neutral borders define most surfaces; selected states use a lavender fill. Status chips are compact pills, while patient and measurement surfaces stay rectangular enough to support dense data.

## Components

### Buttons

Buttons are compact and direct, with a single filled action style.

- **Shape:** Gently rounded (9px).
- **Primary:** Ovok Purple with white text, 40px high and 16px horizontal padding.
- **Secondary:** White surface with a fine lavender border and deep-purple text.
- **Hover / Focus:** Darker purple on hover; keyboard users receive a 3px focus outline with a 2px offset.

### Chips

- **Style:** Small neutral pills with readable semantic text; synthetic provenance uses a warm amber tint.
- **State:** Current environment and data provenance remain visible without relying on color alone.

### Cards / Containers

- **Corner Style:** Soft 11–12px corners.
- **Background:** White on the cool workspace.
- **Shadow Strategy:** Fine divider first, very light ambient shadow second.
- **Border:** One-pixel neutral divider.
- **Internal Padding:** 13–23px depending on surface and viewport.

### Inputs / Fields

- **Style:** White background, fine neutral stroke, and 8–9px corners.
- **Focus:** Purple border and an outer visible focus ring.
- **Error / Disabled:** Error copy and border use muted red; busy controls disable and identify their current action.

### Navigation

The wide-screen clinic rail uses a pale lavender field and a softly filled selected row. At phone width, the rail is hidden and its four destinations are presented in a separate fixed bottom bar with icon and text. Active state uses purple and a tint, while keyboard focus remains independently visible.

### Measurement Surfaces

ECG, weight, and questionnaire cards keep the same visual rank. Each carries its own recorded state, source, and timestamp. Waveforms and weight history are semantic SVG graphics, and synthetic values are visibly identified as examples.

## Do's and Don'ts

- Do keep reading values in near-black and their units, sources, and timestamps visually secondary on the same white card.
- Do use the soft selected tint with purple for the current navigation item.
- Don't use color alone to communicate a reading or connection state.
