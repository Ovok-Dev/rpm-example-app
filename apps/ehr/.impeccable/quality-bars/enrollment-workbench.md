# Quality bar: Enrollment workbench

Audience: clinicians and care coordinators working in one clinic.

- **Native devices:** a compact operational count band, fixed-width stage rail, patient-aligned workflow lanes, and a contextual details rail. Keep these as one purposeful work surface rather than a grid of equal cards.
- **Hierarchy:** patient identity, current enrollment stage, owner, and next action should be understood at a glance. Stage names and actions remain readable at both desktop and mobile sizes.
- **Typography:** use the Ovok dashboard's sans-serif voice and clear title, section, body, and metadata roles. Dense operational labels must remain large enough to read without zooming.
- **Material:** cool lavender canvas, white clinical surfaces, quiet dividers, purple actions, restrained soft depth, and Lucide outline icons. No imitation physical props or decorative gradients.
- **Interaction:** selecting a patient stage updates focused evidence and the current next action; every action remains keyboard-operable with a visible focus state. Do not make a disclosure look like a persisted workflow update.
- **Responsive behavior:** preserve patient name, owner, next action, five stage labels, and chart access at 390px. Reflow the workbench instead of shrinking labels or removing controls.
- **Truth:** clearly identify synthetic records and local-only workflow changes. Show sandbox source and permission failures without demo substitution.
- **Motion:** use short state transitions only; respect reduced-motion preferences.
