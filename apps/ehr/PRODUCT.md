# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, selected by the user.

## Users

Care coordinators and clinicians working in one clinic. Developers use the app as an Ovok EHR integration example.

## Product Purpose

Demonstrate the operational path from patient intake through care-team assignment and CHF RPM enrollment, with a patient chart that can be opened alongside the existing patient app and RPM dashboard.

## Positioning

An Ovok EHR reference app that uses Ovok as its only clinical data platform and connects the RPM examples through canonical FHIR Patient identities.

## Operating Context

- Opens in an explicitly synthetic demo workspace. Clinician authentication is used only when connecting to a real Ovok sandbox project.
- The lead view is an operations overview. The core workflow is patient registration, intake, practitioner assignment, RPM enrollment, and device provisioning.
- The companion patient app records a CHF questionnaire, ECG using the Viatom BP2, and weight using the supported LeScale family. The exact scale model remains unconfirmed.
- The clinician dashboard remains an independent app for reviewing measurements and Signals.
- Sandbox patient invitations are administrator-mediated. Patient account creation, sharing, and project access follow Ovok's current invitation and AccessPolicy behavior.

## Capabilities and Constraints

- One clinic/project only; do not add organizations or clinic switching.
- Clinical records in sandbox mode are read and written through supported Ovok SDK/FHIR interactions. Never fall back to synthetic records after an API failure.
- Demo mode uses synthetic fixtures and local-only state. It must visibly label synthetic people and must never send them to Ovok.
- Patient assignment in the UI does not grant backend access; Ovok AccessPolicies remain authoritative for every request.
- Signals results are read-only and retain their source and status. Do not infer a diagnosis, risk score, or treatment recommendation.
- Human messages use FHIR Communication only where the active project's policy allows it. WebSocket updates require Ovok's subscription feature and a live SDK connection. AI chat is not human-to-human messaging.
- Physical inventory logistics do not have a verified Ovok resource contract. Sandbox device assignment is represented only with verified FHIR Device and DeviceUseStatement resources; shipping and return states remain demo-only unless an Ovok-supported contract is confirmed.
- The patient app never creates a password for a patient, impersonates a patient, or exposes clinician-only operations.
- Do not claim that this example is certified medical software. Signals has a separate intended purpose and regulatory status.

## Brand Commitments

- Ovok is an Actimi product; this is an Ovok SDK example.
- Reuse the clinician dashboard's quiet purple workspace and the companion app's terminology without copying Medplum branding or application code.
- Medplum Provider is an information-architecture reference only. Medplum Server is not part of this system.

## Evidence on Hand

- Existing patient app: [`../mobile`](../mobile/).
- Existing clinician dashboard: [`../dashboard`](../dashboard/).
- Ovok SDK packages and official docs, plus the public sandbox FHIR capability statement. See [`../../docs/capability-matrix.md`](../../docs/capability-matrix.md).
- Demo content is synthetic. No real patient records or verified sandbox credentials are available in this workspace.

## Product Principles

- Keep the patient identity consistent across the EHR, mobile app, and dashboard.
- Make setup prerequisites and incomplete workflows visible.
- Keep demo and sandbox behavior separate and unmistakable.
- Preserve clinical provenance and defer authorization to Ovok.
- Favor a complete, honest workflow over a simulated claim of backend support.
