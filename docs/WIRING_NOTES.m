# PayPlace Premium Resilience Hub wiring notes

Prepared against the current PayPlace source structure already inspected in GitHub.

1. Add these files under `src/`:
   - `PremiumResilienceHub.js`
   - `premium-resilience.mjs`
2. Add `tests/premium-resilience.test.mjs`.
3. In `App.js`, import `PremiumResilienceHub` and `DEFAULT_PREMIUM_STATE`.
4. Add state alongside the existing `bankConnectionsVisible`, `detectiveVisible`, and `savingsVisible` state:
   - `premiumVisible`
   - `premiumState`
5. Persist `premiumState` inside the same encrypted finance vault payload used for savings/subscription settings rather than a separate unencrypted store.
6. Add a Premium entry point on Home / paid-features area. During beta, keep it available without charge just like Extra Paycheck Calendar and Subscription Detective.
7. Render the hub near the existing modal components. Wire:
   - `onOpenBankConnections={() => setBankConnectionsVisible(true)}`
   - `onOpenSubscriptions={() => setDetectiveVisible(true)}`
   - `onPremiumStateChange={setPremiumState}`
   - `finance={finance}`
8. Keep actual linked-money movement disabled until trusted server-side authorization, purchase entitlements, provider approval, receipts, and payment-status handling are in place.
9. Credit Center should remain a UI shell until a bureau/embedded-credit provider is contracted and approved.
10. The brand north star for this package is: “Money without Shame. Financial breathing room for real life.”
