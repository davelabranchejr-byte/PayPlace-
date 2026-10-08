export function isNeighborhoodNight(date = new Date()) {
  const hour = date.getHours();
  return hour >= 20 || hour < 6;
}
