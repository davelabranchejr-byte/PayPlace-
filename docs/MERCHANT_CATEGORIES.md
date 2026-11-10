# Remembered merchant categories — November 8, 2026

Prepared on top of the Build 53 source, `fix/consistent-payplace-logo` at
`70a6c645ba618c9c3a0da376573550e032c7f69a`. The repository's main branch is older.
Local implementation branch: `feat/remembered-merchant-categories`.

## Behavior

Budget and Plaid Banking open the same illustrated category manager. Users can
record a manual purchase against an account label, tap its category, and choose
just that purchase, future matches on that account, or future matches across
their accounts. An optional checkbox includes earlier matching purchases.
Specific account rules take priority over all-account rules. Explicit one-time
choices and exact-cent splits take priority over both. Past purchases are left
alone unless requested; deliberate exceptions remain intact.

Shopping shows Bobbie juggling designer bags. Clothing shows her surrounded by
clothes in a dressing room. Groceries shows adult Daddy carrying overflowing
bags of pet food, treats, litter and groceries. The purple, coral, turquoise and
yellow controls use text, a border and a checkmark for selection. All three
scenes are measured, contained illustrations, with no mascot cropping. Other
categories expand on demand; users can also name their own. Save remains in a
fixed footer, with validation errors beside it. Rules can be edited or forgotten;
the most recent change can be undone while the sheet remains open.

Preferences, account labels, purchases and exceptions live in the existing
encrypted finance record. The sheet waits for the vault write before confirming
a personal change; a failure retains the draft. Backups validate and preserve
the new data. Personal and demo records remain separate. Category records do
not alter balances, bills, debt minimums or Safe to Spend.

The demo includes deliberately categorized Costco and Target purchases in
fictional checking and card accounts, plus four months of recurring streaming,
music and fitness charges. These are the shared records used by spending
insights, Subscription Detective and the demo bank. The personal plan starts empty.

## Bank integration boundary

The Sandbox connection currently reports accounts and balances; it does not
fetch transaction histories. The full Bobbie demo now ingests fictional
Plaid-shaped transaction updates through the same normalizer available to a
future server importer. The personal category interface states that purchases
are manual and bank transaction imports are still to come. No live importer
is claimed here.

`mergeCategoryPurchases` is a tested adapter for the future importer. Callers
must supply stable transaction/account IDs, a canonical merchant name (and
provider merchant ID when available), date, original category and integer USD
cents. It preserves explicit choices across refreshes and carries exceptions
from a pending transaction ID to its posted replacement. It rejects an account
change or a revised amount that no longer matches a saved split, rather than
silently destroying the user's split. A future import UI must request review
of those conflicts and must pass through the same encrypted save path.

`applyBankSnapshot` accepts a combined account-balance snapshot and complete
transaction update; it reconciles posted replacements before processing removed
pending IDs, preserving the user's choices. It rejects partial `has_more`
responses. A server must collect the entire paginated update and handle a
changed-update restart before supplying a final snapshot. The adapter does not
request or retain a Plaid access token. Primary reference:
https://plaid.com/docs/transactions/transactions-data/

Merchant-name fallback only normalizes case, Unicode and whitespace. It does
not group Costco Gas with Costco or use broad substring matching. A specific
provider entity rule wins over a name fallback within the same account scope.
Rules belong to the local plan, not a shared global merchant database. Clearing
device data removes them; encrypted backup restore can recover them. They do
not sync to a server or between devices automatically.

## Validation and release

Automated checks cover account precedence, future versus past purchases,
one-time exceptions, split cent totals, conservative merchant matching,
pending-to-posted refresh, edit/forget, deletion sequence continuity, encrypted
reopen, backup restore, actual category-sheet selection, undo, failed saves and
retry. The full existing suite and application binding checks are also run.
Production bundle exports cover iOS, Android and web. These exports are not
signed native builds and do not establish physical-device behavior.

The local preview browser could not reach the development server. Before a
TestFlight release, check 320–430 point phone widths, large text, VoiceOver and
TalkBack announcements, keyboard visibility in new-purchase/split forms,
fixed-footer reachability, image loading, and complete illustration framing.
The GitHub integration rejected code writes with `Resource not accessible by
integration`. Publication uses the authenticated GitHub browser on branch
`feat/neighborhood-banking-update-2026-11-08`. No TestFlight upload is claimed.

## Artwork provenance and prompt set

Created with the built-in image generation tool. The existing Bobbie Darlending
show portrait supplies her face and style; the Daddy/Tate bank scene supplies
Daddy's identity only. New art assets:

- `assets/categories/bobbie-shopping.jpg`
- `assets/categories/bobbie-clothing.jpg`
- `assets/categories/daddy-groceries.jpg`

Final illustrations are optimized 768-pixel JPEG copies for the mobile project.
No existing character or branding asset is replaced. No logo is generated.

Shopping prompt: original square PayPlace category illustration; one fully
clothed tabby Bobbie Darlending with auburn-red curled wig, sparkling tiara,
green eyes, purple sequined gown and jewels, gleefully juggling five luxurious
teal/coral/yellow/purple shopping bags in an airborne arc. Full head, paws, tail
and bags, safe margins, warm polished dimensional storybook style, soft purple
background, readable at mobile size, no other characters, words, logos or
watermark.

Clothing prompt: same Bobbie identity and polished storybook style, in a cheerful
luxurious dressing room amidst ridiculous mounds of colorful dresses, blouses,
shoes and hangers, holding a teal dress while wearing her purple gown. Mirror
and coral velvet curtain, safe margins, bright coral/turquoise/yellow/purple,
clear mobile silhouette, no other characters, words, logos or watermark.

Identity correction applied to both Bobbie scenes: change only her visible fur
from brown/tan to cool silver grey with black tabby stripes; preserve white
muzzle, pink nose, green eyes and exact facial structure. Add a small sparkling
diamond tiara atop the auburn-red wig. Preserve pose, gown, accessories, props,
composition, background, framing and other colors.

Groceries prompt: original square PayPlace category illustration with Daddy
alone, a lean adult human man in his 40s with very short salt-and-pepper buzz
cut, short neat beard, black rectangular glasses and adult proportions; blue
hoodie and open brown jacket. He carries three overflowing grocery bags with
pet food, dog/cat treats, cat litter with a cat silhouette, carrots, banana and
baguette; loving slightly overwhelmed smile, turquoise background and bright
yellow/coral/purple accents. Full head, arms, hands and bags within safe margins,
no pets, other characters, text, logos or watermark.
