# Build 59 — artwork correction draft

Status: work in progress. Build 59 has not been built or submitted to Apple. Build 58 remains the latest confirmed Apple upload.

## Reviewed corrections

33 illustrations have passed a visual review and are integrated into the app. These include Bobbie portraits 01–16, the spring welcome, family reference, debt/savings headers, selected purchase categories and action illustrations, the cabaret and Subscription Detective clubhouse, family wall, Add Debt, payment history, Until Payday and one spa scene.

Bobbie has grey-and-black natural tabby fur while her original wigs and outfits remain. Reviewed scenes preserve Westley’s white fur, Tate’s tan/cream fur and Chapo’s orange/cream fur, including paws and tails. Existing category symbols, hearts, stars and ordinary paw decorations remain. Existing PayPlace emblems in the reviewed mixed-brand scenes use the canonical P, paw and checkmark.

The family reference uses “Money without shame.” and retains its original 1402 × 1122 dimensions for the existing portrait crops. PNG corrections for older JPEG assets use explicit .png references; the original JPEG files remain unreferenced archives.

## Remaining work

The image service reported the Plus generation limit during this pass. Its stated reset is November 10, 2026 at 4:21 p.m. Eastern. Further image editing is blocked until generation is available again, unless Dave explicitly chooses the API fallback.

28 remaining mascot scenes require fur correction or a repair. Two generated candidates failed the paw-color review: Westley in First Win and Chapo in the autumn welcome. They are stored only under docs/artwork-review/needs-paw-correction and are not referenced by app code. Their original active assets remain pending correction.

The audit also lists standalone branding candidates. These require inspection before editing; an entry is not evidence that an image needs replacement. Retain artwork already using the approved logo. Do not add P logos to ordinary hearts, stars, paw decorations, category symbols, blank clothing or other objects.

See BUILD_59_ARTWORK_AUDIT.json for per-asset status and the prompts used. Continue from the saved branch rather than regenerating reviewed work.

## Validation

Source binding checks passed in 126 application files. All 185 app tests passed after integration, including banking, budget, stored categories, subscriptions and portrait hotspots. Production iOS, Android and web exports completed successfully. A physical iPhone visual check is still needed after the full artwork set is ready.

## Release

Draft only. Do not label this a completed all-image correction or submit Build 59 as the finished artwork update while the remaining review items are open.
