// Original, in-universe PayPlace stories. These are mascot-authored shelf books,
// not descriptions or excerpts from Emma Acly's memoir.
export const MASCOT_BOOKS = Object.freeze([
  {id:'annie-room-for-everyone',title:'Room for Everyone',author:'Great Annie',
    paragraphs:[
      'Annie noticed a new neighbor standing outside her red door. “I haven’t got everything sorted out,” the neighbor whispered. Annie’s leaves rustled. “Then you have come to exactly the right place.”',
      'She pulled another chair toward the table. There was no test at the doorway, no perfect budget to present. Just a little space to breathe and someone willing to listen.',
      'Before the neighbor left, Annie stitched one more square into the family quilt. Belonging, she knew, was something a home could make room for every day.'
    ]},
  {id:'bobbie-fabulous-budget',title:'Fabulous on a Budget',author:'Bobbie',
    paragraphs:[
      'Bobbie had an invitation, a wardrobe full of possibilities, and absolutely no intention of pretending that her spending money was endless. “A little imagination, darling,” she announced, “is always in season.”',
      'She paired an old favorite with a bright ribbon and a borrowed sparkle. Then she checked her plan before choosing a treat she could enjoy without worrying about tomorrow.',
      'When Chapo asked whether her outfit was new, Bobbie blew him a kiss. “The confidence is fresh. The jacket is a classic.”'
    ]},
  {id:'westley-gentle-step',title:'One Gentle Step',author:'Westley',
    paragraphs:[
      'Westley looked at the long path and sat down beside it. Some days, even a familiar walk could feel like too much. Annie did not hurry him. She waited until he was ready.',
      'He chose one stepping stone. Then another. At the next bend he stopped for a head scratch, and nobody called the pause a failure.',
      'Back home, Westley left a note beside the door: “You can begin with the next little thing. We will still be here when you need a rest.”'
    ]},
  {id:'tate-small-wins',title:'Small Bites, Big Wins',author:'Tate',
    paragraphs:[
      'Tate decided that today he would tidy the whole neighborhood. He found a sock, forgot the plan, and proudly carried the sock to Daddy instead.',
      '“What if we start with just this corner?” Daddy asked. Tate considered the corner. It was a very respectable corner. One little job later, there was room for everyone’s shoes.',
      'Tate celebrated with an enormous lick. Big plans could wait a moment. He had finished one useful thing, and that deserved a wag.'
    ]},
  {id:'chapo-treats-waiting',title:'Treats Worth Waiting For',author:'Chapo',
    paragraphs:[
      'Chapo wrote “emergency snacks” on a shopping list. Bobbie raised an eyebrow. “Wasn’t yesterday’s bag also an emergency?” Chapo chose to admire the curtains.',
      'Together they made room for a small treat in the week’s plan. Chapo picked his favorite, put the others back, and saved a little for another day.',
      'That evening he shared the treats at Annie’s table. Waiting had not made the reward smaller. It had given him something lovely to look forward to.'
    ]},
  {id:'billiam-neighborhood-letters',title:'Letters from the Neighborhood',author:'Billiam',
    paragraphs:[
      'From his mailbox outside Annie’s house, Billiam watched the neighborhood wake up. There were important envelopes to sort, but the first delivery was a note that simply said, “Thinking of you.”',
      'He took the long way past Westley’s den, Tate’s favorite corner, and Chapo’s kitchen. Every doorstep held a different story. Every story mattered.',
      'By sunset his mailbag was lighter and his heart was full. He tucked a final message into Annie’s door: “Thank you for giving us all an address that feels like home.”'
    ]},
  {id:'daddy-everyone-belongs',title:'Everyone Belongs Here',author:'Daddy',subtitle:'Money without shame.',
    paragraphs:[
      'I wanted a place I would want to come back to. Somewhere I could take a breath, look at what was in front of me, and feel welcome while I figured out the next step.',
      'That became the neighborhood. A place for the worried ones, the hopeful ones, the ones starting over, and the ones who do not yet know where to begin. You do not have to earn your chair at Annie’s table.',
      'Your balance is a number. It is not a measure of your worth. A mistake does not make you a mistake, and asking for help does not make you less capable.',
      'We can learn as we go. One little step, a bit of laughter, and room for each other. Everyone belongs here. Money without shame.'
    ]},
]);

// Positions are in the full square library illustration, including Westley
// and Chapo cuddling in their floor bed below the shelves.
export const LIBRARY_VISIBLE_HEIGHT = 1;
export const EM_SHELF_BOUNDS = Object.freeze({left:0.375,top:0.535,width:0.223,height:0.27});
export const MASCOT_SHELF_BOUNDS = Object.freeze([
  {left:0.09,top:0.265,width:0.155,height:0.237},
  {left:0.251,top:0.265,width:0.124,height:0.237},
  {left:0.379,top:0.265,width:0.114,height:0.237},
  {left:0.496,top:0.265,width:0.126,height:0.237},
  {left:0.626,top:0.265,width:0.132,height:0.237},
  {left:0.762,top:0.265,width:0.148,height:0.237},
  {left:0.219,top:0.54,width:0.156,height:0.265},
]);
export function shelfTarget(bounds) {
  return {left:`${bounds.left*100}%`,top:`${bounds.top/LIBRARY_VISIBLE_HEIGHT*100}%`,
    width:`${bounds.width*100}%`,height:`${bounds.height/LIBRARY_VISIBLE_HEIGHT*100}%`};
}
