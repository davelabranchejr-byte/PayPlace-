const residents = {
  annie: { name: 'Great Annie', job: 'Librarian', home: 'Annie', homeLabel: 'Annie’s house', rest: 'Keeping the porch light on', shifts: [
    [8, 17, 'Annie', 'Neighborhood Library', 'Helping neighbors find a book'],
  ] },
  westley: { name: 'Westley', job: 'Chaos coach', home: 'Westley', homeLabel: 'Westley’s den', rest: 'Resting in his den', shifts: [
    [7, 9, 'Calm', 'Calm Garden', 'Making morning rounds with Tate', 'bridge'],
    [9, 13, 'Calm', 'Calm Garden', 'Helping neighbors take a breather'],
    [13, 16, 'Spa', 'Em’s Pet Spa', 'Checking in on spa guests', 'right'],
    [16, 19, 'Annie', 'Annie’s house', 'Returning a library book', 'left'],
  ] },
  tate: { name: 'Tate', job: 'Tiny wins coach', home: 'Tate', homeLabel: 'Tate’s hangout', rest: 'Calling it a day', shifts: [
    [8, 9, 'Calm', 'Calm Garden', 'Making morning rounds with Westley', 'bridge'],
    [9, 11, 'Tate', 'Tate’s hangout', 'Cheering on small steps'],
    [11, 14, 'Billiam', 'Billiam’s mailbox', 'Helping with the mail route', 'left'],
    [14, 18, 'Chapo', 'Chapo’s kitchen', 'Picking up a snack', 'bridge'],
  ] },
  bobbie: { name: 'Bobbie', job: 'Boutique owner', home: 'Bobbie', homeLabel: 'Bobbie’s boutique', rest: 'Putting the wigs to bed', shifts: [
    [9, 12, 'Bobbie', 'Bobbie’s boutique', 'Setting out new looks'],
    [12, 15, 'Spa', 'Em’s Pet Spa', 'Dropping off a styling kit', 'right'],
    [15, 18, 'Bobbie', 'Bobbie’s boutique', 'Putting together her cabaret look', 'bridge'],
    [18, 21, 'Cabaret', 'Bobbie’s Cabaret', 'Hosting the show'],
  ] },
  chapo: { name: 'Chapo', job: 'Neighborhood baker', home: 'Chapo', homeLabel: 'Chapo’s kitchen', rest: 'Napping after a long day of snacks', shifts: [
    [6, 10, 'Chapo', 'Chapo’s kitchen', 'Baking the morning buns'],
    [10, 13, 'Annie', 'Annie’s house', 'Delivering fresh buns', 'left'],
    [13, 18, 'Chapo', 'Chapo’s kitchen', 'Back in the kitchen', 'right'],
  ] },
  daddy: { name: 'Daddy', job: 'Budget coach', home: 'Daddy', homeLabel: 'Daddy’s house', rest: 'Unwinding at home', shifts: [
    [8, 11, 'Budget', 'Budget Corner', 'Helping neighbors make a plan', 'right'],
    [11, 14, 'Billiam', 'Billiam’s mailbox', 'Checking in on Billiam', 'left'],
    [14, 16, 'Annie', 'Annie’s house', 'Stopping by the family gallery', 'bridge'],
    [16, 19, 'Daddy', 'Daddy’s house', 'Reading neighborhood mail'],
  ] },
  billiam: { name: 'Billiam', job: 'Mail carrier', home: 'Billiam', homeLabel: 'Billiam’s mailbox', rest: 'Sorting tomorrow’s mail', shifts: [
    [7, 10, 'Billiam', 'Billiam’s mailbox', 'Taking the morning mail out', 'left'],
    [10, 13, 'Annie', 'Annie’s house', 'Dropping off mail for Annie', 'bridge'],
    [13, 17, 'Spa', 'Em’s Pet Spa', 'Delivering the afternoon mail', 'right'],
  ] },
  em: { name: 'Em', job: 'Pet groomer', home: 'Spa', homeLabel: 'Em’s Pet Spa', rest: 'Settling the spa guests in', shifts: [
    [8, 12, 'Spa', 'Em’s Pet Spa', 'Grooming the morning guests'],
    [12, 14, 'Calm', 'Calm Garden', 'Taking a garden break', 'bridge'],
    [14, 19, 'Spa', 'Em’s Pet Spa', 'Grooming guests and getting towels ready', 'right'],
  ] },
};

export function neighborhoodResidents(date) {
  const hour = date.getHours();
  // Weekend mornings start an hour later, while the evening rounds end on time.
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const morningDelay = weekend && hour < 12 ? 1 : 0;
  const current = Object.entries(residents).map(([id, resident]) => {
    const shift = resident.shifts.find(([start, end]) => hour - morningDelay >= start && hour - morningDelay < end);
    const [, , destination, place, activity, path] = shift || [0, 0, resident.home, resident.homeLabel, resident.rest];
    return { id, name: resident.name, job: resident.job, destination, place, activity, path };
  });
  return current.map(resident => ({
    ...resident,
    companions: current.filter(other => other.id !== resident.id && other.destination === resident.destination)
      .map(other => other.name),
  }));
}

export function neighborhoodWalkers(residents, date) {
  const hour = date.getHours();
  const outdoor = residents.filter(resident => resident.path);
  if (!outdoor.length) return [];
  const start = (date.getDate() + hour) % outdoor.length;
  const rotated = [...outdoor.slice(start), ...outdoor.slice(0, start)];
  const groups = rotated.map(resident => rotated.filter(other =>
    other.path === resident.path && other.destination === resident.destination));
  const featured = groups.find(group => group.length > 1) || [];
  return [...featured, ...rotated.filter(resident => !featured.includes(resident))].slice(0, 3);
}

export function seasonalNeighborhoodWeather(date) {
  const month = date.getMonth();
  const slot = (date.getDate() * 7 + month * 11 + Math.floor(date.getHours() / 3) * 3) % 17;
  if ([11, 0, 1].includes(month)) {
    if (slot < 5) return 'snow';
    if (slot < 9) return 'cloudy';
  }
  if (slot < 3) return 'rain';
  return slot < 6 ? 'cloudy' : 'clear';
}

export const neighborhoodWeatherNames = { clear: 'Clear skies', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow' };
export const isNeighborhoodLeafSeason = date => [8, 9, 10].includes(date.getMonth());
