# PayPlace Build 35 candidate

Four original illustrated Home buttons open Until next payday, Undo & payment history,
Your first win with Annie, and Quiet Mode. Each scene is an original generated raster
illustration based on the locked mascot and branding references; each feature uses its
own asset. Images are contained in a 3:2 frame so the composition is not cropped.

## Behavior

- Payday snapshot: current entered balance minus unpaid bills through payday (including
  overdue and undated bills), active debt minimums, payday-specific grocery/gas plans,
  and protected buffer. Expected future paycheck is excluded. Negative remainder is
  shown as a shortfall. Missing/past payday blocks the estimate; missing grocery/gas
  inputs and unknown bill dates are flagged. Balance source/update time is explicit.
- History: paid/unpaid and amount changes create dated before/after records. Only the
  latest unchanged record for a bill can be undone. Undo appends an audit entry and
  never changes a bank balance. Correcting a paid amount adjusts Annie's recap.
  History begins with this update; existing paid flags and personal data remain.
- First win: Annie guides next payday, current balance, one bill and its due date, then
  opens the snapshot. New installations start with an empty personal plan. Existing
  entries survive. A clearly labeled sample neighborhood can be explored before
  account setup or from First win; samples do not replace, persist into, or restore
  over the personal plan. Returning from samples resumes account setup if unfinished.
- Quiet Mode: persisted local HH:MM for enabled reminders; Annie check-in pause;
  neighborhood/celebration motion reduction (also respects device Reduce Motion);
  currency text masking and protected monetary entry fields. Time choice never enables
  notification consent. Bill/subscription consent remains independent from check-ins.

Manual mode records actions made elsewhere. This candidate does not activate bank
transfers, bill payment, credit reports, automatic round-ups or payment processing.

## Validation

`npm run check` passes (65 source files); `npm test` passes all 96 tests; Expo iOS/Android/web exports compile. New regressions cover
calculation scope and cents, history/correction/undo and balance preservation, reminder
hour/minute propagation, sample separation, privacy display, and saved preference/history
reopening. Device notification delivery still requires iPhone/Android checks. A browser pixel preview could not run because the Chromium binary download was unavailable; native screenshots and actual device layout checks remain.

## Device checks

1. Open each original illustrated button at small screen size and larger text settings.
2. Enter a balance with cents, payday, bills before/after payday, an overdue bill and
   an undated bill. Save grocery/gas estimates, compare the breakdown and timestamp.
3. Record a payment in Bills, correct its amount in History, undo the latest change,
   reopen the app and verify audit entries, bill state and unchanged bank balance.
4. Complete Annie's first win with a new profile. Explore sample mode, change samples,
   exit and verify personal entries remain. Try sample mode before profile verification.
5. Hide amounts; visit all tabs and modal screens, including money entry fields.
   Toggle the setting off and confirm the actual data has not changed.
6. Set 02:45 local delivery time, enable desired reminders through existing consent
   controls, pause/resume Annie check-ins, and inspect delivery on an actual device.
7. Reduce motion and check the neighborhood and extra-paycheck celebration.

## Release

Baseline: `2dc77b7651e648208eb9454b986f16380dd30697` (Build 34 submission).
Next candidate: 35. The existing `release-ios-expo.yml` workflow uses:
`validate_only=false`, `signing_only=true`, `build_number=35`.

This source package is not a signed IPA or confirmed TestFlight build. GitHub write
access is required to publish the changes and dispatch the existing workflow. Confirm
successful Apple upload and processing before announcing tester availability.
