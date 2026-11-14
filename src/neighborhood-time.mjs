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
  const day = date.getDate();
  const year = date.getFullYear();
  const today = Date.UTC(year, month, day);
  const thanksgiving = 22 + (4 - new Date(Date.UTC(year, 10, 1)).getUTCDay() + 7) % 7;
  if ((month === 11 && day >= 30) || (month === 0 && day <= 2)) return 'new-year';
  if (neighborhoodSeasonalCameos(date, false).includes('bunny')) return 'easter';
  if (month === 6 && day <= 7) return 'independence-day';
  if (today >= Date.UTC(year, 10, thanksgiving - 5) && today <= Date.UTC(year, 10, thanksgiving + 3)) return 'thanksgiving';
  if (month === 9) return 'halloween';
  if (month === 11) return 'winter-holidays';
  if (month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}

export const neighborhoodWelcomeLocations = {
  spring: 0.54, summer: 0.22, autumn: 0.72, winter: 0.83,
  halloween: 0.89, 'winter-holidays': 0.83, easter: 0.54,
  'independence-day': 0.22, thanksgiving: 0.72, 'new-year': 0.54,
};

// Gregorian Easter Sunday (Meeus/Jones/Butcher algorithm).
function easterSunday(year) {
  const golden = year % 19;
  const century = Math.floor(year / 100);
  const leapCenturies = Math.floor(century / 4);
  const correction = Math.floor((century - Math.floor((century + 8) / 25) + 1) / 3);
  const moon = (19 * golden + century - leapCenturies - correction + 15) % 30;
  const weekday = (32 + 2 * (century % 4) + 2 * Math.floor((year % 100) / 4) - moon - year % 4) % 7;
  const offset = Math.floor((golden + 11 * moon + 22 * weekday) / 451);
  const date = moon + weekday - 7 * offset + 114;
  return Date.UTC(year, Math.floor(date / 31) - 1, date % 31 + 1);
}

const millisecondsPerDay = 86400000;

export function neighborhoodSeasonalCameos(date, dark = isNeighborhoodNight(date)) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  if (month === 11 && day >= 20 && day <= 25 && dark) return ['santa'];
  if (month === 9 && day >= 25 && dark) return ['witches', 'cashper'];

  // Compare calendar dates, so a daylight-saving change cannot shift a cameo window.
  const today = Date.UTC(year, month, day);
  if (month === 2 || month === 3) {
    const fromEaster = (today - easterSunday(year)) / millisecondsPerDay;
    if (fromEaster >= -7 && fromEaster <= 1) return ['bunny'];
  }
  if (month === 10 || (month === 11 && day === 1)) {
    const firstWeekday = new Date(Date.UTC(year, 10, 1)).getUTCDay();
    const thanksgiving = 22 + (4 - firstWeekday + 7) % 7;
    const fromThanksgiving = (today - Date.UTC(year, 10, thanksgiving)) / millisecondsPerDay;
    if (Math.abs(fromThanksgiving) <= 3) return ['turkey'];
  }
  return [];
}
