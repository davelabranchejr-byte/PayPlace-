# Current update — November 19, 2026

Westley’s Modern Life · Episode 1 has been added to TV Shows, Recommended Shows,
search, favorites and resume. The combined source includes At a Glance and the
artwork corrections. All 228 tests, the 159-file source check, and web/iOS
JavaScript exports pass. This is the approved Build 77 source candidate, not a
signed native build. See BUILD_77_TV_CANDIDATE.md for the current evidence and
publication boundary. The historical review below describes the original draft.

---

# PayPlacePerView review draft

PayPlacePerView opens from Daddy’s TV in Daddy’s house. The TV is a separate control below the room illustration, so existing artwork and hotspots remain visible. It opens a full-screen browsing experience with PayPlace branding, a full-width featured banner using existing Daddy artwork, horizontally scrollable poster rows, search, Home/Shows/Commercials/My List filters, Recommended Shows, Most Viewed and Continue Watching. All banner and poster artwork keeps its original proportions with labels and controls below it.

The initial collection has two episodes and four commercials from Dave’s existing files. Poster frames preserve the supplied picture proportions. The player uses native controls and `contentFit="contain"`, starts after a user selects a video and it becomes ready, pauses on backgrounding or exit, and offers retry if a title cannot load. Finished videos leave Continue Watching; reopening one starts at the beginning. Personal watch counts, favorites and progress are stored in the existing protected plan record and restored with it. Sample-neighborhood changes remain separate from the personal plan.

## Sharing and the TV quilt square

Every catalog video has a Share video action. Instructions appear before opening the phone share sheet. The native implementation prepares only the selected bundled MP4, gives its share copy a PayPlacePerView filename, and opens compatible apps through the existing expo-sharing package. The temporary share copy is cleaned up; the bundled original is untouched. Unsupported sharing and failures show a retryable message. The web review downloads the bundled video for manual upload; it does not pretend to publish a social post.

Facebook Page mentions cannot be forced by the generic OS share sheet. The prompt asks the person to type @PayPlace and select the official Page in Facebook, and suggests optional #PayPlace / #PayPlacePerView hashtags. No automatic Page tag, caption, Facebook login, or verified publication is claimed. Meta's documented Share Dialog offers a hashtag but no Page-mention parameter: https://developers.facebook.com/documentation/sharing/reference/share-dialog .

After returning from the share sheet or starting a download, the person may confirm “I posted it” to earn the new embroidered TV square. Opening instructions or cancelling them never awards it. The OS sheet resolving is not proof of publication. This is a self-reported milestone, like the existing community squares; there is no Facebook tracking or API verification. It is awarded once, persists with the personal quilt, and sample exploration cannot award a personal square. The quilt grid and chair overlay include the new additional patch; existing artwork is unchanged. The chair's new tile is a proportional overlay and still needs native visual review.

Recommended Shows uses the two current series, prioritizing saved titles then less-watched titles. Most Viewed explicitly means **your most-watched videos**, uses only actual personal session counts, and has an honest empty state. One watch is recorded after more than a second of advancement beyond the starting position, once per player session. Buffering or repeated time events do not inflate the count. There are no fabricated global rankings. Shared community rankings would require a separate backend.

## Source

- `src/PayPlacePerView.js`: TV entry, browsing screen, and video player.
- `src/payplace-per-view.mjs`: catalog, safe saved-state normalization, favorites, progress and search/filter rows.
- `src/per-view-sharing.native.js` / `.js`: native MP4 share sheet and web download.
- `src/quilt-milestones.mjs`, `src/BelongingQuilt.js` and the new `quilt-shared-per-view.png`: once-only self-confirmed video-sharing reward.
- `src/PerViewMedia.js` and `assets/per-view/`: bundled videos and original-frame posters.
- `src/NeighborRooms.js` and `App.js`: entry from Daddy’s house and protected persistence.
- `tests/payplace-per-view.test.mjs` and `tests/app-launch.test.cjs`: collection validation, persistence, search, resume, completion, background pause and navigation checks.

## Verification

- Source bindings: 157 application files passed.
- Automated suite: 219 passed, 0 failed. Six focused sharing/quilt tests also passed, including three additional tests introduced after the full-suite run (222 distinct passing tests across the runs).
- Web export passed; iOS JavaScript/Hermes export is a bundle check, not an Xcode build or native UI test.
- Actual browser views inspected at 375 x 667, 390 x 844, and 430 x 932. Redesigned home, poster rows, personal watch ranking and sharing instructions were inspected; the small-screen layout remained scrollable with readable controls. Native sharing itself cannot be verified in a desktop browser.
- Daddy’s episode and Bobbie’s commercial played with the whole video contained. Continue Watching resumed Daddy’s episode near the saved position; favorites stayed available when leaving and reopening the library. Personal-plan favorites survived relaunch in the app integration test.
- The existing room illustration, artwork corrections, and navigation were retained. No dependency, release configuration, App Store workflow or Build 75 change was made.

## Review boundary

The work is isolated on `review/payplace-per-view`, based on artwork-review commit `43338c0f0857c4b5030978a8388e22474d238bef`. It has not been merged, deployed or submitted to Apple. Build 75 remains at `0bb83574c38b017d6fb75e2cb853f27950cc2e7d`.

Native iPhone share-sheet destinations, cancellation, tagging, temporary-file handoff, safe areas, audio interruption behavior, VoiceOver focus, native full screen and hardware navigation still require device/TestFlight verification before release approval. Original videos retain any burned-in text; this version does not add new subtitle tracks. The starter catalog is bundled (about 40 MiB of video), so additional videos increase the app download size. A remote catalog can be a later change if the collection grows.

## Current publication status

The complete working implementation is committed locally and included in the private review package. The public GitHub branch currently contains only the collection README. Automatic approval review rejected uploading the six movies and their posters to the public repository because those files could be private. No rejected media upload was retried or redirected to another public host. Explicit approval to publish those six titles and posters to the public repository is required before synchronizing the implementation there. The private package is an overlay for base commit `43338c0f0857c4b5030978a8388e22474d238bef`, with all changed source files, media and tests.

## New quilt artwork

The only newly generated artwork is `assets/characters/quilt-shared-per-view.png`, created with the built-in image tool. Existing illustrations were not regenerated or replaced. Prompt: “New square PayPlace Belonging Quilt reward patch for sharing a PayPlacePerView video; reference material/style only; padded hand-embroidered fabric, purple square, teal retro TV with coral accents and a gold play triangle, stitched border, front-on, all artwork visible, no text or logo.” The original generated output remains intact.

## Logo palette correction

PayPlacePerView now uses the canonical shared `payplaceColors`: turquoise #11B8A7, yellow #FFE344, purple #8435CB and coral #FF6464 against the existing navy #111831. Home/Shows/Commercials/My List use the four brand colors, with a white selected outline. Play is yellow, sharing turquoise, My List purple with coral saved accents; row markers and poster borders repeat the same palette. Artwork and geometry are unchanged.

Palette-only validation: source bindings and web export passed after this change. The cloud browser rejected access to the preview frame under its URL policy; no workaround was attempted. The palette update has not been visually reverified. Screenshots from the previous review are retained under before-palette/ and show the prior colors. No behavior or artwork was changed by the palette commit.
