# PayPlace Privacy Policy

Last updated: September 30, 2026

This policy describes PayPlace 1.0.0 for iPhone, operated by David LaBranche Jr. The neighborhood is still under construction. The current release uses manual entry and stores budget information on your device. Optional email verification sends limited onboarding details to the PayPlace email service.

## Information in the app

PayPlace stores the information you enter, including your onboarding answers, name, email if supplied, personal notes, balances, bills, budget settings, and debt plans. These entries are stored locally on your device. Budget entries, balances, bills, debt plans, and personal notes remain on your device. Email verification does not create a cloud budget account or synchronize your financial entries.

Guest mode lets you explore without completing the onboarding questions. Do not put bank passwords, full card numbers, or other authentication secrets in personal notes or bill fields.

## Annie’s welcome email and verification

When you tap “Send my letter,” PayPlace sends your email address, name, and selected onboarding goal to its hosted email service. Resend delivers a personalized welcome letter and a verification code. The service stores your email with a hashed code, expiry, attempt count, and verification time. Codes expire after ten minutes and can be used once. Expired challenges are cleaned up during subsequent send requests after a short retention window. Hashed email and network IP identifiers support short-lived sending limits; the hosting and delivery providers may separately retain operational logs under their policies.

Replies sent to annieoaktree@payplace.app arrive in the operator’s Porkbun-hosted mailbox. Email delivery and replies are not end-to-end encrypted. Visitor mode lets you explore without requesting an email. Name and goal personalize the letter; budget balances, bills, debts, personal notes, and bank credentials are not included in the verification request.

## Bank connections and purchases

Bank linking through Plaid is an upcoming paid Premium feature. Bank linking, automatic bank synchronization, subscriptions, and in-app purchases are not active in this release. PayPlace does not ask for or transmit bank sign-in credentials.

## Tracking and third-party services

The current iPhone app has no configured advertising, analytics, cross-app tracking, or data-selling service. Expo, React Native, and local storage components provide the app's technical functions. PayPlace’s hosted service and Resend process verification requests and email delivery; Porkbun hosts Annie’s reply mailbox. Apple may separately process information through the App Store, TestFlight, device backups, or operating-system services under Apple's own policies.

## Local storage and your choices

PayPlace cannot remotely access or recover your local entries. You can edit or remove bills and debts inside the app. Removing the app removes its local app storage; any copies in iOS backups remain subject to your Apple backup settings. Device security and backup settings affect access to your saved information. PayPlace does not promise that entries are separately encrypted by the app.

## Support

For help or privacy questions, see [PayPlace Support](SUPPORT.md). Support requests made through GitHub are handled by GitHub and may be public. Share only the information needed to describe an app issue. Never include financial account details, passwords, personal notes, or private contact information in a public issue.

## Future changes

If online accounts, bank linking, analytics, or purchases are introduced, this policy and the App Store privacy disclosures will be updated before those features are released.
