# Build 58 — colorful illustrated redesign

Prepared from the current beta source, `ae9c71f8376acc859cdcb7f9883d54d0597e30e1` on `fix/consistent-payplace-logo`.

## Implemented

- Wide shared action controls place the original 112-point illustration beside a readable caption. Controls under 300 points wide stack their contents to avoid squeezing or clipping.
- Feature shortcuts use the original 128-point illustrations in wrapping landscape banners with mint, yellow, purple or coral frames.
- All four persistent navigation tabs have colored surfaces and larger artwork; Neighborhood stays on one line.
- Em’s active scene displays the approved reusable PayPlace branding in a separate banner below the image. No new branding overlaps the scene.
- Existing transparent family portrait hotspots remain undecorated and retain their behavior.
- Bobbie’s character guidance and story text now specify grey tabby fur, while allowing outfit and wig variations. The Calm header has a precise grey-fur and logo correction that preserves her auburn wig, clothing, pose and transparent background.

## Validation

- Source binding checks passed in 126 application files.
- All 185 app tests passed, including banking, stored categories, subscriptions, library persistence, portrait hotspots and responsive action controls.
- Production iOS, Android and web exports passed.
- A physical iPhone visual check is still required; no claim of device verification is made.

## Artwork audit findings

The current beta contains older brown-tabby Bobbie artwork. Identified examples include the original family reference, Bobbie pearl images 01–16, the Smart Mirror, debt and savings headers, Premium gala and clubhouse, and older spa scenes. Newer shopping, clothing and cabaret assets depict grey tabby Bobbie. The Calm header is corrected in this change; the remaining historical images have not been redrawn and are not certified consistent.

Standalone UI branding uses `src/brand.js` and the approved `assets/branding/payplace-icon.png`. Older painted scenes contain embedded logo variants; sharing a UI logo does not correct pixels inside those scenes. Those variants remain an artwork follow-up. This build must not be described as a completed all-image mascot/logo correction.

## Release status

A public branch, `feat/build58-colorful-redesign`, was created from the current beta. Upload of the changed files was blocked by automatic approval review pending fresh explicit user confirmation for the payload and public destination. No redesign source files have been uploaded, no PR has been merged, and no Build 58 iOS archive has been started or submitted.

After publication is authorized, upload the reviewed files, compare them with the local versions, merge into `fix/consistent-payplace-logo`, and dispatch the existing `release-ios-expo.yml` workflow with build_number `58`, signing_only `true`, validate_only `false`. Verify the final workflow’s Apple submission result and report Apple processing separately from TestFlight availability.
