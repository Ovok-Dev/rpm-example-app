# EHR operations overview

Mode: Operate. Audience: care coordinators and clinicians in one clinic. The user starts with the clinic's operational state and follows an unfinished patient's registration or RPM enrollment to the next valid action.

## Approved composition

**Enrollment workbench**, approved from the surface composition round. Approved comp: `../mocks/decision/enrollment-workbench.png`. The comp's `.json` sidecar marks the user's selection. Do not regenerate it or rearrange its major regions. It controls structure; FHIR truth, product boundaries, and the established Ovok style control the implementation details.

### Direction contract

**THESIS** — Every unfinished RPM enrollment is visible as a patient journey.

**OWN-WORLD** — Inherit the Ovok clinician dashboard: cool lavender workspace, quiet white clinical surfaces, purple navigation/actions, deep ink, clear source/time, and restrained elevation.

**STORY** — Read the counts, scan the intake/care-team/CHF/device stages, select a patient, inspect the selected stage's evidence and the workflow's real next action, complete only supported actions, then open the longitudinal chart.

**FIRST VIEWPORT** — Keep persistent one-clinic navigation; a quiet breadcrumb and workspace status; “Clinic operations” heading and register action; compact operational counts; patient enrollment lanes; and a details rail for the selected patient. Stage selection is a keyboard-operable disclosure. It changes the focused evidence and offers a return to the current supported step without simulating a write.

**FORM** — The original grounded-structure selection in `../surface-notes.md` records 7 (daily clinic rounds sheet), 5 (enrollment workbench), and 1 (patient review register). The user-approved 5/Enrollment workbench composition is recorded in `../mocks/decision/enrollment-workbench.png.json`. Post-build reproducibility key: `b56a4b9c` (`scope=surface`, `mode=operate`, `grain=flow`, `platform=web`); this later roll does not override the approved comp. Preserve its compact count band, aligned stage lanes, and details rail while allowing responsive reflow and larger accessible workflow type.

**CROSS-SURFACE REACH** — Preserve the canonical Patient ID in demo and sandbox modes. Dashboard links contain only an opaque Patient ID, and the destination re-authenticates and checks access. Patient linking in sandbox is invitation-mediated.

**HONEST RISK** — Operational counts and enrollment progress are synthetic in demo. In sandbox, totals may be partial and every failed request stays visible. Physical kit shipping/return logistics are not a verified Ovok capability.

## Comp inventory and sampled colors

| Comp ingredient | Implementation medium | Fidelity and behavior |
| --- | --- | --- |
| Clinic navigation rail and icon controls | Semantic HTML + Lucide | One purple-selected item, no organization switcher. |
| Header and register patient action | Semantic HTML + Lucide | Keep breadcrumb, synthetic/sandbox status, and functional action. |
| Operational count strip | Semantic HTML | Derive from loaded fixture or fully paginated authorized resources; label incomplete totals. |
| Enrollment stage rail | Semantic HTML + CSS | Keep five explicit stages and state labels; preserve order on narrow widths. |
| Patient enrollment lanes | Semantic list/table + CSS | Show synthetic name/ID in demo; in sandbox preserve Patient reference and actual owner data only. |
| Patient details rail | Semantic HTML | Progressive detail disclosure with real next action; stacked inline on narrow layouts. |
| Status marks, avatars, and device glyphs | Lucide + CSS | Small factual cues only; no invented device photo or shipping status in sandbox. |
| Ground, surface, nav, selected state, action, ink, divider | CSS tokens | Sampled in image pixels: `#F7F7FC`, `#FCFCFE`, `#F1EDF8`, `#EAE4F3`, `#5D429B`, `#17152D`, `#EAE8EF`. Use higher-contrast muted/status tokens where needed for accessibility. |

The generated comp contains illustrative data, workflow labels, and occasional unsupported details. Replace those with the shared synthetic fixtures or actual SDK/FHIR responses; preserve no accidental clinical claims, fabricated analytics, or shipping state. Use the current dashboard's exact copy and Ovok logos where they are more accurate than text the image model approximated.
