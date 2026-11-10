# Build 60 — bright buttons with distinct original artwork

Status: Build 60’s GitHub release and queued Expo submission were both cancelled with Dave’s approval on November 10, 2026. Its native archive had compiled and signed, but Apple upload was not confirmed. Build 61 supersedes this release.

Dave’s reference calls for bright turquoise, purple, yellow and coral; large rounded illustrated buttons; clear labels; and original artwork that fits each destination. The design intent is playful engagement with predictable navigation and readable information. Color is not a clinical treatment claim. Existing reduced-motion and privacy settings remain available.

## Changes

- Assign dedicated original scenes to 16 primary feature destinations. A broad label matcher previously sent multiple unrelated features to Bobbie’s browse illustration, a budget header or the yoga scene even when a purpose-specific original already existed.
- Preserve a feature’s artwork when an expandable section closes; closed sections no longer all become the generic browse image.
- Use vivid shared button fills and glossy rims throughout screens using the shared controls. Retain authored state colors, disabled behavior and portrait hotspot geometry.
- Enlarge the feature, neighborhood, Billiam and banking cards. Use navy headings, wrapping text, full-width rows and unobscured original art.
- Use destination artwork in the four bottom tabs instead of reusing feature/header scenes or the Facebook moving-day picture.
- Show Daddy’s suggestion-box artwork once in the feedback button, rather than injecting one copy and displaying another directly below it.
- Remove added logo overlays from banking feature artwork. The official app branding remains in the surrounding UI.

No image pixels were regenerated or edited in this change. All referenced illustrations are original bundled PayPlace artwork. Different destinations have different feature scenes; the same destination may retain its scene when linked from another screen. Small repeated operations such as Save and Close retain their established action illustrations.

## Artwork scope

`BUTTON_ARTWORK_AUDIT.json` records each feature label, old assignment, corrected assignment and asset hash. The 16 feature scenes have distinct filenames and distinct byte hashes. Billiam’s seven task scenes and the six banking feature scenes already use individual original illustrations and retain them.

This change fixes assignment and repetition. It does not finish the 28 older mascot scenes and remaining embedded-brand review items tracked in `BUILD_59_ARTWORK_AUDIT.json`. Original fur/logo limitations remain in those assets; do not describe all historical artwork as corrected.

## Validation

- Source binding checks pass in 126 application files.
- All 188 tests passed, including destination/click behavior, a distinct-artwork regression, collapsed-section artwork stability and vivid-surface text contrast.
- Production iOS, Android and web exports passed.
- The supplied reference and the selected original source illustrations were inspected. Browser policy prevented opening the local component preview; no claim of a rendered-browser or physical-iPhone visual check is made. TestFlight device verification is still required.

## Release

The existing signed release workflow is running for 1.0.0 (60).

- Source: `d268e89a05bf3f4ef0fe398a236e204400c85693` (merged PR 30).
- Release: https://github.com/davelabranchejr-byte/PayPlace-/actions/runs/42834277194
- Expo submission: https://expo.dev/accounts/pilotpay/projects/payplace/submissions/4d753210-ee87-4f74-8bdc-a1bc4b12dd20
- Native archive and signing succeeded. GitHub run 42834277194 concluded cancelled. Expo submission 4d753210-ee87-4f74-8bdc-a1bc4b12dd20 shows Canceled.
- Build 61 follows with the responsive label refinement; see BUILD_61.md.

No Apple upload receipt exists for this cancelled release. Follow Build 61 for the final release result.
