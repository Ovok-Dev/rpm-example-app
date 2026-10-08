# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, selected by the user.

## Users

Clinicians reviewing CHF remote-monitoring data for patients in one clinic. Developers use the dashboard as an example alongside the Ovok Care mobile app and Ovok documentation.

## Product Purpose

Provide a clear browser workspace for reviewing ECG, weight, questionnaire responses, and Actimi Signals status from the companion patient app.

## Positioning

A single-clinic example of a clinician workspace built on Actimi's Ovok SDK and Signals. It demonstrates the companion workflow without organization management or multi-clinic administration.

## Operating Context

- Opens in a synthetic demo workspace. Clinicians sign in to connect to a sandbox project.
- The companion mobile app records ECG with Viatom BP2, weight with LeScale, and a daily questionnaire.
- Clinical data is read from Ovok; the browser app does not pair Bluetooth devices.
- Signals evaluates eligible patient data through Ovok. The clinician app reads Ovok's Signals results and settings.

## Capabilities and Constraints

- The initial workspace includes an overview, a patient directory and detail view, a Signals worklist, and Signals setup guidance.
- Support one clinic/project context only. Do not add Organizations, clinic switching, or organization administration.
- Signals project settings are read-only in this example. Explain how to configure them through the documented Ovok setup process.
- Keep synthetic demo records visibly distinct from sandbox patient records.
- Use `https://api.sandbox.ovok.com` and the confirmed example tenant code `public-example` for sandbox access.
- The exact LeScale model remains unconfirmed. Manufacturer IFUs and the current Ovok supported-device catalog are authoritative.
- Do not claim that Ovok or this example app is a certified medical device. Signals has its own documented intended purpose and status; the example's intended purpose must remain distinct.
- Prepare the Vite app for Vercel deployment.

## Brand Commitments

- This is an Ovok example app for Actimi's Ovok SDK and platform.
- Keep it visually connected to the Ovok Care mobile companion.
- Use Vitalwise as a workspace-flow reference only. Do not reuse its name, logo, or multi-organization model.
- Favor clear clinical terminology, a clean README, accessible interactions, and code that is easy for the team to maintain.

## Evidence on Hand

- Companion application and design reference: [`../mobile`](../mobile/).
- Vitalwise clinician dashboard used as a workflow reference; this app does not reuse its name, brand, or organization model.
- Current Ovok and Signals integration documentation: `https://docs.ovok.com/signals` and the installed `@ovok/core` package declarations.
- All initial dashboard patient and measurement data must be synthetic.

## Product Principles

- Put the clinician's next review task and patient context first.
- Keep one clinic context visible without introducing organization hierarchy.
- Show data provenance and distinguish synthetic examples from real sandbox records.
- Let Ovok and Signals remain the source of clinical records and alert decisions.
- Make setup status understandable without changing project-wide alert behavior.
