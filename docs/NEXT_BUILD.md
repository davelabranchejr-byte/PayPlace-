# PayPlace next-build candidate — October 7, 2026

Prepared from `davelabranchejr-byte/PayPlace-` main at `a59568b` (the approved
Build 16 family-wall baseline). This is a source release candidate, not a signed
IPA or a confirmed TestFlight upload. The marketing version remains 1.0.0;
EAS production uses remote versioning and increments the native build number.

## Changes

- Aunt Judy's cents-entry fix: bank balance, next paycheck, daily allowance,
  and emergency buffer retain decimal points and trailing zeros while typing,
  accept two decimal places, and format to two places on blur. The existing
  encrypted numeric storage and Safe to Spend calculations retain cents.
- Interrupted onboarding saves answers and the exact stage/question in the
  encrypted vault. Normal relaunch retains completed, verified profiles.
- Back navigation works from the first question, later questions, quilt,
  and email stage. Changing an email invalidates prior verification flags.
- When local saving fails after successful email verification, Save and enter
  retries the verified result without reusing the one-use code.
- Portable backups retain the existing security policy: verification and letter
  consent are excluded. Restored users resume at email instead of repeating
  the complete questionnaire. A backup never bypasses verification.
- The obsolete leaf-brushing branch and its unused styles are removed. Annie's
  red door and clickable family stories remain in place.
- Shared branding uses the current teal wordmark and exact tagline. Onboarding
  controls have minimum touch sizes and wrapping for small screens.

No mascot artwork, identity, family-wall assets, security modules, reminder
modules, Extra Paycheck modules, or Smart Mirror modules are replaced.
No SMS delivery, bank linking, payment initiation, or subscription billing is
activated by this candidate. Further scene/artwork improvements remain separate
from these tester fixes.

## Automated validation

`npm test` runs all 45 tests, including real form-component regressions for
cents entry, encrypted save/reopen, external balance updates, exact onboarding
resume, Back navigation, verification gating, and code/save retry. Existing
calculation, vault, backup, recovery, reminder, and Smart Mirror tests also run.

`npx expo export --platform all --output-dir dist-next-build-final` compiles web,
iOS, and Android bundles. These exports do not prove that a signed native build
or native device behavior passes. Native app lock and device keyboards still
require testing in the new binary.

## Device checks before broad release

1. On iPhone and Android, enter `123.45`, `0.05`, and `123.10` in Budget. Confirm
   the decimal keyboard, leave/reopen Budget, relaunch the app, and check cents
   in the balance and Safe to Spend.
2. Interrupt onboarding at a question, quilt, and email. Relaunch and confirm
   the answers and position; check Back navigation with the keyboard open on a
   small screen and with larger accessibility text.
3. Finish verification; relaunch several times and confirm the neighborhood
   opens after the device lock without repeated email verification.
4. Restore a portable encrypted backup; confirm answers survive, email must be
   verified again, reminders remain disabled until consent, and invalid/wrong
   password files leave the saved plan unchanged.
5. Enter Annie's red door, open all six family stories, then check Smart Mirror,
   Extra Paycheck allocations, reminders, undo, and app lock in the new binary.

## Publish and build

The source is being published through the existing authenticated GitHub browser
session because the connector does not have write permission. The existing Expo
browser session can run the generic `.eas/workflows/release-ios.yml` workflow
from the completed source branch or its merge commit.

This workflow builds fresh source and submits that new build's ID. Do not use
`submit-ios.yml` for this candidate: it points to the existing Build 16 ID.
Confirm the new build number and Apple's processing status in TestFlight before
telling testers it is available. Do not describe it as an App Store launch.

Workflow command reference: https://docs.expo.dev/eas/cli/
