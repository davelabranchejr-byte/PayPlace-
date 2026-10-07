# PayPlace Build 19 — Em’s memory wall and beta usability

Source baseline: Build 18 merge `423506b47fc1a5ac947a13aef10fcd8aa69d8c71`.
The marketing version stays 1.0.0. Production EAS remote versioning assigns
the next native build number; confirm it in Expo before announcing availability.

## Changes

- Annie’s existing family gallery now includes Dave’s approved combined
  tree-bark paw-print picture with Em and the four mascots. The exact approved
  image includes Westley’s pointed Westie ears. It replaces the isolated photo
  box and displays uncropped at its original 1186:1326 ratio.
- Tap that picture to open the complete image in a larger, scrollable viewer.
  Close or system Back returns to the same wall. There is no extra tab.
- All six family stories and the Belonging Quilt stay in place.
- Extra Paycheck gets its own keyboard avoidance and 48-point Close target.
  Calendar and Smart Mirror monetary fields retain cents while editing and
  format valid amounts to two places on blur. Existing calculation, allocation,
  recording, and undo rules stay in force.
- Smart Mirror has a 48-point Close target and drag-to-dismiss keyboard.
- Calm Garden’s day/night image explicitly fits its native container. Its 80
  distinct character/advice scenes and Annie’s combined-category scenes remain.
- Home has beta testing tips and access to the existing public GitHub feedback
  route. A draft includes only version, release, platform, and blank prompts;
  opening it never submits feedback or includes budget/profile data.
- Westley’s character lock now explicitly includes pointed Westie ears.
- Support guidance reflects current email verification, direct red-door entry,
  encrypted backup, and feedback behavior.

## Existing work carried forward

Build 18 already includes gallery sizing, the quilt/acorn artwork, cents entry
in Budget, onboarding progress/resume/Back, verification retry, completed local
profile gating, security, encrypted backups, reminders, recovery/undo, Extra
Paycheck calendar/bonus/allocation plans, Smart Mirror, and distinct garden art.
Portable backups still require re-verification under the existing security policy.

## Validation and release

Validation: all 49 regression tests pass, `git diff --check` passes, and Expo
exports compile successfully for web, iOS, and Android.
Component regressions cover gallery sizing/taps, quilt navigation, the memory
viewer’s open/Close/system-Back behavior and original aspect ratio, and cents
typing/blur behavior in the calendar and mirror.

Upload this source, then run `.eas/workflows/release-ios.yml` from its exact
commit. This builds fresh source and submits that build’s ID to Apple.
Do not run the fixed-ID `submit-ios.yml` workflow for this release.

Test the new binary on a small iPhone with larger text: all six story taps,
Em’s full picture/Close, quilt/Back, monetary keyboard entry, calendar allocation,
Smart Mirror, repeated relaunch, reminders, app lock and undo.
Do not announce TestFlight availability before Apple processing is confirmed.
