# Contributing

Start with [README.md](README.md) to run the demo and set up an Ovok sandbox account. Read [PRODUCT.md](PRODUCT.md) for the intended workflow and [DESIGN.md](DESIGN.md) before changing the interface. Coding assistants must also read [AGENTS.md](AGENTS.md); Claude's entry point is [CLAUDE.md](CLAUDE.md).

## Local development

Use Node.js 24+, Xcode with an iPhone simulator, and CocoaPods. From the monorepo root, install the locked dependencies with `npm ci`, then run `npm run ios`. This app needs a native Expo development build; Expo Go does not include its native modules.

`npm run mobile` from the monorepo root starts Metro for an already installed development app. Rebuild when adding or changing native dependencies or native configuration. Keep environment changes in `apps/mobile/.env` and restart Metro after editing it.

The default API is `https://api.sandbox.ovok.com`; the example tenant is `public-example`. Use a tenant from the same sandbox environment. The runtime fallback, `.env.example`, README, and agent instructions must agree when configuration changes.

## Branches and reviews

`dev` is the default branch and the base for ordinary contributions. `main` holds reviewed stable updates. Create a focused feature branch from `dev`; coding agents use the `codex/` prefix unless the user requests another name. Submit changes to `dev` for review, then promote approved stable updates to `main` through a separate pull request.

Both `dev` and `main` require a pull request, one approving review, resolved review conversations, and a passing **Check** job on an up-to-date branch. New commits dismiss stale approvals. Branch protections apply to repository administrators and block force pushes and deletion. Keep history linear by using squash or rebase merges. Organization rules also apply; do not disable them to get a change through.

Run the checks below before requesting review. Keep a pull request description focused on the concrete change, validation, and remaining acceptance gaps. The workflow has read-only repository access. Approved publication of the initial source does not authorize a production deployment or patient-data upload.

## Account and project prerequisites

Create an Ovok developer account and obtain sandbox project access by following [Ovok](https://ovok.com), [Get Started](https://docs.ovok.com/#get-started), and the current [Console](https://ovok.com/console) route. The README notes the redirect observed when this example was prepared. Ask Ovok for the current access route if needed.

Project administration and the app's Patient login are separate workflows. Use an authorized sandbox Patient account to test the mobile app. Follow [project setup](https://docs.ovok.com/authentication/project-setup) for login, registration, and default-policy prerequisites; check [Access policies](https://docs.ovok.com/access-policies) for each resource operation. The example does not provision accounts, tenants, policies, or features.

Read the current documentation before changing an integration:

- [Authentication](https://docs.ovok.com/authentication) for tenant login, PKCE, MFA, and roles.
- [Settings and features](https://docs.ovok.com/settings-and-features) for project prerequisites, including [transaction bundles](https://docs.ovok.com/settings-and-features/features/transaction-bundles).
- [Native SDK](https://docs.ovok.com/native-sdk) and [device catalog](https://docs.ovok.com/native-sdk/guide/supported-devices) for device integration and IFUs.
- [FHIR R4](https://docs.ovok.com/api/fhir/r4) for resource structure and supported operations.

Check the shipped SDK types and implementation for the pinned version. Record any discrepancy between the current docs and the installed package instead of guessing. Never put credentials or real patient information in examples, issue reports, screenshots, or test fixtures.

## Make a focused change

Read the affected code and its callers before editing. Use the file map in README to keep UI, validation, persistence, device lifecycle, and server integration in their existing modules. Keep configuration near the integration boundary rather than spreading literals through screens.

Follow the clean-code rules in AGENTS.md: descriptive names, small functions, explicit dependencies, simple data structures, consistent conventions, and minimal comments. Fix the root cause and include affected documentation. Avoid new infrastructure or dependencies unless the requested behavior needs them.

Keep local saves before uploads. Preserve the separate demo/patient histories, secure storage, failed-save retention, and retry controls. Do not reset a patient's data to simplify a migration or test. Use only synthetic fixtures in the demo and automated simulator flow.

For UI work, reuse the theme and controls, then check both phone sizes, larger text, light/dark appearance, scroll access, and readable error states. Keep Home, Diary, Support, and Settings as the four navigation tabs.

## Checks

Run the repository's existing checks:

```sh
npm run check
```

New nontrivial behavior needs a small repeatable test. Keep tests independent and use one focused assertion per test. Cover meaningful failures, especially validation, data isolation, and reading recovery. Documentation and a simple configuration URL edit do not require a new test.

For a change affecting screens or patient journeys, run the native iPhone app and the demo smoke flow:

```sh
npm run ios
maestro test apps/mobile/tests/simulator.yaml
```

The Maestro flow resets **demo history** before completing ECG, weight, and questionnaire tasks. Use a synthetic demo workspace, not a patient account. Review [docs/verification.md](docs/verification.md) for the checks already performed and the remaining acceptance gaps. CI checks both apps, including type checking, unit tests, Expo dependency compatibility, the dashboard build, and the mobile iOS JavaScript bundle; it does not test physical devices or your sandbox project.

## Integration acceptance

On an authorized sandbox account, verify patient sign-in, MFA if enrolled, account switching/sign-out, resource permissions, and questionnaire server saves. Confirm that failed uploads stay pending and retries do not duplicate the logical record. Also test denied access and a disconnected network.

On a physical phone, validate BP2 and the exact LeScale model using their supplied IFUs: Bluetooth permission, explicit pairing, reconnects, reading values and units, timestamps, local-save failures, and server saves. A simulator cannot verify any BLE peripheral. Record the model and firmware tested; the selected F4 declaration is not proof that every LeScale variant is compatible.

Clinical questionnaire wording, medical-device suitability, response procedures, retention, and production operation need the responsible team's acceptance. This example does not provide background monitoring or emergency response.

## Document and deliver

Update README setup and any affected contributor/agent instructions. Keep official documentation links with an explanation of when to use them. Update the verification record with the actual checks performed and unresolved limits; do not convert an untested integration into a claimed pass.

Describe a change in terms of the problem and resulting behavior, with its checks and remaining risks. Keep changes local until the repository owner requests remote delivery. Do not push, publish, stage, or commit as part of an ordinary editing task.

This is Ovok's example app for the Actimi Ovok SDK. Contributions to original app source use **Apache-2.0**; see [LICENSE](LICENSE). Preserve [DEPENDENCY_NOTICES.md](DEPENDENCY_NOTICES.md). The native SDK retains its separate Actimi license terms; the app's license does not change them or grant downstream SDK rights. Review the dependency findings in the verification record before any production use.
