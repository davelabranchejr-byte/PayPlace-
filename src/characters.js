// Canon confirmed by Dave on 2026-09-29. Bobbie is a TABBY, never a tuxedo.
// Reuse original reference pixels; outfits, wigs, hair and nails may change.
const family = require("../assets/characters/references/family-reference.jpg");
const guide = require("../assets/characters/references/character-guide-legacy.jpg");
const neighborhood = require("../assets/characters/references/neighborhood-reference.jpg");

function reference(source, width, height, crop, label) {
  return Object.freeze({ source, width, height, crop, label });
}

export const portraits = Object.freeze({
  daddy: reference(family, 1402, 1122, [510, 20, 330, 480], "Daddy, smiling in his teal PayPlace hoodie"),
  westley: reference(guide, 1024, 1536, [14, 330, 240, 355], "Westley, the white West Highland Terrier in his PayPlace hoodie"),
  bobbie: reference(family, 1402, 1122, [760, 300, 365, 465], "Bobbie, the green-eyed brown tabby with glamorous hair and her pink PayPlace outfit"),
  tate: reference(guide, 1024, 1536, [515, 340, 240, 345], "Tate, the tiny tan Chihuahua with oversized ears in his yellow hoodie"),
  chapo: reference(guide, 1024, 1536, [770, 325, 245, 360], "Chapo, the round orange tabby wearing his teal hoodie and beanie"),
  annie: reference(neighborhood, 712, 1536, [260, 95, 230, 315], "Great Annie, the welcoming oak tree with a bark face and flowers around her face"),
  together: reference(family, 1402, 1122, [0, 0, 1402, 1122], "Dave with Westley, Tate, tabby Bobbie and orange tabby Chapo in the PayPlace family foyer"),
});

export const CHARACTER_LOCK = Object.freeze({
  version: "2026-09-29-tabby",
  bobbie: Object.freeze({ species: "brown tabby cat", eyes: "green", fixed: ["face", "fur markings", "body proportions"], interchangeable: ["wigs", "hair", "nails", "outfits", "accessories"] }),
  westley: Object.freeze({ species: "white West Highland Terrier" }),
  tate: Object.freeze({ species: "tan Chihuahua" }),
  chapo: Object.freeze({ species: "orange tabby cat" }),
  annie: Object.freeze({ species: "oak tree", face: "warm grandmotherly bark face" }),
});
