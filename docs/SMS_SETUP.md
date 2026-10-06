# PayPlace email verification and planned Premium SMS

Email verification and Annie’s welcome email are included for everyone through the existing Resend service. Phone verification is a planned paid Premium feature. It is not purchasable or active in this release. The phone selector has been removed; the server rejects SMS requests even if provider credentials are configured.

Before releasing Premium SMS, implement trusted server-side purchase/entitlement validation, link it to the verified account, and enforce it on every SMS request. Never accept a client-supplied paid flag. Configure the provider and registered sender, then replace the release-wide SMS block with the entitlement check. Email must remain available without purchase.

The dormant provider integration uses Twilio Programmable Messaging through a Messaging Service.

Set these values in the PayPlace hosted service runtime (credentials must be marked secret):

- `TWILIO_ACCOUNT_SID`: the account SID.
- `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET`: server-side API key credentials.
- `TWILIO_MESSAGING_SERVICE_SID`: a Messaging Service with a registered, SMS-capable sender and STOP/HELP handling.
- `SMS_SENDING_ENABLED`: set to `true` only after the sender and server-side Premium entitlement checks are ready. This flag alone cannot enable SMS in the current release.

No Twilio credentials belong in the iPhone app or GitHub. Provider account setup, sender registration, and message charges require the owner’s account.

The app requires a delivered, unexpired, one-use code before completing onboarding. Existing verified email users remain verified. Existing visitors verify before entering, preserving their local budget data.

Each welcome email includes a security code. Optional future Annie letters use the verified email; the server records the choice and its timestamp after verification. This update stores that preference; it does not start a recurring letter campaign.

Use a controlled test recipient after connecting SMS. Check email and SMS delivery, wrong/expired codes, resend cooldown, one-use codes, optional-letter choice, and reopening the app. The automated tests use mocked delivery providers, not real recipients.

Implementation references: https://www.twilio.com/docs/messaging/api/message-resource and https://www.twilio.com/docs/messaging/api
