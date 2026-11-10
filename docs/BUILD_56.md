# Build 56 — clearer illustrated controls

Action buttons share a rounded, raised frame with a bright inner rim. Existing action illustrations are unchanged and render at 52 points instead of 30. Labels have a 17-point minimum with room to wrap, and narrow action buttons place the picture above the text. Small fixed controls retain compact artwork. Existing illustrated cards keep their pictures and layouts; painted scene hit targets retain their exact geometry. Pressed styles, selected states, disabled controls, and callbacks remain intact.

Purchase category illustrations use a square, contained frame instead of a 96-point image strip, with larger live text labels and a two-column layout. No artwork assets or category data are changed.

Bottom navigation uses larger illustrations, gives Neighborhood more width, and keeps that label on one line. Bills & Banking has an intentional break between its words rather than allowing a final letter to wrap on its own.

The PayPlace logo/name overlay has been removed from Em’s spa illustrations. Current stays, past visits, and the borrowed-book scene continue to use their original art. The app header retains its branding.

Validation: 183 app tests passed, including the actual app launch flows, saved financial records, purchase categorization, disabled and selected controls, narrow button layouts, pressed style callbacks, and painted hotspot geometry. Source binding checks and production platform bundles are also required before release. Web component preview rendering was unavailable in this environment; the native layout still needs an iPhone visual check.
