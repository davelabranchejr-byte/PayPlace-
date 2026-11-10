# Build 59 — reviewed artwork corrections

Status: PayPlace 1.0.0 (59) was signed and successfully uploaded to Apple App Store Connect on November 10, 2026 at 13:38 UTC. Apple processing and tester availability have not been confirmed. This incremental release contains 33 reviewed corrections; the remaining artwork audit stays open.

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

Source binding checks passed in 126 application files. All 185 app tests passed after integration, including banking, budget, stored categories, subscriptions and portrait hotspots. Production iOS, Android and web exports completed successfully. A physical iPhone visual check is still needed on TestFlight.

## Release

The 33 reviewed corrections shipped as Build 59 through the existing iOS workflow. This is an incremental update to the colorful redesign already in Build 58, not the completed all-image cleanup. Keep the remaining 28 mascot scenes and branding review candidates tracked for a later pass.

- Source commit: `bd13264164f7f3a9553e2e8dc5e83c291d707e05`
- Merged artwork: [PR 29](https://github.com/davelabranchejr-byte/PayPlace-/pull/29)
- Release run: [42823455817](https://github.com/davelabranchejr-byte/PayPlace-/actions/runs/42823455817), completed successfully
- Expo submission: [b5cd6999-f886-4418-9fe5-bba1014ed8d0](https://expo.dev/accounts/pilotpay/projects/payplace/submissions/b5cd6999-f886-4418-9fe5-bba1014ed8d0)
- Upload confirmed by the release log: “Submitted your app to Apple App Store Connect!” and “Your binary has been successfully uploaded to App Store Connect!”
- Native archive and signing succeeded. The signed IPA was retained as the workflow artifact.
- Merged-source validation run [42823272253](https://github.com/davelabranchejr-byte/PayPlace-/actions/runs/42823272253): 126 source bindings, all 185 tests, and iOS/Android/web production exports passed.
- The beta tester script was updated for Build 59, including the remaining-artwork caveat.

Do not equate upload completion with Apple processing completion or external tester availability.
