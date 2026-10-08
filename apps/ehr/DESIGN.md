---
name: Ovok EHR Operations Workbench
description: A single-clinic workspace for patient intake, care-team assignment, and CHF RPM enrollment.
source: Inherits the Ovok clinician dashboard design system and the approved EHR composition in `.impeccable/surfaces/operations.md`.
colors:
  workspace: "#F7F7FC"
  navigation: "#F1EDF8"
  surface: "#FCFCFE"
  primary: "#5D429B"
  selected: "#EAE4F3"
  ink: "#17152D"
  muted: "#676274"
  divider: "#EAE8EF"
  success: "#376A58"
  warning: "#76501E"
  danger: "#874744"
typography:
  family: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  display: "30px / 1.15 / 670"
  heading: "20px / 1.3 / 670"
  title: "16px / 1.4 / 670"
  body: "13px / 1.55 / 400"
  compact: "12px / 1.45 / 400"
  label: "11px / 1.4 / 670"
rounded:
  control: "9px"
  panel: "12px"
  pill: "99px"
---

# Ovok EHR operations workbench

## Product surface

Care coordinators move from clinic operations into patient intake, assignment, and CHF RPM activation. The approved composition is the **Enrollment workbench**: the page opens with a narrow strip of operational counts, then a patient enrollment journey organized around the steps from intake to active monitoring. A focused details rail exposes the next meaningful action for the selected patient.

## Visual system

The app inherits the existing dashboard's quiet purple clinical workspace. The screen uses one lavender navigation rail, a cool workspace, white reading surfaces, deep ink, visible purple action, crisp dividers, and the existing sans-serif voice. The staged process rail is EHR-specific structure; it does not introduce new colors or decorative motifs. Synthetic status uses words as well as semantic tint. Color is never the only status cue.

## Component rules

- Keep the single-clinic navigation persistent on wide screens; collapse it into an accessible menu at narrow widths.
- Enrollment stages remain aligned with patient rows so status and ownership can be scanned horizontally. On narrow screens, each patient retains the same order as a stacked sequence.
- Use 12px panels and 9px controls, one-pixel dividers, no decorative shadow, and no repeated equal-size dashboard cards.
- The right details rail may become an inline disclosure on narrow screens; it must never hide a patient's current stage or next action.
- Keep demo mode visible. Keep sandbox and permission errors explicit.
- Preserve FHIR source, author, timestamps, and opaque resource IDs in records and navigation where available.

## Accessibility

Use semantic tables or lists, labeled controls, keyboard-operable steps, visible focus, non-color status names, sufficient contrast, and reduced motion. Enrollment state changes communicate completion without relying on animation.
