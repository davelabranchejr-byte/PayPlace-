# Build 42 — Bobbie’s banking-feature demo

Testers can enter username **Bobbie** and password **litterbox** from Annie’s welcome screen (Try Bobbie’s banking demo) or Premium → Account connections & beta setup. This public local demo does not authenticate a person, call Plaid, connect real banks, move money, or request credit reports.

Successful login connects the existing fictional checking/savings accounts and selects sample data for recovery planning. Testers can explore round-up purchase batches, payday savings and emergencies, Bill Shock/catch-up plans, sample Money Watch alerts, and a fictional credit score. These are feature previews; live integrations remain pending. Sample automation switches remain explicit user choices.

The onboarding entry uses an isolated, temporary sample neighborhood, with notifications disabled. Returning to the personal plan restores normal verification requirements. Demo credentials are public and never persisted as account credentials. Failed login leaves demo accounts disconnected, and disconnect/reset retain existing sample behavior.

Validation: regression exercises incorrect/correct credentials, simulations, credit/feed refresh, disconnect/reconnect/reset, return to onboarding, no network calls, and unchanged stored personal finances. Existing all-platform export and full suite are required before release. Physical iPhone layout verification remains a tester check.
