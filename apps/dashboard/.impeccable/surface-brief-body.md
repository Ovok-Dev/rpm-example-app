## Scope and visitor mode

Single-clinic clinician dashboard for CHF remote patient monitoring. Opens in a synthetic demo workspace; sandbox mode starts after practitioner sign-in.

## Audience and job

Clinicians need to review one patient's latest ECG, weight, and questionnaire together, understand when each was recorded and where it came from, then move to history or another patient.

## Content and constraints

Use synthetic examples until sandbox sign-in. Keep one fixed clinic context, no organization tree or clinic switcher. Read patient observations, questionnaire responses, Signals alerts, and Signals settings through `@ovok/core`; the browser does not pair devices. Signals setup is read-only. Do not invent alert thresholds, clinical recommendations, or which readings Signals evaluates.

## Chosen composition

Patient Measurement Review, grounded candidate 5 of 7, chosen by the user (seed `1a6234e4`). Approved comp: `.impeccable/mocks/decision/measurements-first.webp`. Memorable moment: a single latest-check-in surface holds ECG, weight, and questionnaire as peers, each with timestamp and source, above recent activity.

## Unresolved decisions

Exact LeScale model varies; use the Ovok supported-device catalog and the IFU supplied with the actual device when validating a deployment. Real sandbox account credentials and tenant-specific AccessPolicy settings must be supplied by the operator.
