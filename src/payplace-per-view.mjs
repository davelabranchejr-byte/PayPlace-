export const PER_VIEW_VIDEOS = [
  { id: 'daddy-episode-1', title: 'Daddy · Episode 1', category: 'series', collection: 'Daddy', duration: 66, ratio: 512 / 910, description: 'A little time with Daddy and the neighborhood.', file: 'daddy-episode-1' },
  { id: 'pawrats-money-trees', title: 'Pawrats · Money Trees', category: 'series', collection: 'Pawrats', duration: 62, ratio: 512 / 906, description: 'Episode one of Pawrats, ready for another watch.', file: 'pawrats-money-trees' },
  { id: 'westleys-modern-life-episode-1', title: 'Westley’s Modern Life · Episode 1', category: 'series', collection: 'Westley’s Modern Life', duration: 126, ratio: 512 / 910, description: 'The opening credits and first episode of Westley’s Modern Life.', file: 'westleys-modern-life-episode-1' },
  { id: 'chapo-purple-pans', title: 'Chapo’s Purple Pans', category: 'commercials', collection: 'Chapo', duration: 31.03, ratio: 9 / 16, description: 'Chapo gives the purple pans their moment.', file: 'chapo-purple-pans' },
  { id: 'chapo-chopper', title: 'Chapo’s Vegetable Chopper', category: 'commercials', collection: 'Chapo', duration: 31.02, ratio: 9 / 16, description: 'A familiar kitchen favorite with Chapo.', file: 'chapo-chopper' },
  { id: 'bobbie-mirror', title: 'Bobbie’s Mirror', category: 'commercials', collection: 'Bobbie', duration: 31.02, ratio: 9 / 16, description: 'A little glamour with Bobbie Darlending.', file: 'bobbie-mirror' },
  { id: 'coffee-break', title: 'PayPlace Coffee Break', category: 'commercials', collection: 'PayPlace', duration: 31.02, ratio: 9 / 16, description: 'Take a coffee break with the neighborhood.', file: 'coffee-break' },
];
const byId = new Map(PER_VIEW_VIDEOS.map(video => [video.id, video]));
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function normalizePerView(value) {
  const source = object(value);
  const favorites = [...new Set(Array.isArray(source.favorites) ? source.favorites.filter(id => byId.has(id)) : [])];
  const progress = {};
  const views = {};
  for (const [id, count] of Object.entries(object(source.views))) {
    if (byId.has(id) && Number.isSafeInteger(count) && count > 0) views[id] = count;
  }
  for (const [id, raw] of Object.entries(object(source.progress))) {
    if (!byId.has(id)) continue;
    const item = object(raw);
    if (!Number.isFinite(item.seconds) || item.seconds < 0) continue;
    const duration = Number.isFinite(item.duration) && item.duration > 0 ? item.duration : byId.get(id).duration;
    const seconds = Math.min(item.seconds, duration);
    progress[id] = { seconds, duration, completed: item.completed === true || seconds >= duration - 1,
      updatedAt: Number.isFinite(item.updatedAt) && item.updatedAt >= 0 ? item.updatedAt : 0 };
  }
  return { version: 1, favorites, progress, views };
}

export function recordPerViewWatch(value, id) {
  const state = normalizePerView(value);
  if (!byId.has(id)) return state;
  return { ...state, views: { ...state.views, [id]: Math.min(Number.MAX_SAFE_INTEGER, (state.views[id] || 0) + 1) } };
}

export function togglePerViewFavorite(value, id) {
  const state = normalizePerView(value);
  if (!byId.has(id)) return state;
  return { ...state, favorites: state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites, id] };
}

export function recordPerViewProgress(value, id, seconds, duration, now = Date.now()) {
  const state = normalizePerView(value);
  if (!byId.has(id) || !Number.isFinite(seconds) || seconds < 0) return state;
  const length = Number.isFinite(duration) && duration > 0 ? duration : byId.get(id).duration;
  const position = Math.min(seconds, length);
  return { ...state, progress: { ...state.progress, [id]: { seconds: position, duration: length,
    completed: position >= length - 1, updatedAt: Number.isFinite(now) && now >= 0 ? now : 0 } } };
}

export function perViewResumeAt(value, id) {
  const item = normalizePerView(value).progress[id];
  return item && !item.completed ? item.seconds : 0;
}

export function perViewRows(value, query = '', filter = 'all') {
  const state = normalizePerView(value);
  const term = String(query || '').trim().toLocaleLowerCase();
  const matches = video => !term || `${video.title} ${video.collection} ${video.description}`.toLocaleLowerCase().includes(term);
  const videos = PER_VIEW_VIDEOS.filter(matches);
  const favorites = videos.filter(video => state.favorites.includes(video.id));
  if (filter === 'favorites') return [{ id: 'favorites', title: 'My Favorites', videos: favorites }];
  if (term || filter !== 'all') return [{ id: 'results', title: term ? 'Search results' : filter === 'series' ? 'TV Shows' : 'Commercials',
    videos: videos.filter(video => filter === 'all' || video.category === filter) }];
  const continuing = videos.filter(video => state.progress[video.id]?.seconds > 1 && !state.progress[video.id].completed)
    .sort((a, b) => state.progress[b.id].updatedAt - state.progress[a.id].updatedAt);
  const recommended = videos.filter(video => video.category === 'series')
    .sort((a, b) => Number(state.favorites.includes(b.id)) - Number(state.favorites.includes(a.id)) ||
      (state.views[a.id] || 0) - (state.views[b.id] || 0));
  const mostViewed = videos.filter(video => state.views[video.id] > 0)
    .sort((a, b) => state.views[b.id] - state.views[a.id]);
  return [
    { id: 'continue', title: 'Continue Watching', videos: continuing, empty: 'Start a video, and pick up right where you left off.' },
    { id: 'recommended', title: 'Recommended Shows', videos: recommended, subtitle: 'A little neighborhood escape, picked for you.' },
    { id: 'most-viewed', title: 'Most Viewed', videos: mostViewed, subtitle: 'Your most-watched videos', empty: 'Your favorites will rise to the top as you watch.' },
    ...(favorites.length ? [{ id: 'favorites', title: 'My Favorites', videos: favorites }] : []),
    { id: 'commercials', title: 'A Little Commercial Break', videos: videos.filter(video => video.category === 'commercials') },
  ];
}

export function perViewTime(seconds) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
