# PayPlace Privacy Policy

Last updated: October 6, 2026

This policy describes PayPlace 1.0.0 for iPhone, operated by David LaBranche Jr. The neighborhood is still under construction. The current release uses manual entry and stores budget information on your device. Contact verification sends limited onboarding details to the PayPlace delivery service. Verification is required to enter PayPlace. Email verification is included for everyone. Text-message security codes are a planned paid Premium feature and are not available in this release.

## Information in the app

PayPlace stores the information you enter, including your onboarding answers, name, verified email, letter delivery preferences, personal notes, balances, bills, budget settings, and debt plans. These entries are stored locally on your device. Budget entries, balances, bills, debt plans, and personal notes remain on your device. Contact verification does not create a cloud budget account or synchronize your financial entries.

Do not put bank passwords, full card numbers, or other authentication secrets in personal notes or bill fields.

## Annie’s welcome letters and security codes

Email is the current verification and welcome-letter delivery method. Requesting a code sends your chosen contact address, name, selected goal, and optional-letter preference to PayPlace’s hosted service. Email uses Resend. SMS delivery is disabled in this release. Budget balances, bills, debts, personal notes, and bank credentials are not included.

The welcome email includes an eight-character code. Codes are hashed on the server, expire after ten minutes, allow five attempts, and can be used once. Short-lived hashed contact and network IP identifiers limit code requests. Expired challenges are cleaned up after a short retention window. After verification, the service stores your verified contact, name, verification time, and optional future-letter choice and consent time. No recurring letter campaign is started by this update.

Future Annie letters are optional. Email replies go to annieoaktree@payplace.app in the operator’s Porkbun-hosted mailbox. Delivery providers may retain operational logs under their own policies. Email is not end-to-end encrypted.

## Bank connections and purchases

Bank linking through Plaid and text-message security codes are upcoming paid Premium features. Email verification remains included. Bank linking, automatic bank synchronization, subscriptions, and in-app purchases are not active in this release. PayPlace does not ask for or transmit bank sign-in credentials.

## Tracking and third-party services

The current iPhone app has no configured advertising, analytics, cross-app tracking, or data-selling service. Expo, React Native, and local storage components provide the app's technical functions. PayPlace’s hosted service and Resend process email verification requests and message delivery; Porkbun hosts Annie’s reply mailbox. Apple may separately process information through the App Store, TestFlight, device backups, or operating-system services under Apple's own policies.

## Local storage and your choices

PayPlace cannot remotely access or recover your local entries. You can edit or remove bills and debts inside the app. Removing the app removes its local app storage; any copies in iOS backups remain subject to your Apple backup settings. Device security and backup settings affect access to your saved information. PayPlace does not promise that entries are separately encrypted by the app.

## Support

For help or privacy questions, see [PayPlace Support](SUPPORT.md). Support requests made through GitHub are handled by GitHub and may be public. Share only the information needed to describe an app issue. Never include financial account details, passwords, personal notes, or private contact information in a public issue.

## Future changes

If online accounts, bank linking, analytics, or purchases are introduced, this policy and the App Store privacy disclosures will be updated before those features are released.
