# Billiam’s bill scanner

Based on the Build 49 source, this adds an inline scanner card after Tate’s manual-add action and before Westley’s existing sample-bill review. Westley’s current entry still uses sample data; it is not relabeled as a live bank import.

The card uses `billiam-bill-scanner.png`, showing the approved envelope character posing while Daddy photographs him. `FittedArtwork` measures the full-width, 128-point image frame and supplies both native image dimensions with `contain`. Copy sits below the image, wraps naturally, and is not overlaid or vertically clipped. Camera/selection/review actions have 48-point minimum heights.

On native devices, Expo Image Picker captures or selects one image. Image Manipulator normalizes orientation/format to JPEG and bounds the longest side to 2,000 pixels. ML Kit reads Latin-script text locally. The parser conservatively suggests a vendor, labeled amount due, full US/ISO date and explicitly masked account last four digits. Ambiguous/missing values remain empty. No photo or full OCR text is persisted or uploaded by PayPlace. Owned temporary cache copies are removed in a finally block; original photo-library files are untouched.

Customers must review and explicitly add the bill. Invalid amounts/dates block saving. Matching name, amount and due date require a separate-bill confirmation. Canceling, a stale asynchronous result, permission denial and repeated save taps do not add bills. Web displays an honest native-only explanation; it does not simulate OCR.

## Native dependencies

This requires a new iOS/Android binary, not an OTA update or Expo Go. Camera permission is requested only for capture; microphone permission is disabled. iOS deployment target is 15.5 for ML Kit. Text recognition 5.0.1 pins an old core with unrelated test dependencies; the npm override selects core 5.0.0, whose iOS and Android source trees match core 3.1.0 byte-for-byte and whose package targets Expo SDK 54. Expo Image is explicitly pinned to the SDK 54-compatible version instead of allowing the core’s wildcard peer to pull SDK 58.

## Validation and release gate

Automated checks cover extraction, ambiguous/invalid values, whitelist-only persistence, duplicate detection, permission denial, cancellation, cleanup on success/failure, original-image preservation, editable review, repeated-save protection, requested entry order, and contained image dimensions across phone widths. Run `npm run check`, `npm test`, and the all-platform Expo export. Expo introspection verifies camera/photo messages and absence of a microphone message; Apple autolinking must include both RNMLKitCore and RNMLKitTextRecognition.

Before distribution, update hosted privacy information and App Store/Play disclosures for ML Kit operational metrics. A physical-device native build is still required to validate actual camera permissions, photo orientation, OCR accuracy, accessibility text sizes, and an end-to-end saved bill. Linux bundling and component tests do not establish iOS native compilation or camera operation. This change does not itself submit a TestFlight release.
