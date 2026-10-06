# PayPlace connected-finance plan

Updated October 6, 2026. These are planned features, not active services.

Email security codes and Annie’s welcome email remain included. Text-message security is planned for Premium; the current release disables SMS.

| Feature | Proposed integration | Scope |
| --- | --- | --- |
| Bank accounts and transactions | Plaid Link, Balance, Transactions | User-approved financial account connections and imported activity. |
| Recurring bills | Plaid Recurring Transactions | Detect recurring payments for user review; this does not connect directly to every utility or biller. |
| Debt details | Plaid Liabilities | Supported debt balances, interest, and payment details. Confirm product and institution coverage. |
| Credit-score display | Provider to be selected | Confirm consumer score-display/monitoring access and commercial approval separately; bank linking alone does not provide a bureau score. |
| Identity verification, if needed | Evaluate Plaid Identity Verification or Persona | Separate from inbox verification; do not add document/selfie collection without defining the product need. |

Before production: establish provider accounts and approved product access; implement authenticated cloud accounts and trusted server-side purchase entitlements; keep secrets and provider tokens on the server; connect financial data to the correct user; provide consent, disconnect, deletion, and updated privacy disclosures. Do not accept a client-supplied paid flag. No pricing is set in this plan.

References:
- https://plaid.com/docs/financial-insights/
- https://plaid.com/products/liabilities/
- https://plaid.com/docs/identity-verification/
- https://help.openai.com/en/articles/12652064-age-prediction-in-chatgpt (OpenAI documents Persona for ChatGPT age verification.)
