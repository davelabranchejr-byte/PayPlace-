# PayPlace Build 76 candidate

Prepared November 19, 2026 from `review/app-wide-artwork-layout` at
`43338c0f0857c4b5030978a8388e22474d238bef`, which includes the November 18 image
layout corrections and subsequent Em's Pet Spa fixes. Build 75's release branch
and App Store submission remain separate.

## At a Glance

A new button near the top of Budget opens a compact, read-only overview. It
shows the entered bank balance, Safe to Spend, the complete bills/minimums/buffer
breakdown, next paycheck and date, every unpaid bill with its date, each debt
with its minimum, each savings goal with progress, and the current month's
recorded spending by category. The details are already open; there are no
financial disclosure cards to tap. PayPlace's existing logo, colors, mascot
artwork and four illustrated navigation destinations are retained.

The screen uses the exact existing Budget calculation. This calculation
reserves **all unpaid bills**, not only bills before payday; the labels say so.
Purchases never reduce the balance again. Spending honors remembered category
rules, per-purchase overrides, splits and refunds, excludes future-dated records,
and uses integer cents. Dates and days remaining are refreshed on resume and
once a minute. Missing/stale payday and unknown balance freshness are explicit.
Opening the overview neither writes nor duplicates finance records. Privacy
mode and app lock use the existing protections.

The compact layout is intended to fit a normal amount of detail on one phone
screen. Every record is retained: unusually long lists, long names and larger
accessibility text can scroll rather than shrinking text or hiding entries.
The artwork-corrected main screens retain their normal layout. Only the
At a Glance footer uses a compact illustration treatment.

## Included image fixes

This candidate inherits the complete review branch: proportional contained
artwork, captions below scenes, removal of decorative white highlights on
illustrated controls, four footer destinations fitting the screen, Westley/Tate
shortcuts restored side by side, compact My Finances summary, and the two Pet
Spa painting scenes including the corrected pink sign and scene-position reset.
Original illustrations and the approved logo are retained. See
`ARTWORK_LAYOUT_REVIEW_2026_11_18.md` for the full audit and its remaining native
verification limits. PayPlacePerView's separate draft is not part of this change.

## Validation

- Application binding/source check: 154 source files passed.
- Automated suite: 216 tests; 215 passed on the initial full run, and the new
  app-navigation test passed after correcting its test setup to open the map
  menu before Budget. No application failure was found in that test rerun.
- Web export passed.
- iOS JavaScript/Hermes export passed; this is not a signed Xcode archive.
- Native and actual viewport validation remain pending. Local Chromium could
  not start because the execution environment denied its process socket;
  no screenshots or no-scroll guarantee are claimed from that attempt.

Before distribution, inspect this screen with a populated plan on a native
phone, including long names, more records, larger text, privacy mode, navigation
and app-lock resume. The prior review's panorama hit-testing and missing
standalone Art Studio route are still separate unresolved items.
