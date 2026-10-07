# PayPlace Build 21

This update continues from Build 20 (`c6eae76`).

- Debt strategy buttons now appear as Snowball / Mixed / Avalanche. Mixed includes the approved Bobbie snowplow scene and explains all three methods. Choosing Mixed saves one smallest-balance target for a quick win, then follows the highest APR once that target reaches zero. Paid debts no longer become recommended targets.
- Extra Paycheck keeps the calendar and saved Bills / Debt / Buffer / Joy plans. The first future extra check detected in a viewed month opens “EXTRA PAYCHECK MONTH!” with original Chapo artwork, falling treats he eats, and a direct planning action. The acknowledgment persists once per month, with an optional replay. Reduced-motion settings stop the animated overlay while preserving the artwork and controls.
- Westley’s existing clickable family-wall story includes the original January 8, 2023 rescue post, the approved frightened/trusting Em illustrations, six-homes opening, and Dave’s exact welcome-home ending. Story images open at their original proportions and return to the story.

Validation: 54 tests passed; all app/component JSX parsed; Metro exported both iOS and web successfully; git diff whitespace check passed.

Tester checks:
1. Choose Mixed, close/reopen the app, and confirm the selected method and quick-win target remain. Pay that debt to zero and confirm the recommendation changes to the highest remaining APR.
2. Open Extra Paycheck on a month with a third biweekly/fifth weekly check or a bonus. Confirm Chapo eats falling treats. Tap “Give this check a plan,” change cents in an allocation, save, close/reopen, and confirm the plan remains without an automatic repeated celebration.
3. Use “Celebrate with Chapo” to replay; confirm the dismissal returns to the same month. With Reduce Motion enabled, controls and the still artwork remain usable.
4. Tap Westley on Annie’s family wall. Read the rescue/Em story, enlarge each story image, return, and check the ending. Confirm the existing Em paw-print wall and quilt still open correctly.

The existing `.eas/workflows/release-ios.yml` production workflow builds the signed App Store release and submits it to Apple. Apple processing/TestFlight availability must be verified separately from a successful build/submission.
