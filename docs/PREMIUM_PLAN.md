# PayPlace connected-finance plan

Updated October 6, 2026. These are planned features, not active services.

Email security codes and Annie’s welcome email remain included. Text-message security is planned for Premium; the current release disables SMS.

Basic security remains included for everyone: encrypted local entries, native device-authentication app lock, and optional password-protected portable backup/restore. Cloud recovery is not implemented. Native behavior must be validated in the new TestFlight binary before release.

Annie’s discreet local bill reminders and recovery of the last 20 deleted bills/debts are also included free. Reminders require opt-in and phone notification permission; they do not use SMS, email, or a remote push service. They use full bill dates, at 9 AM or 6 PM local time, one or three days before the due date and on the due date. They group bills into one quiet notification per day and contain no bill names, amounts, or account identifiers. The next 48 reminder days are scheduled. Paid/deleted bills are removed from the schedule, and restored backups leave reminders off until enabled again. Native delivery needs testing in the new binary.

When bill payments launch, each payment must have a receipt accessible from its bill and payment history: biller, amount, fees, funding-account last four digits, request date, expected arrival, provider reference, and clear pending/posted/failed/returned status. A manual “Paid” marker or debt balance edit is not a bank payment or a receipt. Provider-confirmed, authenticated server records must be the source of truth; use idempotency to prevent duplicate submissions and never show success before provider confirmation. Basic security remains free even when connected financial services or SMS are paid features.

| Feature | Proposed integration | Scope |
| --- | --- | --- |
| Bank accounts and transactions | Plaid Link, Balance, Transactions | User-approved financial account connections and imported activity. |
| Recurring bills | Plaid Recurring Transactions | Detect recurring payments for user review; this does not connect directly to every utility or biller. |
| Debt details | Plaid Liabilities | Supported debt balances, interest, and payment details. Confirm product and institution coverage. |
| Credit-score display | Provider to be selected | Confirm consumer score-display/monitoring access and commercial approval separately; bank linking alone does not provide a bureau score. |
| Identity verification, if needed | Evaluate Plaid Identity Verification or Persona | Separate from inbox verification; do not add document/selfie collection without defining the product need. |
| Bill payments | Evaluate Method Financial and payment partners alongside Plaid | Future phase after connections. Confirm credit-card, loan, utility, rent, and other biller coverage, funding, fees, settlement, returns, and commercial access before choosing a provider. |
| Scheduled payments and optional autopay | Selected bill-payment partner | Future phase after one-time payments. Explicit mandates, cancellation, receipts, pending/posted/failed status, duplicate prevention, and trusted server-side authorization. |

Agreed rollout: connect accounts and show data first, add user-confirmed bill payments with receipts second, then introduce optional scheduling/autopay. Local Annie bill reminders can be used before connected payments. A provider must be evaluated against this complete path. No payment provider has been selected or activated.

Before production: establish provider accounts and approved product access; implement authenticated cloud accounts and trusted server-side purchase entitlements; keep secrets and provider tokens on the server; connect financial data to the correct user; provide consent, disconnect, deletion, and updated privacy disclosures. Do not accept a client-supplied paid flag. No pricing is set in this plan.

References:
- https://plaid.com/docs/financial-insights/
- https://plaid.com/products/liabilities/
- https://plaid.com/docs/identity-verification/
- https://help.openai.com/en/articles/12652064-age-prediction-in-chatgpt (OpenAI documents Persona for ChatGPT age verification.)
