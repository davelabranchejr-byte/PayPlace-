# Privacy and data-controls update - October 14, 2026

This update follows Build 42. It restores privacy/support access in the welcome screen, before contact verification, and in Security & backup. Email-confirmed Delete account & data removes records for the proved email and then clears the current device; the separate device-only action explicitly leaves server records. Public Bobbie demos cannot delete a personal account.

## Public pages and saved policy

- Privacy Policy: https://payplace-dave.davelabranchejr.chatgpt.site/privacy
- Support: https://payplace-dave.davelabranchejr.chatgpt.site/support
- Canonical Markdown: docs/PRIVACY.md and docs/SUPPORT.md.
- Also update the earlier GitHub policy on release/ios-1.0.0 so any previously pasted link continues to show the current wording.

## Verification completed

113 native application tests passed, including actual app-screen local deletion without finance/profile resurrection. Source binding checks passed. iOS, Android and web bundles exported. The server suite passed 29 tests, covering delivered deletion codes, purpose separation, wrong-code/expiry limits, owner separation, provider/database failures, retry cleanup and bank authorization while deletion is in progress.

Tests use fictional records and mocked email/provider calls. No real tester data was deleted and no email was sent during validation. Physical-device visual verification and the exact signed IPA are still separate checks.

## App Store Connect fields to verify

Set the working public Privacy Policy and Support URLs above. Reconcile the privacy label with retained name/email and the message/service data described in the policy. Do not select Data Not Collected merely because budgets stay local. Classify goal/message content, identifiers and provider logs by actual collection and purpose before finalizing those fields. Confirm U.S.-only availability, accurate age ratings, export/encryption answers, and agreement status. Inspect SDK privacy manifests and required-reason API declarations in the signed package. These account-level fields were not changed by this source update.

## Review notes to include

The app provides manual planning and clearly labeled fictional banking previews. Public demo username Bobbie, password litterbox, from the first card on Annie's welcome or Home, or inside Plaid Banking. No real funds move and no real credit report is requested. A distinct owner-only Plaid Sandbox route exists; disclose that restriction and arrange any access Apple requests rather than implying the public demo authenticates banking.

## Questions still requiring Apple

Financial-feature classification and the submitting entity for manual budgeting, later read-only Plaid data and eventual transfers; whether mandatory verification is appropriate for the local planning stage. A prepared inquiry is saved in the requirements review. It has not been sent and no legal agreement or membership conversion was accepted here.

## Native release status

Source changes require a new signed TestFlight build to reach installed iPhones. JavaScript/platform exports are validation, not proof of a TestFlight upload. Build 42 itself is not altered by these saved source changes.

GitHub connector writes were denied (403). The previously authorized signed-in GitHub browser is publishing the tested combined update to release/em-spa-next-build for Build 43. The exact original patch is also preserved in the hosted project source under handoff/PayPlace_mobile_update.patch. The earlier policy on release/ios-1.0.0 remains a separate historical-link update.
