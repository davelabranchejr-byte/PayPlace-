# Build 55 — a simpler neighborhood

The four fixed bottom tabs are Home, Budget, Bills & Banking, and Neighborhood. Billiam, Plaid Banking, subscriptions, and debt live within Bills & Banking. Existing route IDs and saved financial data remain compatible. Home keeps the gentle welcome, spending snapshot, coming bills, and one next step; additional payday help expands on demand.

Original mascot illustrations accompany action controls at a compact size. Painted book/door hotspots retain their existing hit regions, and cards that already contain artwork do not receive another picture. All ten standard purchase categories have illustrations; custom categories receive the catch-all scene. The category picker uses two columns to keep long labels readable.

Em’s current stay includes fresh grooming, a slumber party, a blanket fort, and an illustrated seaside daydream. Daddy does not appear in these four stay scenes. Westley’s shorter coat follows Dave’s grooming photo; Tate’s face and cozy clothing follow his supplied photo. The locked PayPlace brand is applied separately over the scene. Em’s scrapbook preserves the five previous spa scenes and their borrowed-book interaction. Visits open paused, and Quiet Mode/reduced motion continue to take priority.

The Path of Encouragement starts in Annie’s existing garden and extends to town, room walls, Em’s spa, and the library. Tapping a subtle stone/brick/shelf spot reveals a handwritten note. Sixteen editorial notes cover all eight voices: Annie, Bobbie, Westley, Tate, Chapo, Billiam, Daddy, and Em. No streaks, collection counters, deadlines, or rewards are added.

Community notes are plain text, bounded, consented, and submitted to a private pending queue. Only server-approved exact revisions are eligible for the public feed. Edits return a note to pending. Rejections and removals exclude it. Approval, rejection, removal, and editing require the existing authenticated owner account/session; a hidden client control is not the security boundary. Requests are rate-limited and moderated actions have revision checks and an audit record. No community feed is persisted offline; offline discovery uses only editorial notes.

Dave can open Encouragement approvals from the owner inbox, or use:
https://payplace-dave.davelabranchejr.chatgpt.site/encouragement-review

The service update was deployed with schema migration 0007 and tested against an in-memory SQLite database. The queue uses the existing owner sign-in. A public visitor can see the page shell but cannot read submissions or perform moderation.

When demo banking data is already loaded, the app says so and offers account/transaction viewing instead of importing again. Re-entering the demo cannot silently reset it. Reset demo banking data is a separate deliberate action. The fictional demo remains separate from the personal vault; live Plaid transaction delivery and money movement remain outside this change.

Physical-phone checks should cover the four-tab labels at larger text sizes, category labels, keyboard avoidance, subtle-note hit areas, owner review, and the current/past spa visit switch. Production JavaScript exports do not replace a device check.
