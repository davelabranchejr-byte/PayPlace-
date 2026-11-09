# Build 57 — large illustrated action tiles

The purchase category tiles are the reference for action controls throughout PayPlace: a large unchanged illustration above a readable label. Standard action artwork now uses a 112-point frame rather than the previous 52-point frame, and wraps below it at every screen width. Narrow controls bound the full image to the available width instead of cropping it. Ordinary action tiles have room for the art and caption rather than using a small picture beside text.

Feature shortcuts on Home, Bills & Banking, and Neighborhood now use 128-point artwork above centered titles and descriptions. Billiam’s task illustrations and neighborhood building tiles use 144-point image areas; the cabaret card displays its original poster in a 190-point area above the caption. Record payment, Review, and Remove wrap into larger bill/debt action tiles. Existing artwork selections, image assets, routes, saved financial records, and action behavior remain unchanged.

Header help and security controls use larger 64-point art while staying within the header. The four fixed navigation tabs have larger art frames and retain the single-line Neighborhood label. Small close controls and calendar dates retain their bounded geometry. The purchase sheet respects the iPhone safe area above its scrolling controls.

All six portrait regions explicitly remain transparent scene hit targets. Regression checks exercise the real shared controls and family wall to ensure no action image or decorative rim covers a face. Story taps still work. The approved encouragement note content and handwritten treatment remain intact.

Validation: all 185 app tests passed, source bindings were checked in 126 files, and production iOS, Android, and web bundles passed. The final native layout still needs a physical iPhone visual check.
