export const libraryStocked = require('../assets/library/annie-library-stocked.png');
export const libraryAway = require('../assets/library/annie-library-away.png');
export const bobbieReadingEm = require('../assets/library/bobbie-reading-em.png');

// Every source is one complete painted scene. The book is already in the
// character's paws with scene lighting/perspective; no cover overlay is drawn.
const scenes = {
  bobbie:{source:bobbieReadingEm,ratio:1312/1199,label:'Bobbie holding and reading Emma Acly’s memoir in Em’s Pet Spa jacuzzi'},
  westley:{source:require('../assets/library/westley-reading-em.png'),ratio:1,label:'Westley reading Emma Acly’s memoir in his cozy den'},
  tate:{source:require('../assets/library/tate-reading-em.png'),ratio:1,label:'Tate holding Emma Acly’s memoir in his little reading nook'},
  chapo:{source:require('../assets/library/chapo-reading-em.png'),ratio:1,label:'Chapo reading Emma Acly’s memoir at his kitchen table'},
  annie:{source:require('../assets/library/annie-reading-em.png'),ratio:1,label:'Annie’s oak branches gently holding Emma Acly’s memoir in her library'},
  daddy:{source:require('../assets/library/daddy-reading-em.png'),ratio:1,label:'Daddy reclining on Annie’s couch reading Emma Acly’s memoir, with Bobbie, Westley, Tate and Chapo cuddled on him'},
};
export function readingArtwork(reader) {return scenes[reader] || null;}
