# Security update

Implemented in source October 6, 2026; requires a new native build. Not a statement that the existing TestFlight binary contains these changes.

## Included protection

- Native app lock defaults on when device authentication is configured. Face ID/Touch ID/strong Android biometrics with system device-passcode fallback. Launch lock, 30-second away lock, five-minute idle lock, manual lock, and opaque inactive-screen cover. Disabling lock and exporting/restoring require device authentication when available.
- AES-256-GCM vault with independent random 96-bit nonce for each write. A 256-bit random key lives in SecureStore, using iOS `WHEN_UNLOCKED_THIS_DEVICE_ONLY` and Android Keystore-backed storage. No bank credentials or provider access tokens are stored by this update.
- Single serialized finance/profile record; legacy plaintext removed only after authenticated readback. Missing keys, damaged ciphertext, or load failures block startup rather than replacing saved data with demo values.
- Portable `.payplace` backup protected by a user password, AES-256-GCM, PBKDF2-SHA256 (600,000 iterations), and a fresh 128-bit salt. File size and KDF parameters are bounded before processing. Explicit confirmation before replacement. Profile verification, sessions, and letter consent are excluded; restored users verify email again.
- Browser encryption uses an IndexedDB key, without native app lock. Same-origin script access remains possible. This is not a cloud account or cloud backup.

## Validation

Automated checks cover encryption/authentication, wrong passwords, migration preservation, corrupt/missing keys, serialized writes, KDF abuse, backup bounds, portable restore and background timeout boundaries. Expo exports for iOS, Android and web compile. They do not exercise native biometrics or prove security of the release binary.

The dependency audit also reports existing Expo/React Native build-tool dependencies. None of the new noble cryptography packages is flagged. These findings need separate toolchain review; do not use `npm audit fix --force` to downgrade Expo or replace the native framework automatically.

Before distributing broadly, test a new native build with:

1. Upgrade with existing budget/profile entries; verify they survive unchanged and legacy plaintext keys are removed.
2. Face ID/Touch ID success, denial, cancellation and device-passcode fallback; no biometric enrollment; changed biometrics; removed device passcode. Devices with a previously enabled lock must fail closed if authentication becomes unavailable.
3. Fresh launch; short interruption; 30+ seconds away; five minutes idle; manual lock; existing nested modals. Confirm the app switcher does not display financial details and locked content cannot be read by VoiceOver/TalkBack.
4. Export to Files, cancel sharing, import with wrong password, modify the file, restore on a different device, and reverify email. Confirm export cache cleanup and that passwords aren't logged.
5. Simulated disk-full/write failures and missing encryption key; verify startup does not overwrite the saved plan and backup recovery remains accessible.

The app lock protects access to local UI. It is not proof of legal identity, payment authorization or server session authentication. Linked banking/bill pay will require authenticated cloud accounts, server-side authorization, per-user token isolation, payment confirmation, recovery and revocation controls. These future services are not activated here.

The app now uses bundled standard cryptographic code in addition to platform storage. Review Apple's encryption export-compliance answers for the new binary; do not automatically mark non-exempt encryption false solely because SecureStore is present.

## Suggested next features (not implemented)

User-controlled bill reminders with discreet notification text, disconnect/delete-data controls for future connections, and payment receipts with clear pending/posted/failed status. Real payments must never be inferred from manually marking a bill paid.

## Reminders and deleted-entry recovery

- Basic security, encrypted backup/recovery, Annie reminders, and recently deleted entry recovery are free; no Premium check gates them.
- Reminder consent lives inside the encrypted finance vault. It defaults off. OS permission is requested only after the user enables reminders. No push token is requested or sent. The Android channel has no sound/vibration and uses private lock-screen visibility. Generic notification payloads have no financial identifiers or values.
- Native scheduling reconciles paid/deleted/edited bills, preserves other notification features, and caps the next reminder days at 48. Settings and time-zone changes reconcile on app resume. Repeated openings do not duplicate unchanged schedules. Android uses the SDK’s inexact fallback rather than requesting exact-alarm access.
- Deleted bills/debts retain their full record in the encrypted vault; restore changes only that record and refuses ID collisions. The last 20 deletions survive app restarts and are included in validated encrypted backups.
- Device tests: notification opt-in/denial and Settings recovery, quiet background delivery, notification tap after app unlock, grouped due dates, bill editing/payment/deletion cancellation, time-zone change, and deleted-entry restoration after restarting. Check narrow screens and large text for the Undo bar and settings.
