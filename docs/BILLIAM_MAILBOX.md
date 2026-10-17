# Billiam’s mailbox

Billiam has a seventh primary tab, with a readable, horizontally scrollable tab strip. Home keeps Annie’s gentle greeting before the money summary. The Bills add sheet retains Tate → Billiam → Westley order, with Billiam’s shortcut opening his new tab. Neighborhood and Annie’s visit also link to his mailbox outside her red door.

Seven original illustrated buttons open one tool at a time: photo scanner, PDF/screenshot import, photo-stack review, bill comparisons, recurring-bill recognition, bill breakdowns, and household planning. Each button uses a measured 100-point full-width frame with both native image dimensions explicitly supplied and `contain`. Text is below the artwork and has no fixed maximum height. The mailbox header is bounded to 144 points. No image is zoomed or cropped to fill its button.

## Working behavior

- Scans/imports suggest editable values and never add a bill automatically. Each PDF is one bill; a multi-file queue supports individual review, errors and skipping. Limits are 12 files, 12 PDF pages and 20 MB per file. Files are processed locally and owned temporary copies are cleaned up.
- A small local Expo module uses PDFKit on iOS and PdfRenderer on Android. Digital iOS PDF text is read directly; image-only iOS pages and Android pages are rendered for existing on-device ML Kit OCR. This needs a new native binary.
- Comparison readings preserve reviewed amounts, dates, account endings and breakdowns. Matching requires the same normalized company and same account ending; unknown accounts are not silently merged with known ones. Comparison only states recorded differences and does not invent a reason. Deleting a bill removes its comparison readings.
- Optional breakdown fields include current charges, past-due balance, minimum payment, late fees and other fees. These can overlap; the app never adds them together or substitutes their sum for the total due.
- Recurring templates remember company/account/cadence after an explicit action. The next date preserves month-end anchors; the amount stays blank for review. A matching saved due-date entry can be explicitly updated. No automatic entry creation or payment occurs.
- Household members can take responsibility for a whole bill or split it equally with exact-cent allocation. Bills begin private. An explicit preview lists selected financial fields and responsibility splits before password-protected export. Received snapshots require decryption and review, remain separate from the personal budget, and reject duplicate/older copies. This is encrypted file exchange, not live account syncing. Exported copies cannot be recalled.

## Validation and remaining release checks

Automated coverage includes amount/date parsing, itemized changes, account matching, earlier-reading retention/deletion, month-end recurrence, PDF text/OCR combination, partial queue failures, cache cleanup, private-by-default household sharing, exact-cent splits, export whitelist, stale received plans, authenticated encryption, wrong passwords, tampering, per-bill review, repeated-save protection, all seven tool images at phone widths 320/390/430, and real-app navigation.

Run the binding check, all tests and all-platform Expo production exports. Expo autolinking must register PayPlaceBillDocuments on both Apple and Android. Linux checks do not validate Swift/Kotlin compilation, PDFKit/PdfRenderer operation, camera/photo permissions, or physical-device accessibility. Validate those in a new native build before distribution. Update hosted privacy and store disclosures for ML Kit metrics as already noted in BILL_SCANNER.md. This PR does not submit TestFlight or publish a hosted service.
