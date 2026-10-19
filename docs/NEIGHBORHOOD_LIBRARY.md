# Annie’s Neighborhood Library — next build

Built on `fix/consistent-payplace-logo` at `ed3cdeb` to retain the latest
Billiam tools, native OCR setup, household planning, cabaret and character fixes.

Emma Acly’s **Before You Call Me Difficult: A Memoir of Foster Care, Faith,
and Learning to Love Again** is the inaugural title. The exact approved
October 19 PayPlace cover is bundled locally, unchanged, at
`assets/books/before-you-call-me-difficult.jpeg`. No network image or paid
service is required. Author permission to feature the book was provided by Dave.

## Behavior

- Neighborhood → Annie’s House opens the library above the family wall.
- Permanent shelf A1 stays labeled with Emma’s name and book title. Borrowing
  removes the cover from that slot, leaving a visible empty space and borrower
  label. Return restores the cover to A1.
- Choose You, Bobbie, Westley, Tate, Chapo, Annie or Daddy. A single copy cannot
  be checked out twice. Each borrow and return enters the checkout ledger.
- The same cover appears beside the canonical portrait in reading cards.
  Borrowed books follow Bobbie, Westley, Tate and Chapo into their rooms;
  Annie, Daddy and the user read at the library. Tapping a reading card opens
  details and the external Amazon link, https://a.co/d/09P0VmeL.
- This is an illustrated neighborhood lending feature, not an in-app ebook.
  The interface explicitly explains that the actual memoir is on Amazon.
- The first visit leaves the book on its shelf. On subsequent local calendar
  days, the reading circle starts with Bobbie, then Westley, Tate, Chapo,
  Annie, and a day back on the shelf. Additional catalog titles will rotate
  through successive circles. The app does not fabricate missed-day activity.
- Automatic loans return before the next rotation. Manual loans remain until
  returned. An explicit return leaves the book home for the rest of that day.
- App opening, foregrounding and a minute timer update the current local day.
  No background service or notification is required.
- Loans and the last 60 ledger events live in the existing encrypted plan and
  are included in its backups. Sample state stays separate from personal state.
  These are per-plan checkouts, not shared worldwide inventory.

## Validation

- `npm run check`: application source bindings pass.
- `npm test`: 153 tests pass, including daily rotation/manual-loan rules and
  an actual app flow covering duplicate taps, empty shelf artwork, mascot room
  reading, Amazon destination, relaunch persistence, exact return position,
  and unchanged financial balance.
- Expo iOS, Android and web bundle export is checked before source upload.

## Device review for the next native build

1. Open Annie’s House on a small phone and with enlarged text. Tap the cover,
   select Bobbie, and borrow. Confirm A1 is empty and labeled.
2. Visit Bobbie’s Boutique, tap her reading card, and open Emma’s book on Amazon.
3. Relaunch and unlock; confirm the checkout and ledger survived. Return the
   book and verify the cover reappears in A1.
4. Cross a local midnight or return on the next day to check the reading circle.
   A manual loan must stay with its chosen reader.
5. Verify a sample checkout does not alter the personal plan, and that a
   portable encrypted backup restores the loan and ledger.

This source update requires a new native build to reach TestFlight. A successful
source upload or bundle export is not confirmation of an Apple upload.
