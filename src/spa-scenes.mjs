export const SPA_SCENES = [
  { id: 'welcome', title: 'Paws, bubbles & budgets', caption: 'Em has a warm welcome, fresh towels, and a little love for every neighbor.', action: 'Say hello to Em', reply: 'Em: Come on in, sweetheart. There is always room for you here.', motion: 'bubbles', ratio: 1312 / 1199 },
  { id: 'westley', title: 'Westley’s top-secret makeover', caption: 'A fake beard, a bald cap, pants, and shoes. Westley is Daddy today—and Em is sworn to secrecy.', action: 'Keep Westley’s secret', reply: 'Westley: Pssst… our secret! Daddy will never suspect a thing.', motion: 'sparkle', ratio: 1 },
  { id: 'chapo', title: 'Chapo’s cookie cleanup', caption: 'Em’s giant dryer has a big job. Cookie crumbs are not a conditioner, Chapo.', action: 'Ask about the cookies', reply: 'Chapo: Those were emergency snacks. I may need more after my blow-out.', motion: 'dryer', ratio: 1 },
  { id: 'bobbie', title: 'Bobbie’s meowgarita moment', caption: 'Cucumbers, jacuzzi bubbles, and milk with tuna juice and a crushed kitty-treat rim. Self-care, darling.', action: 'Compliment Bobbie', reply: 'Bobbie: A fabulous day starts with a fabulous attitude. And a treat-rimmed glass.', motion: 'bubbles', ratio: 1312 / 1199 },
  { id: 'tate', title: 'Tate’s bath negotiations', caption: 'Em is ready for bath time. Tate’s legs are working perfectly fine—and he has thoughts.', action: 'Cheer Tate on', reply: 'Tate: One little paw at a time? Fine. But I am keeping my dignity—and my tongue!', motion: 'bubbles', ratio: 1312 / 1199 },
];

export function nextSpaScene(index, direction = 1) {
  return ((index + direction) % SPA_SCENES.length + SPA_SCENES.length) % SPA_SCENES.length;
}

export function spaCanPlay({ paused, reducedMotion, active, focused }) {
  return !paused && !reducedMotion && active && focused;
}
