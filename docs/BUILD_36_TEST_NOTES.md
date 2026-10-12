# PayPlace Build 36 — compact feature artwork

Fixes the oversized and cropped Home button illustrations reported from Build 35.
React Native Image applies bundled asset width and height before the supplied style;
a percentage width and aspect ratio did not override the asset's intrinsic height.

The four cards and feature-screen headers now use a clipped, measured View frame.
The child image renders only after the frame is measured, receives explicit numeric
width and height, and uses contain mode so the whole original scene fits. Card images
have a 112-point height cap and feature headers a 220-point cap. Captions remain free
to wrap and grow with larger accessibility text. The cards retain their separate
original illustrations and all four existing button routes.

Validation: source binding checks pass; all 98 tests pass, including the native image
intrinsic-size regression at 320, 393 and 430-point phone widths and feature-screen
reopen checks. Expo iOS/Android/web bundles compile. Native device visual confirmation
is still required; the browser could not open the local preview because its URL policy
blocks file URLs. This does not affect the native sizing checks or release workflow.

Device check after installing 1.0.0 (36):
- Home shows each entire illustration inside its card, above the correct caption.
- All four cards open the correct feature and their header art stays compact.
- Scroll Home and reopen feature screens; images must not become full-size or overflow.
- Try larger text. Captions should remain readable and buttons reachable.
- Existing personal entries and Quiet Mode preferences remain saved.

Release through the existing Xcode/Expo workflow from the validated release branch,
with validate_only=false, signing_only=true and build_number=36. This update does not
merge the release branch into main or add/change any financial behavior.
