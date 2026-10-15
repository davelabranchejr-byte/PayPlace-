// Seasonal US daylight presentation hours; uses local clock, no location access.
const DAYLIGHT = [[450,1020],[420,1080],[420,1140],[390,1170],[360,1200],[330,1230],
  [330,1230],[360,1200],[390,1140],[420,1110],[420,1020],[450,1020]];
export function isNeighborhoodNight(date = new Date()) {
  const [dawn,dusk] = DAYLIGHT[date.getMonth()];
  const minutes = date.getHours()*60 + date.getMinutes();
  return minutes < dawn || minutes >= dusk;
}
export function neighborhoodWelcomeTheme(date = new Date()) {
  const month = date.getMonth();
  if (month === 9) return 'halloween';
  if (month === 11) return 'winter-holidays';
  if (month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}
