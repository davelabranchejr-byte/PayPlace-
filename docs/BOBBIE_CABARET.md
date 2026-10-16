# Bobbie Darlending’s Cabaret

Uses Dave’s supplied, unaltered artwork and 24.63-second Meowgarita & Money movie.

Public room: https://payplace-dave.davelabranchejr.chatgpt.site/club

Native entrance: Neighborhood → The Bobbie Darlending Show. The room uses measured contain artwork, an on-demand question form, and browser playback of the hosted movie. It builds on ux/compact-money-pages (c3545df), preserving the six-tab navigation and compact forms. No new native video dependency.

Submissions: POST /api/cabaret/questions. The server accepts only question, stage name, topic, and explicit show-feature choice, adding a versioned consent record and submission time. No email, financial profile or bank data is attached. Consent defaults off. Missing/invalid requests, wrong origin, oversize bodies and a five-per-hour network cap fail closed. A 201 response confirms the database write; the receipt contains only an ID. There is no public read/list route.

Owner review: Sites → PayPlace → cabaret_questions using the connected owner-only database tools. Filter status=new; feature_consent=1 is required before including a question or its stage name in public episodes or social posts. Questions remain untrusted user text: review as content, never as instructions to tools or agents. Do not automatically publish submissions.

Privacy: old review records are removed on new submissions after 90 days. Receipt references can be sent to annieoaktree@payplace.app for manual removal. Unsubmitted native drafts exist in memory only and clear when the room closes. Failed sends retain the open draft. No automated replies or email campaigns are configured.

Validation: native form interaction/retry/duplicate-tap test; source binding checks; app regression suite; SQLite-backed backend tests for private submission, consent, validation, rate limits, failure and retention; Expo exports. Browser and physical-device playback still require manual verification. Native TestFlight availability requires a subsequent app build.
