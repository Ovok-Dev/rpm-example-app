# Connected EHR and RPM workflow

This document defines the intended vertical slice for the EHR example. Its implementation must preserve the difference between locally synthetic behavior and records that were actually accepted by an Ovok project.

## Synthetic demonstration

The demo starts without an Ovok account and is clearly marked synthetic. The EHR can register a fictional patient, complete a sample CHF intake, assign fictional care-team members, activate a sample monitoring plan, and associate the Viatom BP2 and LeScale-family examples. These actions modify demo state only.

The EHR development server exposes a local, in-memory synthetic relay. The mobile demo posts its synthetic diary readings for the fixed, preloaded example Patient `demo-2048`; the EHR and dashboard poll the relay every five seconds. The relay accepts only the mobile-demo source and allowlisted synthetic IDs, resets when the server restarts, is absent from production, and is never used in sandbox mode. The mobile diary saves its local copy even when the relay is offline. This is polling across local demo servers, not Ovok realtime or a clinical backend. Patients newly registered in EHR demo state do not yet become selectable identities in the mobile demo; use the preloaded Patient to demonstrate shared measurements.

## Ovok sandbox

1. A clinician signs in with their own practitioner account and current project AccessPolicy.
2. The clinician searches for an existing authorized Patient. If no Patient is available, the clinician uses Ovok's patient-invitation flow; an invitation is pending until the patient accepts. Do not assume a generic invitation response means that an email was delivered or that the patient was linked.
3. The EHR can search authorized Patients. Its current registration path creates a FHIR Patient and then separately requests an invitation; these writes are not atomic. The invitation does not confirm delivery, acceptance, or that the patient account is linked. After an authorized Patient appears in the clinician's search, the chart can read the supported records described in the capability matrix.
4. The clinician assigns an existing Practitioner using CareTeam or other supported FHIR references. This is workflow data only; it does not expand server authorization.
5. The EHR records CHF monitoring intent using CarePlan and Goal only where the project policy accepts those resources. Device assignment uses Device and DeviceUseStatement only where supported and authorized. Unsupported stock, shipping, delivery, return, and replacement details remain absent from sandbox mode.
6. The patient signs into the mobile app using their own account. Its Patient access policy supplies the current patient identity; app navigation never chooses or impersonates another Patient.
7. The mobile app saves actual measurements through `@ovok/core`. The dashboard and EHR independently read the same authorized Patient and preserve the returned source and timestamp.
8. The dashboard and EHR read Signals results through the supported SDK. Both views are read-only and remain subject to the logged-in user's permissions.
9. Human messaging is not implemented in these example UIs. FHIR Communication resources and criteria subscriptions are platform capabilities, not a verified human-chat contract. Do not call any update realtime unless a future implementation verifies policy, connection state, and end-to-end delivery.

## Cross-application links

Use an opaque `Patient.id` in an allowlisted same-product route or a configured EHR/dashboard URL. Do not include patient names, email addresses, other clinical details, invitation codes, or access tokens. Each application authenticates independently and rechecks backend access for the target Patient; route selection does not grant access.

## Safe failures

- A denied read or write remains an explicit permission error; it never loads a demo patient as a substitute.
- A failed save remains retryable where the SDK operation is idempotent or a stable resource identity is available. Do not retry a create blindly when it could duplicate a clinical record.
- A patient invite remains pending until a supported read confirms the Patient is available to the clinician.
- Unsupported kit logistics and messaging receipts are not simulated in sandbox mode.
- Operational counts in sandbox are limited to accessible records and clearly labeled as the current page or server-reported total; they are not clinic-wide analytics.
