# PayPlace — categories, shared banking demo and Facebook move-in

This source update extends Build 53 at commit
`70a6c645ba618c9c3a0da376573550e032c7f69a`, the head of
`fix/consistent-payplace-logo`. It is not based on the older main branch.

## Included

- Illustrated Shopping, Clothing and Groceries category controls, with Bobbie
  juggling designer bags, Bobbie in a dressing room buried in clothes, and adult
  Daddy carrying pet food, treats, litter and groceries. The user can remember a
  merchant choice for one account or all accounts, change just one purchase,
  update older purchases, split exact cents, edit/forget rules and undo changes.
  Personal choices wait for encrypted saving before confirmation and are included
  in encrypted backup/restore. See `MERCHANT_CATEGORIES.md`.
- The full Bobbie banking demo uses one transaction dataset for purchase lists,
  remembered categories, spending insights, new purchase batches, round-ups,
  payday income, savings contributions, savings transfers and emergency spending.
  The feed begins with four months of recurring charges and Costco/Target
  purchases. Demo changes stay out of the personal plan. Existing simple Premium
  previews remain available outside the full demo.
- Subscription Detective automatically looks for recurring patterns in the
  available transaction history, displays the supporting charge count, account,
  observed latest price, price changes and an estimated next-charge date. At
  least three settled regular charges are needed. Ordinary shopping/grocery
  patterns, pending charges, refunds, transfers and irregular dates do not become
  subscription clues. Users review and edit a suggested case before saving it;
  they can dismiss and restore clues. Accepted clues do not create duplicate
  cases or another budget deduction. Detected subscriptions are possibilities,
  not claims that the app has read a service contract or cancelled anything.
- A bright illustrated Facebook move-in card appears on Home and Neighborhood.
  It opens exactly the owner's supplied URL:
  `https://www.facebook.com/share/1FRdYmPwum/?mibextid=wwXIfr`.
  The approved moving-day scene has Daddy at the wheel, Bobbie carrying boxes,
  and Westley and Tate carrying a mattress with Chapo asleep on it. The full
  image is contained in a measured 3:2 frame, with the accessible external link
  label below it. Image: `assets/characters/facebook-moving-day.jpg`.

## Banking behavior and limits

`normalizeBankPurchase` and `applyBankSnapshot` process Plaid-shaped account and
transaction data. The fictional fixture uses those same functions rather than
a second set of merchant/category counters. Added, modified and removed updates
are applied together; pending-to-posted identity replacement preserves personal
category exceptions. Partial paginated updates are rejected until the complete
update is available. Balances in a real connection must come from the account
balance response, not be recalculated by subtracting an imported history again.

Demo round-ups process eligible posted purchases once, skip existing history,
honor the multiplier and weekly cap, and reduce fictional checking while
increasing fictional savings. The transfer is recorded in the shared feed.
Demo paydays record income and the savings transfer; emergencies reduce the
fictional fund and appear as spending. Advancing the demo week resets the cap
counter without deleting prior savings. Pending transactions, transfers, refunds
and income are excluded from gross spending totals as explained on screen.

This update does not turn on production Plaid or fetch real transaction
histories. The existing owner-only Sandbox Link/account route remains separate.
A backend still needs to aggregate the complete sync update and balances,
deliver the per-user history securely, and call this adapter. Production
authorization, real transfers, bill pay and bureau-backed credit require their
respective integrations. The fictional Credit Center remains clearly labeled;
it does not compute or retrieve the user's real credit score.

Plaid primary references checked during implementation:

- https://plaid.com/docs/transactions/transactions-data/
- https://plaid.com/docs/api/products/transactions/
- https://plaid.com/docs/transactions/

Plaid's Recurring Transactions endpoint is an optional product add-on. This
local finder analyzes the available history and does not claim to call that
endpoint. It can miss subscriptions when history is short or the schedule is
irregular; manual entry remains available.

## Validation and release status

Tests exercise shared bank normalization, recurring detection and false-positive
exclusions, price changes, case deduplication, reversible dismissal, category
rules driving later purchases and spending totals, round-up caps and idempotent
refresh, payday/savings conservation, pending-to-posted reconciliation, encrypted
category reopen and backup restore, category-sheet save/undo/failure/retry, and
the actual full app's demo flow and exact Facebook destination. Existing app,
security, onboarding, Billiam, layout and calculation tests also run.

All 176 tests passed, 120 application source files passed binding checks, and
iOS/Android/web production bundle exports passed for this candidate. Bundle compilation is not a native device test or signed
TestFlight build. The preview browser could not reach the local server, so
physical-phone visual checks remain: 320–430 point widths, large text, keyboard
and fixed footer behavior, image framing, VoiceOver/TalkBack, deep-link return,
and restart/backup behavior. The user approved the moving-day image in chat.

GitHub read access succeeded, but terminal publishing and the GitHub
integration's code-write endpoint were unavailable (`403 Resource not accessible
by integration`). The existing workaround is an authenticated GitHub browser:
source files and images are uploaded through its normal repository interface
to `feat/neighborhood-banking-update-2026-11-08`, created from the exact Build 53
baseline. The published Git tree is compared with the tested local tree before
reporting publication complete. A source patch and assets were also packaged.
No backend deployment or TestFlight submission is claimed by these notes.

## Moving-day artwork prompt

Created with the built-in image generation tool using the family-reference
image for pet identities, the new grocery image for current Daddy's adult face,
short buzz cut, short beard, glasses, blue hoodie and brown jacket, and the new
shopping image for Bobbie's black/grey tabby fur, auburn-red wig and tiara.

Original 3:2 landscape PayPlace moving-day scene; exactly five characters.
Daddy is visible in the driver's seat of a turquoise moving truck with purple
trim and yellow details, hands on the steering wheel. Bobbie carries colorful
moving boxes at the rear. White terrier Westley in a blue hoodie and tiny tan
Chihuahua Tate in a yellow hoodie, oversized ears and long tongue, carry
opposite ends of a mattress toward the open loading ramp. Round orange tabby
Chapo, clothed in a teal hoodie and beanie, sleeps on top of the mattress.
Bright friendly storybook neighborhood, complete faces/paws/truck/mattress
within the frame, safe margins, no duplicate characters or generated lettering.
The link text and Facebook icon are rendered separately in the app.
