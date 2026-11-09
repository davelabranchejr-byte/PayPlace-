export const PAST_SPA_SCENES = [
  { id: 'welcome', title: 'Paws, bubbles & budgets', caption: 'Em has a warm welcome, fresh towels, and a little love for every neighbor.', action: 'Say hello to Em', reply: 'Em: Come on in, sweetheart. There is always room for you here.', motion: 'bubbles', ratio: 1312 / 1199 },
  { id: 'westley', title: 'Westley’s top-secret makeover', caption: 'A fake beard, a bald cap, pants, and shoes. Westley is Daddy today—and Em is sworn to secrecy.', action: 'Keep Westley’s secret', reply: 'Westley: Pssst… our secret! Daddy will never suspect a thing.', motion: 'sparkle', ratio: 1 },
  { id: 'chapo', title: 'Chapo’s cookie cleanup', caption: 'Em’s giant dryer has a big job. Cookie crumbs are not a conditioner, Chapo.', action: 'Ask about the cookies', reply: 'Chapo: Those were emergency snacks. I may need more after my blow-out.', motion: 'dryer', ratio: 1 },
  { id: 'bobbie', title: 'Bobbie’s meowgarita moment', caption: 'Cucumbers, jacuzzi bubbles, and milk with tuna juice and a crushed kitty-treat rim. Self-care, darling.', action: 'Compliment Bobbie', reply: 'Bobbie: A fabulous day starts with a fabulous attitude. And a treat-rimmed glass.', motion: 'bubbles', ratio: 1312 / 1199 },
  { id: 'tate', title: 'Tate’s bath negotiations', caption: 'Em is ready for bath time. Tate’s legs are working perfectly fine—and he has thoughts.', action: 'Cheer Tate on', reply: 'Tate: One little paw at a time? Fine. But I am keeping my dignity—and my tongue!', motion: 'bubbles', ratio: 1312 / 1199 },
];

export const SPA_SCENES = [
  {id:'slumber',title:'Pajamas, paws & bedtime stories',caption:'Em has the blankets ready. Westley is freshly groomed, Tate brought his favorite cozy look, and Chapo has already claimed the softest spot.',action:'Settle in with the family',reply:'Em: You are safe here. Make yourself comfortable.',motion:'sparkle',ratio:4/3},
  {id:'grooming',title:'Fresh trims, fresh starts',caption:'Grooming is part of the stay. Em tidies Westley’s coat while the others take their turn being pampered.',action:'Admire Westley’s fresh trim',reply:'Westley: Same little me. Considerably less fluff.',motion:'sparkle',ratio:4/3},
  {id:'fort',title:'The extremely important blanket fort',caption:'Tate supervises construction. Westley arranges cushions. Bobbie claims the suite. Chapo blocks the entrance by falling asleep.',action:'Peek inside the fort',reply:'Tate: Building inspection passed. Treat delivery is still pending.',motion:'sparkle',ratio:4/3},
  {id:'ocean',title:'A seaside spa adventure',caption:'An illustrated ocean daydream: Em keeps an eye on the sandcastle crew while Bobbie enjoys a mud mask and seaweed wrap. Chapo has reserved the shade.',action:'Ask Bobbie about the seaweed wrap',reply:'Bobbie: Darling, I ordered a coastal retreat. Naturally, the coast came with treatments.',motion:'bubbles',ratio:4/3},
];
export const SPA_VISITS = [
  {id:'slumber-party',title:'Our slumber-party stay',description:'Grooming, bedtime stories, a blanket fort and a seaside daydream.',current:true,scenes:SPA_SCENES},
  {id:'spa-day',title:'Spa-day memories',description:'Westley’s secret makeover, Chapo’s cookie cleanup, Bobbie’s meowgarita and Tate’s bath negotiations.',current:false,scenes:PAST_SPA_SCENES},
];
export function nextSpaScene(index, direction = 1, scenes = SPA_SCENES) {
  return ((index + direction) % scenes.length + scenes.length) % scenes.length;
}
export function spaCanPlay({ paused, reducedMotion, active, focused }) {
  return !paused && !reducedMotion && active && focused;
}
