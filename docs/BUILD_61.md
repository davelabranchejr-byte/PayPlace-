# Build 61 — readable feature banners

This follow-up retains Build 60’s vivid shared styling, original artwork assignments and financial behavior. It gives captions a dedicated row beside their chevron, uses a 96-point illustration for typical phone-width banners, and stacks the full 128-point artwork above a full-width caption on narrow frames or when system text is enlarged.

Neighborhood stays on one line in the regular landscape layout, with a readable minimum font scale. Enlarged system text and narrow layouts can wrap freely instead of clipping. No image pixels change.

Validation: binding checks passed in 126 source files; all 190 app tests passed, including narrow-frame and enlarged-text regressions; production iOS, Android and web exports passed. Release verification remains pending. A physical iPhone visual check remains required. The older fur and embedded-logo audit remains open as recorded in BUILD_59_ARTWORK_AUDIT.json.

Release status: not yet built or uploaded to Apple. Use the existing signed release workflow for 1.0.0 (61) and record the receipt here after completion.
