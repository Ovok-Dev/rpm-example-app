# Verification

Verified on 8 October 2026. This is a documentation example with a working simulator experience; physical-device and patient-account acceptance remain separate steps.

## Passed

| Check                         | Result                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| iOS native development build  | Built and installed successfully with Expo SDK 57 / React Native 0.86                       |
| iPhone 17 Pro, iOS 26.5       | Complete demo ECG, weight, questionnaire, all four tabs, and history after reopening        |
| iPhone 16e, iOS 18.6          | App launch, Home and Diary layout, and ECG instructions checked at 390-point width          |
| TypeScript                    | Strict type check passes                                                                    |
| Model and recovery checks     | Thirteen repeatable Node tests pass                                                         |
| Expo dependency compatibility | `npx expo install --check` passes                                                           |
| Source configuration          | Public tenant configuration only; no embedded client secret                                 |
| Sandbox configuration         | Runtime fallback and `.env.example` use `https://api.sandbox.ovok.com` and `public-example` |
| Licensing                     | App source declares Apache-2.0; full license and separate Actimi SDK notice included        |
| IFU links                     | Both SDK catalog links returned PDFs                                                        |

Reproduce the routine with a booted iPhone simulator and the development app running:

```sh
npm run ios
maestro test tests/simulator.yaml
```

The automated flow resets synthetic history, completes all three tasks, checks Diary and Support, then reopens the app and checks daily completion. It takes about a minute, including the 30-second ECG demonstration. The Node checks cover record parsing, corrupted input, local date boundaries, required answers, demo history, and device-reading recovery after local storage failures. They do not substitute for clinical or hardware acceptance.

## Sandbox onboarding documentation

The README explains developer account creation, sandbox project setup, separate Patient accounts, public configuration, and the official documentation to check. [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md), and [CONTRIBUTING.md](../CONTRIBUTING.md) carry the same environment and integration boundaries.

Official documentation pages and the sandbox `/healthcheck` responded successfully when checked on 8 October 2026. The documented `https://ovok.com/console` account entry point redirected to `https://actimi.com/platform`; the README directs readers to Ovok for current access if that happens. Endpoint reachability does not verify tenant configuration, credentials, permissions, or server saves. No account or remote project setting was created or changed.

## Simulator captures

All screenshots use synthetic data. Phone layouts support scrolling when text grows; only iPhone is declared as a supported iOS device class.

[Home](screenshots/home.png) · [Diary](screenshots/diary.png) · [Support](screenshots/support.png) · [Settings](screenshots/settings.png) · [ECG recording](screenshots/ecg-recording.png) · [Questionnaire](screenshots/questionnaire.png) · [Dark appearance, scrolled check-in panel](screenshots/home-dark.png)

Native captures include the iPhone 17 Pro at standard text size and Accessibility Large. The latter was checked both at the screen top and at the lower measurement rows. The UI uses native page sheets and scrolling rather than shrinking essential text.

## Finish review

The independent finish reviewer scored the three requested corrections **resolved** and returned **ship** for that fix batch: retain and retry readings after local save failure, derive device result status from persisted records, and name the next task on Home. Device recovery was checked through source and four isolated tests; the simulator checks the demo flow.

Final Home captures cover both iPhone sizes, dark appearance and Accessibility Large. The review retained previously valid captures of unchanged demo screens where the capture tool could not reliably reproduce their scroll position. This is a documentation-example review, not physical-device or patient-account acceptance.

## Not verified

- Patient sign-in, MFA, tenant access policies, and server saves: no patient credentials were supplied.
- Bluetooth pairing, reconnection, readings, and device clocks: no physical BP2 or LeScale was available. The iOS simulator cannot test BLE peripherals.
- The exact LeScale model: this build selects the SDK's Viatom F4 declaration. Confirm the label and supplied IFU.
- Android: a run command is provided, but this release was built and exercised on iOS.
- VoiceOver with a patient, clinical usability, retention, and managed-device operation require deployment acceptance.

## Dependency audit

`npm audit` reports **29 transitive alerts (22 high, 7 moderate)** in the current lockfile. Four advisory roots are reported: a nested Medplum version bundled by the native SDK, and the braces, node-forge, and uuid dependency trees. The application authenticates through `@ovok/core`, rather than the old nested Medplum authentication implementation, but this does not clear the dependency finding.

Compatible audit fixes were applied. The remaining automatic force fix proposes incompatible Expo / React Native downgrades and was not applied. Resolve or formally assess the remaining advisories with the SDK and framework maintainers before a production deployment. Re-run `npm audit` when updating the lockfile.

## Distribution

This Ovok-Dev repository contains Ovok's example app for the Actimi Ovok SDK. It distributes the original app source under Apache-2.0, but does not distribute a prebuilt binary or proprietary SDK source. The project owner confirmed SDK permission for this example; downstream SDK use remains subject to Actimi's applicable terms. See [DEPENDENCY_NOTICES.md](../DEPENDENCY_NOTICES.md).
