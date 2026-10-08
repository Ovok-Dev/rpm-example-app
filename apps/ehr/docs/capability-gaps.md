# Verified capabilities and gaps

The EHR is a runnable reference example. SDK support does not grant permission in an Ovok project; each sandbox request remains subject to the signed-in user's AccessPolicy. Read the [official Ovok documentation](https://docs.ovok.com/llms.txt) and the [full connected examples capability matrix](https://github.com/Ovok-Dev/rpm-example-app/blob/dev/docs/capability-matrix.md) before adapting it.

## Implemented through `@ovok/core`

- Practitioner sign-in, including the SDK's MFA response, and paginated Patient search.
- Patient duplicate preflight by accessible email, FHIR Patient create, followed by a separate `invitePatient` request. This is not atomic; invite acceptance and delivery are not confirmed.
- Patient chart reads for accessible Observations, QuestionnaireResponses, CareTeams, CarePlans, DeviceUseStatements, and Consent status.
- CareTeam create/update with available Practitioner references, CHF CarePlan create, and DeviceUseStatement create for an accessible FHIR Device.
- Read-only Signals settings and open-alert retrieval.
- Opaque Patient-ID navigation to the separately authenticated RPM dashboard.

## Synthetic or local only

- Intake completion, enrollment stage, staff assignment history, appointments, operational totals, and BP2 + LeScale-family kit inventory are session fixtures. They do not create FHIR records.
- The development relay holds only synthetic readings in process memory. The mobile demo posts; EHR and dashboard poll it every five seconds. It has no database, is absent from production, and is never used for sandbox fallback.

## Not implemented or not verified

- Clinical conditions, allergies, medication statements, emergency contacts, a validated questionnaire definition, full intake answers, or signed/persisted consent.
- FHIR Goal, ServiceRequest, Task, Encounter, Appointment, or communication workflows.
- Real human chat, typing/read/delivery indicators, message notifications, or WebSocket subscription UI.
- Physical kit inventory, kit grouping, compatibility validation, shipping, delivery, return, or replacement. Confirm the exact LeScale model and IFU in the [Native SDK device catalog](https://docs.ovok.com/native-sdk/guide/supported-devices).
- Atomic patient deduplication, patient invitation acceptance, or a server-side link between a newly created Patient and an accepted patient account.
- Clinic-wide analytics beyond the actual records visible to the current account.

The EHR never impersonates a patient or changes server authorization. A route or CareTeam assignment is not an access grant. Sandbox errors remain visible and never switch to synthetic records.
