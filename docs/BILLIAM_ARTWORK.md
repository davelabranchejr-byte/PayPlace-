# Billiam artwork and town audit

Built-in image generation was used, with the approved Billiam, Daddy/family and Annie references. Project assets live in `assets/characters/`. All new task images are original, separate landscape scenes; the existing Daddy photo-shoot scanner image is retained.

## Final prompt set for task buttons

Shared prompt: dimensional PayPlace storybook illustration; cream envelope Billiam with face integrated in the flap, moustache/goatee, blue mailman hat/satchel/sneakers; Annie’s approved grandmotherly face integrated in the flower-covered oak; a rounded weathered teal mailbox with purple post, upright red flag, brass latch and white-flower vines to the right of Annie’s red front door. Full subjects/props inside frame; no interface, invented logos or lettering. Plain blue accessories avoid introducing a different brand mark.

| Asset | Distinct task scene |
| --- | --- |
| billiam-mailbox.png | Billiam peeking from his cozy mailbox home, shelves and warm lamp, Annie behind him. |
| billiam-import.png | Digital bill and screenshot moving from tablet/phone into a paper review tray. |
| billiam-batch.png | Billiam sorting a stack into check, pencil and skip trays. |
| billiam-compare.png | Two different bill sheets examined with a magnifying glass and a small fee marker. |
| billiam-recurring.png | Recognizing matching envelopes beside a repeat-arrow calendar. |
| billiam-breakdown.png | Separated bill puzzle pieces with charge, clock, warning and receipt symbols. |
| billiam-household.png | Daddy, Billiam and Westley choosing bills for one shared tray while keeping private folders closed. |

## Town scenes reviewed and updated

Common edit prompt: add only the matching mailbox at Annie’s visible front approach, preserve the original composition, season, lighting, existing text/logos and character identities; do not create a separate human Annie or replace the scene. Day/night panoramas place the mailbox at the left foreground approach to the treehouses. Seasonal welcomes place it beside the right edge of Annie’s front steps, keeping faces and speech bubbles visible. The small house atlas edit is limited to Annie’s tile.

| Scene(s) | Result |
| --- | --- |
| neighborhood-panorama-day/night.png | Mailbox visible at the same foreground approach in both lighting variants. |
| annie-red-door-village / -night.png | Mailbox beside the right side of the front steps. |
| annie-welcome-home-spring/summer/autumn/winter/halloween/winter-holidays.png | Mailbox added in all six seasonal welcomes, with seasonal lighting/snow as appropriate. |
| neighborhood-autumn.png; neighborhood-tabby.png | Mailbox included in the older town/front-door artwork as well. |
| neighborhood-building-tabs.png | Mailbox added beside Annie’s red door in her existing atlas tile. |
| lock-annie-fort-knox-family.png | Mailbox visible beside the front steps in the security scene. |
| security-screen-approved.png; feature-first-win.png | Matching mailbox added beside Annie’s main front door, preserving interface text and characters. |
| annie-front-door-mailbox.png | New front-door welcome variant including the mailbox, used for onboarding/foyer welcome art. The original canonical reference is retained unchanged for identity and portraits. |

Reviewed and retained: Annie’s two backyard scenes and all 16 Annie pearl illustrations show the rear garden, garden work, porch or campfire rather than the front-door approach. Plaid banking and spa images are interiors. The feedback scene shows Daddy’s workshop and a miniature village, not Annie’s front garden. The navigation-mascot strip has no town backdrop. The supplied neighborhood UI reference and family/canonical reference images remain reference originals rather than being rewritten as current town artwork.

Visual review confirms recognizable mailbox, readable original scene text, and unobscured character faces. These image edits do not complete the separate logo-drift audit for marks already baked into older artwork. The new task buttons use contained images with wrapping copy, and automated measured-layout tests cover their dimensions.

## Daddy identity audit

Reviewed all 181 character and reference images using a named contact-sheet inventory, with full-size inspection of ambiguous faces. Daddy’s canonical appearance is the man in `references/family-reference.png`: closely cropped salt-and-pepper hair, short neat salt-and-pepper beard, black rectangular glasses and familiar smiling face. The current family wall, budget/debt artwork, art studio, scanner photo shoot, household task and security screen already use that appearance. Capped seasonal/banking depictions retain their caps and short beards.

Corrected the two remaining curly-haired illustrations: `neighborhood-navigation-mascots.png` and `lock-annie-fort-knox-family.png`. Built-in identity-preserving edit prompt: change only human Daddy’s hair/beard to match the canonical reference; preserve glasses, face, pose, clothing, all other characters, props, mailbox and composition. Preserve the navigation strip’s transparent background. A second targeted correction restored Annie’s clean-shaven wooden face after a generation altered it accidentally; the final reviewed asset keeps Daddy’s corrected hair and beard.

Historical unused JPEG alternatives (`add-debt-family-budget.jpg`, `annie-family-wall.jpg`, `references/family-reference.jpg`) remain source history; runtime consumers use their corrected PNG counterparts. These legacy alternatives must not be selected for new UI or image-generation references. Interior views of payment history and payday planning do not show Annie’s exterior mailbox location and were retained.
