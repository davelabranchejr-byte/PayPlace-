export const NEIGHBORHOOD_DESTINATIONS = [
  { id: 'Home', label: 'Home', color: '#6550AF', tile: 0 },
  { id: 'Finances', label: 'My Finances', color: '#A52167' },
  { id: 'Spa', label: 'Em’s Pet Spa', color: '#A52167', tile: 1 },
  { id: 'Daddy', label: 'Daddy’s House', color: '#6550AF', tile: 0 },
  { id: 'Annie', label: 'Annie’s House', color: '#08796E', tile: 2 },
  { id: 'Bobbie', label: 'Bobbie’s Boutique', color: '#884BA4', tile: 3 },
  { id: 'Westley', label: 'Westley’s Den', color: '#176F9F', tile: 4 },
  { id: 'Tate', label: 'Tate’s Hangout', color: '#9F452B', tile: 5 },
  { id: 'Chapo', label: 'Chapo’s Kitchen', color: '#895116', tile: 6 },
  { id: 'Budget', label: 'Budget', color: '#176F9F', tile: 7 },
  { id: 'Calm', label: 'Calm Garden', color: '#08796E', tile: 8 },
  { id: 'BankingDemo', label: 'Banking Demo', color: '#6550AF', tile: 9 },
  { id: 'Bills', label: 'Bills', color: '#9F452B' },
  { id: 'Billiam', label: 'Billiam', color: '#08796E' },
  { id: 'Debt', label: 'Debt', color: '#6550AF' },
];

export function neighborhoodLabel(id) {
  return NEIGHBORHOOD_DESTINATIONS.find(place => place.id === id)?.label || (id === 'Neighborhood' ? 'Neighborhood' : id);
}

// Keep stored route IDs and deep links stable while grouping their front doors.
export const PRIMARY_DESTINATIONS = ['Home', 'Finances', 'Budget', 'Bills'].map(id =>
  id === 'Bills' ? {...NEIGHBORHOOD_DESTINATIONS.find(place => place.id === id), label:'Bills & Banking'}
      : NEIGHBORHOOD_DESTINATIONS.find(place => place.id === id));
export const NEIGHBOR_DESTINATIONS = ['Spa', 'Calm', 'Annie', 'Bobbie', 'Westley', 'Tate', 'Chapo', 'Daddy']
  .map(id => NEIGHBORHOOD_DESTINATIONS.find(place => place.id === id));
export function primaryDestination(id) {
  if (['BankingDemo', 'Billiam', 'Debt'].includes(id)) return 'Bills';
  return id === 'Neighborhood' || NEIGHBOR_DESTINATIONS.some(place => place.id === id) ? 'Home' : id;
}
