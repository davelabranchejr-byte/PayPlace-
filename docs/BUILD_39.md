# Build 39: contained illustrations and consistent character artwork

Spa scenes and Tate's small-step illustration now use an explicitly bounded image inside a clipped frame. Native image dimensions can no longer override the card size. Images remain fully visible using contain mode and their natural aspect ratios.

Em's exterior is the white cottage with gray slate roof, teal sign and pink striped awnings from the approved spa-day illustration. Home's spa entrance and the bottom Spa tab use the same transparent cottage asset.

Daddy's facial likeness is updated in all eight displayed assets identified by a visual audit of the app's 145 referenced image assets: feedback, budget header, add-debt family scene, payday snapshot, family wall (including the crayon drawing), family reference/portraits, art studio and security screen. His real reference photograph informs his closely buzzed hair, dark rectangular glasses, salt-and-pepper beard and smile; the approved cartoon references determine the illustration style. Original scene dimensions and portrait coordinates are preserved. Real reference photos are not included in the repository.

Chapo's animated treats now converge by their centers on a measured point inside his open mouth. Coordinates account for contain-mode scaling and any letterboxing, and the decorative treat box does not scale with the user's text size. Quiet Mode and reduced-motion behavior remain intact.

Generated artwork used the built-in Imagegen tool. The exact prompts are in `docs/BUILD_39_ARTWORK_PROMPTS.json`.

Validation: source binding checks, app tests including spa/Tate bounds and shared exterior source, treat trajectory tests across six frame sizes, and iOS/Android/web exports. Native device visual verification remains necessary after installing the build.
