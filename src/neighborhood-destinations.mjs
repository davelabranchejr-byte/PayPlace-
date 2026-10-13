export const NEIGHBORHOOD_DESTINATIONS = [
  { id: 'Home', label: 'Home', color: '#6550AF', tile: 0 },
  { id: 'Spa', label: 'Em’s Pet Spa', color: '#A52167', tile: 1 },
  { id: 'Annie', label: 'Annie’s House', color: '#08796E', tile: 2 },
  { id: 'Bobbie', label: 'Bobbie’s Boutique', color: '#884BA4', tile: 3 },
  { id: 'Westley', label: 'Westley’s Den', color: '#176F9F', tile: 4 },
  { id: 'Tate', label: 'Tate’s Hangout', color: '#9F452B', tile: 5 },
  { id: 'Chapo', label: 'Chapo’s Kitchen', color: '#895116', tile: 6 },
  { id: 'Budget', label: 'Budget Corner', color: '#176F9F', tile: 7 },
  { id: 'Calm', label: 'Calm Garden', color: '#08796E', tile: 8 },
  { id: 'Premium', label: 'The Clubhouse', color: '#6550AF', tile: 9 },
  { id: 'Bills', label: 'Post Office', color: '#9F452B' },
  { id: 'Debt', label: 'Debt Climb', color: '#6550AF' },
];

export function neighborhoodLabel(id) {
  return NEIGHBORHOOD_DESTINATIONS.find(place => place.id === id)?.label || id;
}
