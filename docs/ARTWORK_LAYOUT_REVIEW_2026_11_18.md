# PayPlace artwork layout review

DRAFT - approval and native verification pending

Date: November 18, 2026
Baseline: release/ios-75 at 0bb83574c38b017d6fb75e2cb853f27950cc2e7d
Review branch: review/app-wide-artwork-layout

Build 75, the live deployment, artwork files, release configuration and release workflows were not changed. No merge, deployment, new native build submission, or Apple submission was initiated.

## Validation

- Binding/source check passed for 152 application source files.
- Automated suite: 212 passed, 0 failed.
- Web bundle export passed.
- iOS JavaScript/Hermes bundle export passed; this is not an Xcode build or native UI test.
- Browser layout frames: 375 x 667, 390 x 844, 430 x 932. Footer boundary checks passed on My Finances, Budget and Bills at all three sizes (nine checks).
- Artwork assets and app/release configuration have zero changes relative to the baseline.

## Affected shared components

| Component | Proposed correction |
| --- | --- |
| MascotTouchable / MascotPressable | Do not paint the glossy white rim over explicitly integrated artwork. Use the artwork mode rather than relying on component function names that an export can shorten. |
| IllustratedButton | In-flow artwork at its natural aspect ratio; dedicated dark caption below; remove clipping height/ratio overrides and overlay logo badge. |
| FittedArtwork + artwork-ratio | Derive missing frame proportions from native or web asset dimensions; continue measuring both rendered image dimensions. |
| Header + NeighborhoodNav | Larger responsive top actions; four equal-width persistent tabs fit within a reserved footer, with complete square artwork and separate labels. |
| NavigationTiles, FeatureLinks, ExpandableSection | Contain complete images; retain natural asset proportions. My Finances explicitly keeps two shortcut columns at standard text sizes; narrow screens and large text may stack. |
| My Finances summary and shortcuts | Compact the Safe to Spend summary with its complete proportional scene beside the text. Restore Westley Review my bills and Tate One small step side by side immediately below; keep Bobbie and Chapo shortcuts below them. |
| CaptionedArtwork, CalmGardenScene, BillScanner | Remove negative caption overlap. Story and scanner labels occupy their own area below the scene. |
| InteractiveRoom | Retain original hotspot coordinates; move room labels into a separate tappable action list below the illustration. Map labels remain on the map. |
| SafeToSpendArtwork, SeasonalWelcome | Use each original scene's proportions; remove the extra Safe-to-Spend badge overlay. |
| LaunchEssentials | Natural scene proportions; remove the maximum image-height cap; contain the complete feature artwork. |
| BilliamHome, Micropayments, PetSpa | Remove forced landscape crops from mailbox, payment and scrapbook shortcuts. |
| PremiumResilienceHub, FacebookNeighborhood, TesterFeedback | Remove forced landscape crops from premium and community cards. |
| ContainedIllustration, SubscriptionDetective, NeighborhoodNav | Use shared native/web dimension resolution. This also allows the Smart Mirror preview to render. |
| NeighborhoodLibrary | Contain the existing full shelf image; preserve its square scene and book hotspot coordinates. |
| App onboarding | Enlarge Annie's welcome illustration proportionally; size question portraits naturally; put the mascot badge below the artwork. |
| App spa/sample-bill/payoff cards | Use the intended atlas cell proportions for the spa shortcut and complete original scenes for bill and payoff cards. |

## Coverage

| Area | Evidence and limits |
| --- | --- |
| Home map and menu | Captured at 375 x 667, 390 x 844, 430 x 932; map has a swipe/full-map mode. Panorama tap ambiguity remains open. |
| Westley, Annie, Daddy, Bobbie, Tate, Chapo | Room views captured at all three sizes. Original artwork and coordinates retained; labels moved below rooms. |
| Library and family wall | Captured at all three sizes. Source/automated checks also cover borrowed books, shelf alignment and quilt behavior. |
| Spa and Smart Mirror | Captured at all three sizes. Scrapbook card layout corrected in shared source; every visit/look state still needs native review. |
| Budget, bills, My Finances and debt | Captured at all three sizes. Navigation, opening forms and expansion controls were exercised. Westley and Tate shortcut actions rechecked. The complete first row fits above the footer at 390 x 844 and 430 x 932; the 375 x 667 view scrolls naturally. |
| Banking and six premium panels | Bank demo, Round Up, Life Happens, Bill Shock, Falling Behind, Money Watch and Credit Center captured at all three sizes; all data shown is fictional. |
| Purchases and remembered categories | Settled remembered-category view captured at all three sizes. Shared button fix covers account filters and category entry cards. |
| Cabaret, plans and security | Captured at all three sizes. Video playback, camera/scanner, authentication and native permission prompts are outside browser verification. |
| Add-bill and scanner sheets | Captured at all three sizes. Separate label and close-button artwork verified. Monthly-calendar and quilt views were opened; native settled modal captures remain pending. |
| Onboarding and seasonal art | Annie's enlarged welcome captured after scrolling. Current autumn welcome observed. Other questions/seasons inspected in source; not all were screenshot-certified. |

## Remaining exceptions

| Item | Status |
| --- | --- |
| Native iPhone verification | OPEN. This workspace runs Linux. Browser frames and an iOS JavaScript/Hermes export do not verify native UIKit layout, notches, the home indicator, the keyboard, Face ID, or physical touch behavior. No native simulator/device screenshots were produced. |
| Panorama hit testing | OPEN. Two automated panorama taps reached adjacent destinations (Boutique/Cabaret and Calm/Spa). Their menu routes worked. The panorama hit geometry was preserved; investigate and verify on iPhone before sign-off. |
| Art Studio | OPEN. Build 75 contains historical Art Studio artwork/docs but no standalone reachable Art Studio screen was found in its current route implementation. The requested studio cannot be certified as an accessible screen in this baseline. |
| Full state coverage | OPEN. Main sections and many nested panels were exercised, but this is not certification of every scroll position, every data-dependent state, every modal, all seasonal dates, or all onboarding questions on three native iPhones. |
| Intentional cropping/masks | RETAINED. Character-atlas cell extraction, small framed portrait masks, animation sprite strips, quilt textures and the blurred lock-screen backdrop are intentional. The primary lock illustration remains contained. |
| Navigation tradeoff | CORRECTED AFTER FEEDBACK. The previous draft made the footer wider than the screen. Four flexible columns now stay inside the available width; no footer horizontal scrolling. All four tabs fit without overlapping at 375, 390 and 430 px. Main-page scrolling remains available. |

The issue is not signed off as fixed. Review the proposed layout first; resolve open native/hit-testing checks before applying it to a release.
