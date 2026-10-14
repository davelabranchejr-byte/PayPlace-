# Plaid Banking and navigation update — October 14, 2026

Prepared on top of Build 42 and the privacy/data-controls changes. Installed Build 42 is unchanged until a new signed TestFlight build ships.

| Tab | Primary tools |
| --- | --- |
| Home | Prominent Bobbie demo, short Safe to Spend overview, first win, one small step and two upcoming bills |
| Plaid Banking | Accounts and provider availability, round-ups, payday savings, recovery plans, Money Watch, sample credit and editable manual credit record |
| Budget | Manual financial inputs, detailed payday calculation, Extra Paycheck Calendar and Savings Goals |
| Bills | Bills, recorded payments, undo/correction history and Subscription Detective |
| Debt | Debt entries and Snowball, Avalanche or Mixed payoff planning |
| Neighborhood | Annie, Bobbie, Westley, Tate, Chapo, Em’s Pet Spa, Calm Garden, Quiet Mode and Annie revisits |

All six main tabs are visible in one row. Character visits retain the selected Neighborhood tab and an explicit return button. Existing stored route/state keys remain compatible.

Bobbie’s demo appears first on the welcome screen and Home. Home opens the public demo login directly, without personal onboarding or network requests. Starting it uses temporary fictional finances; returning restores the saved personal plan. Username Bobbie, password litterbox. Banking connections, savings switches, sample scores and monitoring remain visibly labeled as examples; the public demo does not call Plaid or move real money.

Home’s repeated Extra Paycheck cards, credit snapshot, bank-linking teaser, text-code teaser, manual-mode showcase and oversized duplicate summaries are removed. Full payday/calendar/savings tools live in Budget. Payment corrections and subscriptions live in Bills. Chapo’s calendar shortcut opens the same shared calendar rather than mounting a second one. The overwhelmed action lives in Neighborhood.

The bank scene composes canonical character face portraits with code-drawn plaid uniforms in PayPlace colors and exact logo badges. Annie hosts from the tree. Original character artwork is preserved. The image-generation service hit its daily limit, so no new generated bitmap was produced.

Validation: 113 native application tests; source checks; iOS, Android and web exports. App interaction checks cover primary/neighbor navigation, direct Home demo entry, return without altering saved finances, banking simulations, moved payment history, Quiet Mode and editable credit. Physical iPhone layout and the signed IPA still need validation.

The connector cannot write, but the previously authorized signed-in GitHub browser is publishing the combined update to release/em-spa-next-build for Build 43. The original combined source patch is also preserved in the hosted project source at handoff/PayPlace_mobile_update.patch. The hosted website currently publishes the privacy/service update; this mobile layout has not been deployed into that separate older website client.
