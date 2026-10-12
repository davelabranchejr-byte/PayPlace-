# Connected finance activation — October 12, 2026

## Current state verified from source

- iPhone Build 36 has been signed and uploaded. New yellow, purple, pink and teal Home card backgrounds are a subsequent source change and require another binary.
- Native bank linking remains disabled. `src/BankConnections.js` currently uses web Plaid Link and relative `/api/banking` requests.
- The existing PayPlace Site has `worker/banking.mjs`: server token exchange, encrypted owner-scoped connections, account summaries, reconnect and revocation on disconnect. It uses Sites authenticated visitor identity; it does not establish native-app banking identity.
- Email code verification records verified contacts but does not issue a native banking access session. A verified email flag or local app lock must not authorize financial API calls.
- This owner has no Plaid developer account yet. No live bank or consumer score connection is established.

## Bank-data implementation path

Use Plaid Link, Transactions and reported account balances first. Request Recurring Transactions and Liabilities only after their coverage, price and access are confirmed. Do not request money-movement products for this data-only phase.

1. Owner creates a Plaid developer account at https://dashboard.plaid.com/ and obtains Sandbox access. Account signup and terms acceptance are owner actions. Configure client ID and secret through protected server runtime settings; never paste secrets in chat or put them in the app.
2. Establish authenticated per-user native sessions on a backend that supports the iOS/Android app. Retain Sites identity for the current web integration; do not spoof its identity headers from the native client or distribute its service token.
3. Add the native Link SDK and an absolute HTTPS banking API. Plaid's current React Native SDK supports Expo custom builds and requires rebuilding the native binary; it does not work in Expo Go. Configure the actual Android package and iOS OAuth return flow.
4. Exchange public tokens on the server; store encrypted access tokens bound to the authenticated user and provider environment. Provide consent, reconnect, account selection, disconnect/revocation and deletion.
5. Implement transaction synchronization with durable cursors, pagination mutation recovery, deduplication, pending-to-posted reconciliation and verified webhook handling. Review detected recurring bills before adding them to a plan. Record the account, provider freshness and sync time for balances. Imported data must not silently duplicate manual commitments.
6. Test isolation between two users, expired sessions, cancellation, reconnect, outages, transaction corrections, disconnect and stale balances using Sandbox. Apply production approval, pricing and privacy disclosures before enabling real users.

Existing account summaries do not constitute a transaction feed, recurring detection, bill payments or automated savings transfers.

## Consumer credit-score path

Evaluate Array and Experian Partner Solutions for licensed consumer score display/education and monitoring. Plaid Check's documented LendScore is a 1–99 underwriting risk score, not the normal consumer credit-score display requested here. Do not label it FICO or VantageScore, or infer a credit score from a bank balance. Ask Plaid whether any partner offering is approved for this exact use case before selecting it.

Before selecting a credit provider, confirm commercial access for a small budgeting app, setup/minimum/per-user costs, score model and bureau, refresh cadence, native/hosted SDK support, permitted display, user consent and identity enrollment. A provider contract and approved credentials are required; public documentation is not access approval.

The screen must display provider, bureau, scoring model, score date, change/history where supported, provider-required explanatory factors, and explicit unavailable/refresh/error states. Apply amount privacy to sensitive score details. Keep identity collection in the approved provider flow where possible. Do not display invented example scores as a user's actual score.

## Official references checked

- Plaid React Native Link: https://plaid.com/docs/link/react-native/
- Plaid Transactions: https://plaid.com/docs/transactions/
- Plaid billing and production plans: https://plaid.com/docs/account/billing/
- Plaid Check and LendScore: https://plaid.com/docs/check/
- Array embedded/API integrations: https://array.com/deployment
- Experian consumer score/report integrations: https://www.experian.com/partner-solutions/products/financial-services/credit-scores-reports

No provider account, paid contract, real-bank connection, consumer credit enrollment, or new TestFlight submission is created by this source update.
