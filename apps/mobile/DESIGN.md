---
name: Ovok Care
description: A native daily care journal in Ovok purple.
colors:
  background: "#F8F7FA"
  surface: "#FFFFFF"
  ink: "#24202D"
  muted: "#6B6476"
  line: "#E8E3EC"
  tint: "#694D98"
  wash: "#F0EBF7"
  hero: "#4B356D"
  on-hero: "#FFFFFF"
  hero-muted: "#DDD1ED"
  danger: "#AB3030"
  background-dark: "#17141D"
  surface-dark: "#24202D"
  ink-dark: "#F5F1FA"
  muted-dark: "#B4ABBE"
  line-dark: "#393140"
  tint-dark: "#C8A9F5"
  wash-dark: "#33283F"
  danger-dark: "#FFA7A7"
typography:
  screen-title:
    fontFamily: system-ui
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "41px"
    letterSpacing: "-0.8px"
  section-title:
    fontFamily: system-ui
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "-0.4px"
  body:
    fontFamily: system-ui
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "24px"
  action:
    fontFamily: system-ui
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "24px"
  detail:
    fontFamily: system-ui
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "24px"
  tab-label:
    fontFamily: system-ui
    fontSize: "12px"
    fontWeight: 500
rounded:
  field: "10px"
  control: "12px"
  surface: "16px"
  badge: "20px"
spacing:
  compact: "8px"
  control-gap: "12px"
  row-gap: "14px"
  control: "16px"
  card: "22px"
  page: "24px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.background}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "13px 18px"
  button-secondary:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.tint}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "13px 18px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "15px"
  filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.field}"
    padding: "0 16px"
  filter-selected:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.background}"
    rounded: "{rounded.field}"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "{spacing.card}"
  row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "16px 0"
  navigation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tint}"
    typography: "{typography.tab-label}"
  next-task-panel:
    backgroundColor: "{colors.hero}"
    textColor: "{colors.on-hero}"
    rounded: "{rounded.surface}"
    padding: "{spacing.page}"
---

# Design System: Ovok Care

## Overview

**Creative North Star: "Daily care journal"**

A quiet native iPhone journal makes three daily check-ins easy to find and revisit. Ovok purple identifies actions and the daily-care panel; system typography, SF Symbols, and plain status language carry the rest of the interface.

The system is spacious without hiding useful detail. Measurements sit in ruled lists, instructions in tonal containers, and focused work in native sheets. Demonstration data is visibly labeled wherever it could be confused with a patient reading.

**Key Characteristics:**

- Native system text and SF Symbols.
- Violet emphasis with separate light and dark palettes.
- Flat surfaces, generous gutters, and thin list dividers.
- Finite daily progress and explicit recording, save, and sync states.

Ground truth: `src/theme.tsx`, `src/ui.tsx`, `App.tsx`, and the four screen components. Frontmatter uses portable CSS units; its numbers correspond to React Native logical points, not physical pixels. Browser snippets in `.impeccable/design.json` are documentation translations: their hover/focus feedback and inline SVG icon stand-ins do not describe native app behavior.

## Colors

The palette moves from pale lavender paper to deep violet ink, with brighter action tint in dark appearance.

### Primary

- **Ovok violet — `tint` / `tint-dark`:** Primary buttons, active tabs, task symbols, trace strokes, and selected filters.
- **Deep care violet — `hero`:** The daily-care panel stays the same color in both appearances. `on-hero` and `hero-muted` supply its primary and secondary text.
- **Lavender wash — `wash` / `wash-dark`:** Secondary buttons, notices, selected questionnaire answers, and the Support introduction.

### Neutral

- **Journal paper — `background` / `background-dark`:** The scrolling screen and sheet ground. Also the foreground of primary buttons and selected filters.
- **Inset surface — `surface` / `surface-dark`:** Cards, fields, grouped appearance settings, and the tab bar.
- **Reading ink — `ink` / `ink-dark`:** Primary copy; **quiet ink — `muted` / `muted-dark`:** Descriptions, timestamps, and inactive tabs.
- **Fine rule — `line` / `line-dark`:** List dividers, chart guides, and the tab bar boundary.
- **Attention red — `danger` / `danger-dark`:** Failed sign-in text, pending-sync labels, and destructive Settings rows. It is not a measurement threshold.

**The Paired Appearance Rule.** Resolve theme colors together; keep the care panel's shared foreground and background combination intact.

## Typography

**Display and body font:** The native system font. No custom font family is applied by the app; `system-ui` represents that choice in the portable tokens.

Screen titles are bold, section titles semibold, and body copy regular. Smaller descriptions retain the shared body's line height unless a screen explicitly overrides it. Measurement values and countdowns use tabular numerals.

### Hierarchy

- **Screen title:** `screen-title`, used for Home, Diary, Support, and Settings.
- **Section title:** `section-title`, used above recurring list groups.
- **Body:** `body`, the shared `Copy` default; secondary copy changes color rather than family.
- **Action:** `action`, centered button labels.
- **Detail:** `detail`, common row descriptions.
- **Tab label:** `tab-label`, paired with a system symbol.

Text scales with the device's font setting. The small Ovok wordmark alone opts out of font scaling. Sheet titles and large measurement values are screen-specific compositions, not additional shared type roles.

## Layout

Screens use a single scrolling column with safe-area inset at the top and page gutters. The brand and Demo/Patient account badge precede the title. Section spacing separates groups; small gaps bind labels, values, and status text. Cards commonly use card padding; the daily-care panel uses page padding.

The four-tab bar remains below content. Diary filters scroll horizontally. Sheets scroll vertically, and sign-in uses keyboard avoidance. There are no authored responsive breakpoints or tablet grid. Shared buttons have a minimum height of 52 points, filters and the sheet close target 44 points, and shared rows 76 points. These are minimums, not fixed text containers.

## Elevation & Depth

There are no authored shadows. Depth comes from the contrast between the page ground, inset surfaces, lavender wash, and deep care panel. Thin dividers organize lists; native page sheets and alerts provide platform presentation.

**The Flat Surface Rule.** Preserve tonal grouping and thin rules instead of adding decorative drop shadows.

## Shapes

Soft rectangles dominate: `surface` corners for cards and the daily-care panel, `control` corners for buttons, notices, and questionnaire choices, and `field` corners for sign-in fields, filters, and the next-task button. The account-mode badge uses `badge` corners. Task-symbol tiles are slightly smaller rounded squares. Lists remain open rows rather than stacked cards.

## Components

### Buttons

Primary buttons use tint with background-colored text; secondary buttons use wash with tint text. Both share action typography, control corners, and a minimum height that can grow with text. Native press feedback reduces opacity to 0.8; disabled or busy state reduces it to 0.5. Busy state replaces the label with an activity indicator and disables interaction.

### Inputs / Fields

Sign-in fields use surface fill, ink text, field corners, and a minimum height of 54 points. Visible labels accompany email, password, and verification-code fields; keyboards and autofill follow each field's purpose. Errors appear as attention-red text. The source adds no custom focus border or glow.

### Chips

Diary filters use field corners and semibold small labels. Unselected filters use surface/muted; selected filters use tint/background. Their 44-point minimum height and horizontal scrolling preserve a usable target without truncating the filter list.

### Cards / Containers

Surface cards contain instructions, the weight trend, and account context. The Support introduction uses wash. Notices use control corners and keep Retry save or Retry sync next to the status they address. Questionnaire choices use surface when unselected and wash plus a selected radio symbol when chosen.

### Rows

Shared rows pair an SF Symbol with a flexible text column and a trailing chevron only when actionable. A hairline divider provides structure; native press feedback reduces opacity to 0.6. Home task rows add a wash-filled symbol tile and replace the chevron with a checkmark when recorded today. Diary rows include the actual value, time, and Demo/Needs sync/Saved label.

### Navigation and sheets

Home, Diary, Support, and Settings use a bottom tab navigator with tint for the active item and muted for inactive items. Icons are native SF Symbols, decorative to accessibility when accompanying text. Measurement, entry detail, and sign-in use `pageSheet` presentation with the native slide transition. Leave-confirmation alerts protect an unfinished check-in.

### Next-task panel

The deep violet panel names the first unfinished task, shows three progress segments, and opens that task directly. Recording each kind advances the next action. When all three kinds are recorded today, the panel reads **Done for today** and removes its action. Completion and cloud sync are distinct states: the result view says whether a reading was saved to the demo diary, saved on this phone awaiting sync, or saved to the patient account.

### Data traces

ECG uses a thin, unfilled violet line; it is explicitly not a clinical interpretation. The demo recording rotates waveform samples every 80 milliseconds and stops movement when Reduce Motion is enabled. Weight history uses a ruled line chart with visible kilogram context and an accessible reading-and-scale description. Preview traces and example records must remain labeled synthetic.

## Do's and Don'ts

### Do:

- **Do** use the paired theme palette and the shared `Copy`, `Button`, `Row`, and `Screen` components.
- **Do** let text scale and content scroll; preserve minimum touch targets.
- **Do** name the next task and make the all-complete state finite.
- **Do** keep synthetic data labels and actual save/sync status visible beside readings.
- **Do** use SF Symbols, thin dividers, and tonal containers for native consistency.

### Don't:

- **Don't** introduce custom display fonts, decorative shadows, or dashboard tiles into this journal.
- **Don't** imply a pending or failed save has reached the patient account.
- **Don't** turn waveform, weight, or attention colors into invented clinical judgments.
- **Don't** treat browser preview interactions as native application behavior.
