# PayPlace artwork and branding review

Reviewed the Micropayments branch after the three payoff strategy corrections. The review followed image assignments in the app source, compared earlier approved assets and screened thumbnails of bundled scenes. It covered Home, Bills & Banking, Budget, Debt, Neighborhood, merchant categories, Calm Garden, Em’s Pet Spa, mascot rooms and the banking demo.

| Placement | Change |
| --- | --- |
| Home help | Daddy points to a paw-print easel. The artwork sits beside the help label. |
| Review my bills | Westley holds a bill checklist in his teal hoodie. The Sample Bills card has its original Westley mail carrier scene. |
| My debt plan | Tate studies the payoff map. The original Bobbie-and-Tate header stays on the Debt screen. |
| Payoff strategy guide | Tate on the debt climb illustrates the guide. Snowball uses Westley in the snow, Mixed uses the family snowplow, and Avalanche uses Tate sliding downhill. |
| Neighborhood | The Home shortcut uses the original illustrated neighborhood with the family by Annie. The bottom tab and living panorama depict the destination. The approved mascot navigation strip is back above the destination cards. |
| Navigation and utility controls | Back, remove, select, save and similar controls use their existing labels and icons. A shared control adds a painting only when the screen specifies one. A custom merchant category uses its own label, and the Other illustration belongs to Other. |
| Header and wordmark | The main header, onboarding, guides and Em’s Pet Spa share one wordmark treatment. The spa branding ribbon sits below the artwork. The banking welcome card uses its section heading with the main app brand above it. |
| New Home illustrations | The app positions the official rounded-square logo on the plain hoodie fabric at the intended badge location. Both use the same bitmap as the header, launcher and web favicon. |

The approved bitmap is `assets/branding/payplace-icon.png`. SHA-256 matches the documented approval, `82d6c2c7d9d64bf946726e9ab096e608ddef1562e40c3b242b468231cd7fa406`. The easel paw and bill checklist mark are illustrations of ordinary symbols.

Some intentional previews show the same scene as the feature they open, including the spa scene picker, Micropayments, and the individual payoff method screens. The preview corresponds to that same destination. Portrait crops use the established mascot references.

## Embedded artwork still under review

The older images have their marks painted into the scenes. The winter payoff scenes include older P variants on clothing, snowballs and flags. Seasonal welcomes and Annie’s door scenes have baked-in title and door marks. Billiam’s hats and mailbags, the library and spa scenes, the banking façade and older mascot clothing also have variants. Artwork in those groups still needs individual inspection and corrections that preserve the approved scene and mascot features. The fur and paw repairs tracked in `BUILD_59_ARTWORK_AUDIT.json` remain open.

## New artwork briefs

- `feature-review-bills-westley.png` uses Westley’s original snow illustration as the likeness reference. Keep his white fur and paws, upright ears and dark eyes. Show Westley with a BILLS clipboard and checkmark in a teal hoodie, against transparency. The app supplies the hoodie badge.
- `feature-how-home-works-daddy.png` uses the original Budget header as the Daddy likeness reference. Match his glasses, buzz cut and beard. Show him wearing a brown jacket over his teal hoodie, pointing to a wooden easel with a teal paw. The app supplies the hoodie badge.

The worktree changes have no signed TestFlight release or physical-device layout verification.

## Locked logo follow-up

The supplied 613 × 682 close-up aligns to the central region of the full 1024 × 1024 master. The app uses the framed master for the launcher, favicon and standalone wordmark. The registered clothing patches and bank sign use the same source and crop its outer white margin at render time.

| Screen or placement | Finding |
| --- | --- |
| Main app header, setup, guides, and the banner below Em’s artwork | The same square master and shared wordmark render on each surface. |
| Bills & Banking tab | The bank façade had a purple check and a different paw. The building now has a clear sign area with the approved mark in the original location. The original illustration is retained in the repository. |
| Premium banking panels | Embedded panels use the app header above them. Standalone panels use the shared compact wordmark. |
| How Home Works and Review My Bills | Their app badges resolve to the same master at the intended clothing position. |
| Micropayments | The existing approved Westley scene uses a four-color patch. The purple box’s paw and envelope’s green check are part of the illustration. The painted patch remains part of the source scene. |
| Device lock | The full-screen illustration contains an older masthead, a simplified stained-glass door emblem and clothing patches. It also contains the unlock button graphic, so the unlock hotspot and visual alignment need checking with any revised asset. |
| Snowball, Mixed and Avalanche | The three requested original scenes are assigned correctly. Their illustrated winter clothes, snowballs and snowplow flags still contain legacy P marks. |
| Annie’s door, seasonal welcomes, and the Calm Garden return | The door, title panels and garment patches carry painted variants. Day and night artwork require matched treatment. |
| Billiam and manual bill entry | The postman hat, bag, envelopes and Tate’s convertible include simplified marks. |
| Bank welcome, spa scrapbook, and older portraits | Some illustrated signs, uniforms, towels and accessories still contain brand variants. The seaside spa scene’s paw on the bucket is a decorative symbol. |

The bank façade edit brief was to remove the old logo from the teal sign area while preserving the building, roof, awning, plants, lighting and transparent square frame. The app supplies the approved mark in that area. Legacy painted branding listed above is still open.

## Duplicate-illustration follow-up

| Placement | Illustration assignment |
| --- | --- |
| Debt | Bobbie and Tate explain the descending debt chart on How Debt Works. The compact Back to Bills & Banking and security controls use navigation symbols. Snowball keeps Westley with the snowball, Mixed keeps the snowplow, and Avalanche keeps Tate on the snowy slope. The selected method’s guidance keeps its text and comparison without displaying the same winter scene a second time on the page. |
| Micropayments | The Bills shortcut shows Billiam logging a coin against a bill envelope. The Debt shortcut shows Westley with his purple coin box. The tracker uses the approved Westley scene. |
| Billiam | The Add a Bill sheet shows the original upcoming-bills illustration. The main Billiam bill-tools card, Neighborhood mailbox card and individual tasks keep their own art. |
| Purchases | Daddy sorts receipts on the Budget entry, and Bobbie examines purchase tags on the Banking entry. Shopping, Clothing, Groceries and the other categories show their individual illustrations in the picker. |
| Home and Budget | One Small Step has a stepping-stone vignette. Budget’s Until Next Payday shows Daddy planning his paycheck. Home’s shortcut uses its original family payday scene. |
| Neighborhood | Annie’s Care and Annie’s Porch have new illustrations dedicated to their actions. The porch’s spa shortcut uses the original illustrated bubble-bath treehouse, separate from Em’s main exterior card. The bottom tab has its own three-home illustration and the living panorama remains the Neighborhood page scene. The rotating Westley, Tate and Bobbie posters use scenes separate from the Bills actions. |
| Onboarding | The pay-frequency question shows Westley with a calendar, bank-linking shows Bobbie with a bank card and linked rings, and the notes prompt shows the original post-office scene. Each question has a distinct source or mascot portrait crop. |
| Plaid Banking | The shortcut shows a miniature teller counter with a card and plaid swatch. Daddy and Tate remain in the actual bank welcome illustration. |

New Billiam and Westley patches use the approved master. The new illustrations preserve Bobbie’s grey tabby markings and Westley’s white paws. Shared brand marks, portraits, the scene-picker thumbnails that display a selected picture, and the photo viewer that enlarges the selected picture still refer to their intended sources. A feature’s standalone detail can show its original scene even when a shortcut previews it.

The source inventory resolved 211 referenced image files. Every file had a distinct SHA-256 hash. Placement checks also covered shared source files, since a hash comparison alone cannot find two controls pointing to the same file. The native component tests verify the three strategy images, the Debt help illustration, both Micropayments entries, both purchases entries, the Neighborhood tab and distinct onboarding scenes.
