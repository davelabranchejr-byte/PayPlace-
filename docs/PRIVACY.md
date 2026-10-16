# PayPlace Privacy Policy

Last updated: October 16, 2026

PayPlace is operated by David LaBranche, Jr. Contact [annieoaktree@payplace.app](mailto:annieoaktree@payplace.app) for support or privacy questions. This policy covers the mobile beta, hosted preview, email service and restricted owner bank testing. The current beta does not move real money, pay bills or retrieve a real consumer credit score.

## Your manual plan and profile

Your entered balances, income, bills, debts, notes, savings goals, subscription records, preferences and onboarding answers are stored on your device or in the browser you use. Manual financial entries are not synchronized to our service. Do not enter bank passwords, full card numbers or authentication secrets in notes or bill fields.

Mobile releases use an encrypted local vault for the budget and onboarding profile. Its random key is held in protected phone storage. Supported configured phones use device authentication for app lock and cover the app when inactive. Device unlock does not establish a cloud budget account or authorize banking.

Web security differs: the hosted preview stores its plan in browser storage and has no native device-authentication app lock. Same-origin scripts and other people using that browser may access its storage. Clearing browser data can remove your plan.

## Bobbie's fictional banking demo

Bobbie/litterbox are public demo credentials, not personal sign-in credentials. They do not authenticate a person, contact Plaid, connect a real bank, transfer funds or request a credit report. Sample balances, purchases, alerts, savings and scores are fictional. The welcome-screen demo uses temporary state separate from the saved personal plan, with notifications disabled. Sample feature choices in your personal Premium screen may persist with local preferences. Demo credentials are not saved as account credentials.

## Email verification and Annie's letters

Requesting a code sends your email, name, chosen goal and optional-letter choice to PayPlace. Resend delivers the email and receives the destination and message contents. Your manual balances, bills, debts and notes are not included. Email and mailbox copies are not end-to-end encrypted.

Codes are hashed, expire after ten minutes, allow five attempts and are single-use. After verification, the service retains email, name, verification time, optional-letter choice and consent time. Future Annie letters are optional; verification does not start a recurring campaign. Replies go to the operator's Porkbun-hosted mailbox. Providers may retain delivery and mailbox records under their own policies.

Short-lived hashed contact and IP-based counters limit abuse. Old counters and expired challenges are cleaned when service requests run; this is not a promise of cleanup at the exact expiry time. Verified contact records remain until deletion through the controls described below or a resolved privacy request.

## Separate owner-only Plaid Sandbox

The public Bobbie demo is separate from the approved-owner bank-testing route. Native testing only permits an allowlisted owner email and Plaid Sandbox. It requires a separately delivered code and server-issued session. A local verified-email flag or app unlock is not banking authorization. Session tokens use protected phone storage; the server keeps hashes, contact, owner ID and expiry. Reverification revokes older sessions.

The server keeps encrypted provider tokens, institution labels, environment and connection IDs scoped to the authenticated user. Sandbox bank information is fictional. Read-only owner account summaries do not silently change a personal plan. Linking uses the provider's authorized interface; PayPlace does not request bank passwords in its own fields. Disconnect revokes provider access. Sign-out alone does not disconnect. Native Production access remains disabled.

Real bank synchronization, consumer credit reports, payments and transfers require approved integrations and updated disclosures before release.

## Notifications

Optional bill, subscription and Annie reminders are local mobile notifications. They contain general invitations to open PayPlace without bill names, amounts, account details or transaction information. The app does not register for remote push delivery. Devices may delay or block reminders. Disable them in app or device settings. Restoring a backup leaves bill and subscription reminders off until you enable them.

## Deletion and your choices

The hosted preview now offers Privacy & data controls in its header and welcome screen. The mobile controls are prepared for the next TestFlight update; Build 42 does not include them. After installing that update, open Security & backup, then Delete account & data, or use Privacy & data controls on the welcome screen. Using the website clears the current browser, not entries stored separately on your phone.

Email-confirmed deletion removes the service contact/consent records, relevant code challenges and native sessions for that email. Applicable provider access is revoked before connection records are removed, then the current device's saved plan, profile and local recovery history are cleared. Phones also clear their bank session and scheduled/presented notifications. The app confirms completion. A server failure preserves the local plan. A device-cleanup failure after server deletion offers a local cleanup retry.

Delete this device's data only is a separate choice: it clears local entries/profile but leaves service records and bank connections. Different emails require separate confirmations. Web provider records tied to a signed-in ChatGPT identity require the corresponding sign-in email. PayPlace deletion does not delete Apple or ChatGPT accounts, cancel Apple subscriptions or erase mailbox copies.

Short-lived security counters, provider operational records and correspondence may be handled separately for security, service operation or applicable retention obligations. Contact the privacy address about these records. We do not promise to erase independently held Apple/provider records or files you exported elsewhere.

## Recovery and backups

Mobile builds retain the latest 20 deleted bills/debts in the local encrypted vault for undo, and include them in backups. Full device cleanup removes the current local history; individual deletion does not erase older backups.

Password-protected backups contain a manual plan and selected profile fields. Verification and optional-letter consent must be completed again after restore. You choose the file destination. PayPlace cannot reset its password, remotely erase exported copies or recover lost local entries. Uninstalling is not a server-deletion request. Manage exported copies and mailbox records separately.

## Providers, tracking and future changes

The configured mobile beta has no advertising network, cross-app tracking, data-selling service or third-party analytics integration. Libraries support technical functions; Resend handles delivery, Porkbun handles reply mail, the hosted service handles the limited records described here, and Plaid handles restricted Sandbox testing. Apple separately handles App Store/TestFlight/operating-system data. We are responsible for our providers and SDKs and will require protection appropriate to shared data.

We request data needed for the described features. No configured feature sends your personal plan to an AI provider; mascot-art creation does not send app user data to AI. Before new collection, purposes, providers, real banking or purchases, we will update this policy and App Store disclosures and obtain required consent.


## Bobbie’s Cabaret question mailbag

The Bobbie Darlending Show accepts optional write-in questions. Sending a question shares its text, selected topic, optional stage name, show-feature permission, consent version and submission time with the PayPlace team in a private hosted review queue. No email, verified contact, budget, balance, bank information or profile is automatically attached. Avoid including private information in your question. Leaving the stage name blank records “Anonymous neighbor”; this does not remove technical logs maintained by the hosting provider.

Permission to feature your question and stage name publicly in the show or PayPlace social posts is separate, optional and off by default. The team reviews submissions before public use; submitting does not guarantee a reply or appearance. Requests to feature a question do not publish it automatically.

There is no public question directory or read endpoint. Review records older than 90 days are removed when the mailbag next receives a submission. Short-lived, hourly hashed network identifiers limit spam and are cleaned up on subsequent submissions after two hours. Hosting logs may have separate retention. For a question removal request, contact annieoaktree@payplace.app and include your submission reference. Already published episodes or social posts may require separate edits or removal.

## Support and feedback

[PayPlace Support](https://payplace-dave.davelabranchejr.chatgpt.site/support) explains private help. TestFlight feedback goes to the developer through Apple. Optional GitHub issue drafts are public: use fictional examples and avoid private financial/contact details in text and screenshots. You can email the privacy address above for private questions.
