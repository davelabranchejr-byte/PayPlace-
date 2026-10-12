# Build 37 candidate — native Plaid Sandbox wiring

Includes the compact original Home artwork and bright yellow, purple, pink and teal card backgrounds.

## What is implemented

- Native iOS/Android Plaid Link SDK 13.3.0, opened from Premium → bank-linking availability. Web stays in upcoming mode.
- Server-issued bank sessions after a delivered, expiring, rate-limited, single-use email code. Session credentials stay in the native device keychain; only their hashes are stored server-side. Reverification revokes earlier sessions. Sessions expire after seven days and can be signed out.
- Owner-only Sandbox gate enforced on the server. Production native access stays disabled. A local app unlock or client verification flag cannot authorize banking.
- Connect, cancel, refresh reported accounts, reconnect and revoke/disconnect. Access tokens stay encrypted on the server. Native and web identities cannot read one another's connections.
- Sandbox balances are shown as fictional test data and cannot update the saved personal plan. No money movement, automated payments, transaction feed, recurring detection or credit-score provider is introduced.
- Banking verification preserves the user's existing name and Annie-letter consent.

The supplied Sandbox credentials were accepted by Plaid's `/institutions/get` endpoint before integration. Secrets are configured through Sites runtime tools and are never included in source, client bundles, tests or release notes.

## Validation

- 104 native-app regression and logic tests; 23 backend banking/email/session tests.
- Source binding checks and iOS, Android and web bundle exports.
- Native SDK callbacks are exercised using a mock: success exchanges the public token before showing accounts, cancel exchanges nothing, and repeated taps create only one Link session.
- Physical-device Link presentation, actual email-code entry and real Sandbox institution completion require the new binary; they have not been verified merely by a bundle export.
- The live backend request probe from this execution environment was blocked by Cloudflare's browser-signature firewall (1010). No user-agent or security bypass was attempted. Native device-to-service reachability remains a device check; successful Sites deployment does not establish that the iPhone request succeeds.

## Device test

1. Keep the installed app and update to Build 37 once it is uploaded and available. Confirm the four Home card colors and compact artwork.
2. Open Premium → bank linking, enter the approved owner test email and request a code. Enter the code yourself. Confirm verification is required separately from the local app lock.
3. Connect a Sandbox institution using its documented fictional test login. Cancel once and ensure no account appears; complete it next time and verify accounts, masks, balances and checked time.
4. Refresh, then test a Sandbox reconnect-required scenario and reconnect the existing connection. Disconnect and verify that accounts disappear. Sign out, reopen and verify again. Personal entries and amount privacy should stay intact.
5. Confirm no test balance changes the personal payday estimate. No real bank login or real payment should be attempted in this build.

The backend has separate deployment and database migrations. A native binary must be rebuilt to include the new SDK. Build 36 cannot acquire it from a server change. Production account approval, OAuth setup, consumer credit provider approval and native public-launch access remain later gates.
