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

## Annie’s discreet bill reminders and recovery

Bill reminders are optional, free local notifications scheduled on your phone. They do not send bills or financial entries to a push, email, or SMS provider. Notifications contain only a general invitation from Annie to open PayPlace; they never include bill names, amounts, account details, or bill identifiers. You can choose 9 AM or 6 PM local time and one or three days before the due date, plus a due-day reminder. Your phone may delay or block delivery. Disable reminders in Security & backup or your phone’s settings. Restoring a backup leaves reminders off until you enable them again.

The last 20 deleted bills/debts are retained in the encrypted local vault for undo or restoration. They are included in encrypted backups. Restored records do not replace an existing record with the same identifier. Older retained deletions are replaced as newer entries are deleted; resetting demo data also removes this local recovery history. Historical backups may still contain deleted entries.

## Bank connections and purchases

Bank linking through Plaid and text-message security codes are upcoming paid Premium features. Email verification remains included. Bank linking, automatic bank synchronization, subscriptions, and in-app purchases are not active in this release. PayPlace does not ask for or transmit bank sign-in credentials.

## Tracking and third-party services

The current iPhone app has no configured advertising, analytics, cross-app tracking, or data-selling service. Expo, React Native, and local storage components provide the app's technical functions. PayPlace’s hosted service and Resend process email verification requests and message delivery; Porkbun hosts Annie’s reply mailbox. Apple may separately process information through the App Store, TestFlight, device backups, or operating-system services under Apple's own policies.

## Local storage and your choices

The security update encrypts budget entries and onboarding answers with AES-256-GCM. Its random device encryption key is held in the iOS Keychain or Android Keystore through Expo SecureStore. On iOS, the key is accessible only while the device is unlocked and does not transfer to another device. Previously saved entries migrate to the encrypted vault; legacy plaintext entries are removed only after the encrypted copy has been verified. This does not erase historical operating-system backups.

On phones with configured device authentication, app lock is on by default. It uses Face ID, Touch ID, supported Android biometrics, or the device passcode. The app locks on launch, after thirty seconds away, or after five minutes without interaction. App screens are covered while the app is inactive. You can turn the lock off after device authentication. A device without a configured passcode cannot enable the app lock. Device authentication unlocks this app; it is separate from verified email, cloud sign-in, and authorization of future bank payments.

You can create an optional password-protected backup containing your manual budget and selected onboarding profile fields. A new backup password must contain at least twelve characters. Backup files use AES-256-GCM with PBKDF2-SHA256 at 600,000 iterations and a fresh random salt. You choose where the file is saved or shared; that destination's privacy and retention policies apply. Export/import temporarily uses the app cache for encrypted files and removes its temporary copy afterward. Backup passwords are not sent to PayPlace. PayPlace cannot reset a forgotten backup password. Restoring replaces local entries after confirmation and requires fresh email verification and letter consent; verification claims and consent do not transfer through the backup.

PayPlace cannot remotely access or recover your local entries. You can edit or remove bills and debts inside the app. Removing the app or clearing storage can make entries inaccessible. Operating-system backups are not a guaranteed recovery path because the device key may be unavailable after restoration or transfer. Keep an exported backup and its password if you need portable recovery. iOS Keychain items can survive reinstallations; do not rely on that behavior to recover a plan.

The browser version encrypts saved entries with a key in IndexedDB and has no native device-authentication app lock. Encryption in the browser does not prevent access by scripts running on the same website. Clearing browser data can remove both entries and the key.

## Support

For help or privacy questions, see [PayPlace Support](SUPPORT.md). Support requests made through GitHub are handled by GitHub and may be public. Share only the information needed to describe an app issue. Never include financial account details, passwords, personal notes, or private contact information in a public issue.

## Future changes

If online accounts, bank linking, analytics, or purchases are introduced, this policy and the App Store privacy disclosures will be updated before those features are released.
