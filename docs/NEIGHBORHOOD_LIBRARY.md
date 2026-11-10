# Annie’s illustrated neighborhood library

Build 53 adds Daddy’s missing reading scene for new and already-saved checkouts.
Daddy reclines on Annie’s couch with all four animals cuddled on him.

Build 52 corrects the Build 51 portrait-and-cover reading cards. The library is
one warm oak-tree illustration with fixed book hit targets, a matching borrowed
state, and Westley and Chapo cuddling in their teal floor bed. The full square
scene stays visible on phones. Take a closer look opens a larger scrollable view.

## Shelves and stories

Six mascot books fill the upper shelf. Daddy’s **Everyone Belongs Here**,
subtitled **Money without shame.**, sits immediately left of Emma’s memoir on the
lower shelf. Tap a mascot book to open its original short PayPlace story. These
stories are fictional neighborhood writing; they are not excerpts from the memoir.

Emma Acly’s **Before You Call Me Difficult: A Memoir of Foster Care, Faith,
and Learning to Love Again** keeps permanent shelf A1. Its exact approved cover
remains in `assets/books/before-you-call-me-difficult.jpeg`. Borrowing switches to
the matching painted scene with an empty wooden gap; returning restores the same
book in the same position. Other books and the cuddling mascots stay in place.

## Reading around town

Bobbie, Westley, Tate, Chapo and Annie each have a complete illustrated reading
scene, with Emma’s book naturally held in paws or branches. There are no separate
covers pasted over portraits. Bobbie’s loan also replaces PAWZINE in her existing
Em’s Pet Spa jacuzzi scene; entering the spa opens that moment. Tap it for the book
details, external Amazon destination (https://a.co/d/09P0VmeL), or return to A1.
The original spa artwork comes back when the loan ends. Daddy’s reading card in
Annie’s house shows him reclining on her couch, naturally holding Emma’s book,
with Bobbie, Westley, Tate and Chapo cuddled on him. It also appears for existing
saved Daddy loans. A personal checkout for You has no character illustration.

## Lending and storage

Choose You, Bobbie, Westley, Tate, Chapo, Annie or Daddy. Duplicate checkouts are
rejected. The ledger records borrow and return, keeping its last 60 entries.
Manual loans remain until returned. The daily reading circle advances only on a
new local calendar day, returns its own previous loan, and respects a manual loan
or explicit same-day return. Loans are local to the existing encrypted plan,
included in backups, and separate from sample finances.

This feature is an illustrated lending experience. The actual memoir is on the
author’s Amazon page; borrowing does not unlock an in-app copy of its text.

## Verification

- Source bindings: 116 files checked.
- 155 tests pass, including the real-app shelf hit targets, enlarged view, Daddy
  story, duplicate taps, natural reading scene, spa handoff, Amazon link, saved
  checkout after relaunch, Daddy’s saved checkout and couch scene, return from the spa
  and unchanged financial balance.
- Expo export for iOS, Android and web must pass before the native release.
- Artwork was visually reviewed for identities, book positioning and the new bed.

## Phone tester script

1. Open Neighborhood → Annie’s House. Find Westley and Chapo cuddling below the
   shelves. Daddy’s teal book is immediately left of Emma’s cream/red book.
2. Tap Daddy’s book. Confirm Everyone Belongs Here and Money without shame.
   appear; read the short story and return to the shelves.
3. Open Take a closer look. Swipe and tap the painted book covers. Return.
4. Tap Emma’s book, choose Bobbie and borrow. A wooden gap should remain at A1;
   Daddy’s book, neighboring books and the cuddling pair should stay put.
5. Visit Bobbie’s Boutique and Em’s Pet Spa. Bobbie should naturally hold/read
   Emma’s book in the full scene. Tap it and check the Amazon destination.
6. Relaunch and unlock. Confirm Bobbie’s loan survived. Return it from the spa;
   the magazine returns there and Emma’s book reappears on shelf A1.
7. Borrow for Westley, Tate, Chapo and Annie in turn; check the corresponding
   reading scene, then return each copy. Review the checkout ledger.
8. Borrow for Daddy, or open an existing Daddy loan. His card should show him
   reclining on Annie’s couch with Bobbie, Westley, Tate and Chapo cuddled on him.
   Tap the scene for details, relaunch to verify it stays visible, then return
   the book to A1.
9. Check a narrow phone, enlarged text, Quiet Mode and a manual loan across a
   local midnight. Financial records should stay unchanged by library visits.

A successful export is not proof of TestFlight delivery. The native release must
finish its build/sign/upload workflow, then Apple must process it.

## Daddy scene asset

`assets/library/daddy-reading-em.png` is a 1254 × 1254 complete illustration,
created with the built-in image generation tool using Dave’s supplied Daddy
references, the canonical family wall and the approved Emma cover. The scene
prompt specifies Daddy reclining on Annie’s teal couch and naturally holding
Emma’s open memoir, with Westley at his shoulder, Tate across his lap, Bobbie
on his thighs and Chapo on his legs, in the established warm oak-tree style.
The app displays the whole scene with contain sizing; no cover is layered over
a portrait.
