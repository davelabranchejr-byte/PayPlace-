# Build 61 — readable feature banners

This follow-up retains Build 60’s vivid shared styling, original artwork assignments and financial behavior. It gives captions a dedicated row beside their chevron, uses a 96-point illustration for typical phone-width banners, and stacks the full 128-point artwork above a full-width caption on narrow frames or when system text is enlarged.

Neighborhood stays on one line in the regular landscape layout, with a readable minimum font scale. Enlarged system text and narrow layouts can wrap freely instead of clipping. No image pixels change.

Validation: binding checks passed in 126 source files; all 190 app tests passed, including narrow-frame and enlarged-text regressions; production iOS, Android and web exports passed. Release verification remains pending. A physical iPhone visual check remains required. The older fur and embedded-logo audit remains open as recorded in BUILD_59_ARTWORK_AUDIT.json.

Release status: queued through the existing GitHub/Xcode/Expo workflow for 1.0.0 (61). It will start after the running Build 60 release finishes under the existing release concurrency setting. It has not yet been built or uploaded to Apple.

- Source: `2eeffccdfa82e13c288bbd6739dc98ac355837cb` (merged PR 31).
- Release: https://github.com/davelabranchejr-byte/PayPlace-/actions/runs/42837220619
- Build 60 release: https://github.com/davelabranchejr-byte/PayPlace-/actions/runs/42834277194

Record the native build, Expo submission and actual Apple upload result here after completion. Apple processing and tester availability require separate confirmation.
