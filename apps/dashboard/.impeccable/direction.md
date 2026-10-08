# Approved dashboard direction

The user chose **Patient Measurement Review** from the three visualized clinic workflows. The screen centers one patient's latest check-in and keeps ECG, weight, and questionnaire details together. The approved composition is [.impeccable/mocks/decision/measurements-first.webp](./mocks/decision/measurements-first.webp); its prompt sidecar has `approved: true`.

The composition uses Ovok's lavender canvas and purple identity: sampled flat fields are `#F8F7FB` (workspace), `#F3F0F9` (navigation rail), and `#FEFEFE` (reading surfaces). The sampled purple accent is `#5C3F96`; the rendered type is near-black (`#000014`). Surfaces use soft 10–12 px corners, fine neutral dividers, a clean system sans, and restrained elevation. The illustration-like ECG trace and weight trend are exact, semantic SVG graphics with synthetic values, not raster images.

Keep the clinic context static and singular even where the comp renders a selector. Use an example patient ID rather than an MRN. Every record is visibly marked as demo data; sandbox records appear only after practitioner sign-in. The first viewport presents patient identity, latest check-in time, and three peer measurement regions before the chronological activity list.
