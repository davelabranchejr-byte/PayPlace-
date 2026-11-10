# PayPlace logo audit — October 17, 2026

## Result

Standalone application logos are now unified on the approved full square master. The entire visual experience is **not yet logo-consistent**: some illustrations and reference portraits have different emblems baked into their pixels. These are recorded below, not silently marked fixed.

## Current source

Audited the Build 49 source at `e7a25e2ac63cd55d88df6ea4093ad4e5c19aec87` on `ux/compact-money-pages`, including the Cabaret, private owner inbox and random question glass. The repository's default `main` branch is older and was not used as the fix base.

## Approved master

`assets/branding/payplace-icon.png` has precisely the same decoded RGB pixels as Dave's supplied `DE560EB8-A067-4A3E-B4B4-8BE74F39BEF5(3).jpeg` (1024 × 1024). SHA-256 of the PNG: `82d6c2c7d9d64bf946726e9ab096e608ddef1562e40c3b242b468231cd7fa406`.

The full mark is the dimensional white P, white paw and turquoise checkmark, on the turquoise upper-left, yellow upper-right, purple lower-left and coral lower-right rounded square. Keep `Money without shame.` unchanged.

## Applied corrections

| Surface | Previous asset | Current source |
| --- | --- | --- |
| Main header on every primary page | Tight portrait JPEG crop | Shared full master |
| Onboarding brand component | Tight portrait JPEG crop | Shared full master |
| Neighborhood Bank welcome card | Tight portrait JPEG crop, rectangular frame | Shared full master, square frame |
| Banking/premium header | Tight portrait JPEG crop, rectangular frame | Shared full master, square frame |
| Banking/premium feature-card badges | Tight portrait JPEG crop, rectangular frame | Shared full master, square frame |
| iOS/Android launcher icon | Approved full master | Already correct |
| Web favicon | Approved full master | Already correct |

`src/brand.js` is the shared application asset and accessibility label. All standalone logo components import it. Removed the retired JPEG and the unused trailing-dot duplicate `src/PayPlaceBrand.js.` so future edits cannot accidentally choose either alternate.

## Artwork screening — unresolved

Inventoried 168 non-reference raster assets and screened contact sheets for embedded branding. Contact sheets identify drift; they do not establish that every tiny patch is pixel-correct. No illustration pixels were changed by this correction. Native video frames and App Store listing media were not verified.

Known examples and groups requiring a separate, careful asset pass:

| Group / examples | Observed variation | Required treatment |
| --- | --- | --- |
| Debt strategy art: `857054EA-5272-487D-BDD7-1F4ABE1F9DCA.png`, `IMG_3610.png`, `debt-snowball-westley-cropped.png`, `debt-avalanche-tate-cropped.png`, `debt-mixed-snowplow.png` | Simplified P/circular symbols on masks, clothing, snowballs and flags | Replace actual brand marks with the master, or remove decorative emblems; preserve mascot poses and scene |
| `annie-red-door-village.png`, `annie-red-door-village-night.png`, `neighborhood-autumn.png` | Generated title-logo/door emblems | Compare enlarged title and door details, preserve Annie and original scene |
| `annie-welcome-home-*.png` | Circular door/hat and costume marks | Check all six seasonal versions, preserving each original composition |
| `billiam-canonical.png`, `nav-post-office.png`, `sample-bills-westley-mailman.png`, `snapshot-upcoming-bills-billiam.png` | Circular or simplified logos on hats, satchels, envelopes and mailbox | Correct brand emblems without disturbing the envelope face, text or hands/paws |
| `bills-tate-convertible.jpg`, `manual-mode-tate-convertible.png` | Simplified vehicle and clothing badges | Preserve the car and Tate while correcting actual brand placements |
| `header-*.png`, `snapshot-*.png`, `savings-goals-button-chapo.png`, `daddy-neighborhood-feedback.png` | Mixed circular/simplified clothing and object marks | Inspect enlarged; use unchanged master pixels for brand placements |
| `bobbie-pearl-*.png`, `chapo-pearl-*.png`, `tate-pearl-*.png`, `westley-pearl-*.png` | Repeated circular P badges and generated garment patterns | Check every portrait variant; retain wigs, outfits, faces and proportions |
| `extra-paycheck-chapo-*.png` | Generated P marks on clothes, screens and mugs | Check both scene variants and their animated usage |
| `feature-first-win.png`, `feature-payment-history.png`, `feature-quiet-mode.png`, `feature-until-payday.png` | Embedded header logos and smaller item emblems | Correct title and secondary placements, retaining all text/layout |
| `plaid-bank-daddy-tate.png`, `plaid-bank-neighborhood.png`, `nav-plaid-bank.png` | Generated building sign and costume emblems | Verify signs and clothing; standalone UI badges are already fixed |
| `spa-*.png` | Generated title logos, garment and product labels | Inspect each full scene and thumbnail without cropping text |
| `lock-annie-fort-knox-family.png`, `security-screen-approved.png` | Door/hat/title emblems baked into scenes | Preserve approved lock-screen layout and original illustration |
| Reference crops in `src/characters.js`, the family gallery and smart mirror | Generated clothing or mirror emblems are inherited from original reference images | Treat approved character references carefully; do not regenerate faces |

General paw prints, checks, heart icons, ordinary P-shaped decorative objects and credit dials are not automatically brand logos. Review them in context. Do not replace a generic icon merely because it resembles part of the brand.

Do not claim these embedded illustrations are repaired by placing an extra logo elsewhere on the card. A corrected standalone badge does not cover a different logo inside the illustration.

## Validation

- All 98 application source files passed the existing binding check.
- All 124 app tests passed, including the updated master-asset checksum lock.
- iOS, Android and web production exports completed successfully.
- No release or TestFlight upload is included in this change.
