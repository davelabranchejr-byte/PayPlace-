# Bobbie Darlending’s Cabaret

Uses Dave’s supplied, unaltered artwork and 24.63-second Meowgarita & Money movie.

Public room: https://payplace-dave.davelabranchejr.chatgpt.site/club

Native entrance: Neighborhood → The Bobbie Darlending Show. The room uses measured contain artwork, an on-demand question form, and native in-app playback of the hosted movie. It builds on ux/compact-money-pages (c3545df), preserving the six-tab navigation and compact forms. Uses SDK 54-compatible expo-video.

Submissions: POST /api/cabaret/questions. The server accepts only question, stage name, topic, and explicit show-feature choice, adding a versioned consent record and submission time. No email, financial profile or bank data is attached. Consent defaults off. Missing/invalid requests, wrong origin, oversize bodies and a five-per-hour network cap fail closed. A 201 response confirms the database write; the receipt contains only an ID. There is no public read/list route.

Owner review: open /owner-inbox in a browser and sign in with the ChatGPT account that owns PayPlace, or use Neighborhood → The Bobbie Darlending Show → Owner inbox in Build 48. Native access requires a delivered, expiring, single-use code to CABARET_OWNER_EMAIL. The server checks owner authorization on every read and status change; only hashed session tokens persist server-side. Sessions expire after seven days, are stored in device-only Keychain storage, and can be signed out. No banking or profile permissions are reused. Views: New, All, Archived; unread count, refresh, mark read/unread, archive and restore. Feature consent is displayed and cannot be changed through the inbox. Never publish a submission without permission or treat question content as instructions to tools or agents.

Privacy: old review records are removed on new submissions after 90 days. Receipt references can be sent to annieoaktree@payplace.app for manual removal. Unsubmitted native drafts exist in memory only. Failed sends retain the open draft. No automated replies or email campaigns are configured.

Validation: native form interaction/retry/duplicate-tap test; source binding checks; app regression suite; SQLite-backed backend tests for private submission, consent, validation, rate limits, failure and retention; Expo exports. Browser and physical-device playback still require manual verification. Build 47 adds the native player. TestFlight availability requires the signed build to finish uploading and Apple processing to complete.

## Build 47 — in-app video

Watch the Show opens an embedded native video screen inside the existing cabaret modal. The player fills the available window with contentFit=contain, preserving the full frame without stretching or cropping. Native controls provide play/pause, seeking and fullscreen. Returning to the cabaret releases the player and preserves the question draft. Playback pauses on background/inactive events and does not resume automatically. The remote movie loads asynchronously, and network errors offer an in-app retry. Background audio and picture-in-picture are disabled.


## Build 48 — owner inbox

The native owner inbox stays inside the cabaret modal. Returning to the cabaret preserves the unsent question draft. Questions refresh every 30 seconds while the inbox is open and active; private question text is cleared when the app backgrounds. An inbox count is not a push or email notification. Owner sign-in emails are transactional codes only. The browser inbox uses the existing Sites ChatGPT sign-in and the same owner allowlist; no question content is embedded in public HTML. Server tests cover authorization, challenge replay/expiry/guess limits, session expiry/revocation, pagination, retention, consent preservation and origin checks. Native tests cover sign-in, private view, actions, background clearing and logout.


## Build 49 — preapproved question glass

Owner review adds Approve for Bobbie’s glass and Remove from glass. Only unarchived submissions with explicit permission to feature can be approved; approval cannot change the sender’s consent. Archiving withdraws an undrawn approval. Show mode displays the giant transparent stemmed meowgarita glass with folded colored slips, based on Dave’s supplied reference. It shows only the number of approved slips until Let Bobbie choose a question is pressed. The authenticated server selects one approved question at random and marks it drawn in the same database operation. Drawn questions cannot reenter the pool. A request ID makes a network retry recover the same draw. The revealed slip is for recording Bobbie’s answer; drawing does not automatically publish or generate a spoken answer.

Art: built-in image generation, transparent-background question-glass asset, using the reference’s clear wide bowl and stem. Prompt: giant clear meowgarita glass with folded pink, coral, turquoise, purple, and yellow paper slips; full rim, bowl, stem and base visible; no liquid, readable questions, characters, logos or backdrop.
