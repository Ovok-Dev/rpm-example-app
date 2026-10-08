# FHIR resource mapping

The EHR uses the Ovok FHIR R4 endpoint and `@ovok/core`. The resource table below describes the intended meaning of each record; it does not guarantee project-specific write permission. See the [capability matrix](capability-matrix.md) for observed SDK support and limitations.

| Workflow record | FHIR R4 resource | Mapping boundary |
| --- | --- | --- |
| Canonical patient | Patient | Implemented: sandbox email preflight search, Patient create, then separate invitation request. The non-atomic invitation does not establish acceptance or patient-account linkage. Demo registration is session-only. |
| Emergency contact | RelatedPerson | Not implemented: emergency contacts are not currently collected or persisted. |
| Medical history | Condition | Not implemented: no condition form or persistence. Never derive Condition from measurements. |
| Allergy list | AllergyIntolerance | Not implemented: no allergy form or persistence. |
| Current medication list | MedicationStatement | Not implemented: no medication form or persistence. |
| Intake consent | Consent | Implemented read-only in the chart. Registration does not collect a signature or create Consent. |
| Questionnaire definition and answers | Questionnaire, QuestionnaireResponse | Implemented as a patient-scoped QuestionnaireResponse read in the chart. Questionnaire authoring, intake questionnaire creation, and assignment are not implemented. |
| Care-team assignment | CareTeam and Practitioner/PractitionerRole references | Implemented for an accessible Patient and Practitioner; create/update CareTeam only. Reassignment history is not persisted, and this does not override AccessPolicy. |
| Work item | Task | Not implemented. The local demo workbench stage is browser state, not a FHIR Task. |
| RPM plan | CarePlan, Goal | Implemented CHF CarePlan create. Goal creation and patient goals are not implemented. |
| Monitoring kit devices | Device, DeviceUseStatement | Implemented DeviceUseStatement creation only for an accessible FHIR Device. Physical kit grouping, inventory, model validation, and logistics remain synthetic. |
| Encounter and appointment | Encounter, Appointment | Not implemented in the EHR. Demo appointment/task counts are synthetic only. |
| Reading | Observation | Implemented patient-scoped Observation read. Mobile `saveMeasurement` remains the supported write path; provenance is shown only when returned. |
| Care-team message | Communication | Not implemented in these app UIs. No dedicated human-chat contract, recipient policy verification, or receipts are claimed. |
| Audit context | Provenance, AuditEvent | Read when available; do not claim that client-created fields are server audit evidence. |

## Resource references

Every sandbox patient-owned record references the canonical `Patient/{id}` rather than copying identity data. Patient IDs from cross-app URLs are validated before use; CareTeam, CarePlan, and DeviceUseStatement references are built from records returned by Ovok. Preserve the actual FHIR resource ID and version/source metadata where returned. Communication mapping above describes a future supported use; there is no Communication UI or mutation in this example.

## Search and pagination

Use documented FHIR search parameters and SDK pagination. Do not assume that a first search bundle is the full clinic. Operations totals must use a complete accessible page traversal or be labeled as partial. Duplicate preflight searches reduce accidental repeats but are not atomic uniqueness constraints.
