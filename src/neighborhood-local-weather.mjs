export const weatherRefreshMs = 30 * 60 * 1000;
export const isWeatherZip = value => typeof value === 'string' && /^\d{5}$/.test(value);

export function neighborhoodWeatherFromText(description) {
  if (typeof description !== 'string' || !description.trim()) return null;
  if (/\b(snow|flurries|sleet|blizzard|ice pellets)\b/i.test(description)) return 'snow';
  if (/\b(rain|drizzle|showers?|thunderstorms?)\b/i.test(description)) return 'rain';
  if (/\b(cloudy|overcast|fog|mist|haze)\b/i.test(description)) return 'cloudy';
  return /\b(clear|sunny|fair)\b/i.test(description) ? 'clear' : null;
}

function nwsLink(value, pathPattern) {
  const prefix = 'https://api.weather.gov/';
  if (typeof value !== 'string' || !value.startsWith(prefix) || !pathPattern.test(value.slice(prefix.length))) {
    throw new Error('Weather is unavailable for that ZIP code.');
  }
  return value;
}

export async function fetchNeighborhoodWeather(zip, { request = fetch, signal, now = Date.now(), native = false } = {}) {
  if (!isWeatherZip(zip)) throw new Error('Enter a five-digit U.S. ZIP code.');
  const read = async (url, weather = false) => {
    const headers = { Accept: weather ? 'application/geo+json' : 'application/json' };
    if (weather && native) headers['User-Agent'] = 'PayPlace Neighborhood Weather';
    const response = await request(url, { signal, headers });
    if (!response.ok) throw new Error('Local weather is temporarily unavailable.');
    return response.json();
  };

  const postal = await read(`https://api.zippopotam.us/us/${zip}`);
  const place = postal.places?.[0];
  const latitude = Number.parseFloat(place?.latitude), longitude = Number.parseFloat(place?.longitude);
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
    throw new Error('Weather is unavailable for that ZIP code.');
  }
  const points = await read(`https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`, true);
  const label = place['place name'];
  try {
    const stationsLink = nwsLink(points.properties?.observationStations, /^gridpoints\/[A-Z]{3}\/-?\d+,-?\d+\/stations$/);
    const stations = await read(stationsLink, true);
    const stationLink = nwsLink(stations.observationStations?.[0] ?? stations.features?.[0]?.id, /^stations\/[A-Z0-9]{3,8}$/);
    const { properties } = await read(`${stationLink}/observations/latest`, true);
    const time = Date.parse(properties?.timestamp);
    const kind = neighborhoodWeatherFromText(properties?.textDescription);
    if (kind && time >= now - 2 * 60 * 60 * 1000 && time <= now + 5 * 60 * 1000) {
      return { kind, label, source: 'observation' };
    }
  } catch (error) {
    if (signal?.aborted) throw error;
  }

  const hourly = nwsLink(points.properties?.forecastHourly, /^gridpoints\/[A-Z]{3}\/-?\d+,-?\d+\/forecast\/hourly$/);
  const { properties } = await read(hourly, true);
  const periods = properties?.periods ?? [];
  const period = periods.find(item => Date.parse(item.startTime) <= now && Date.parse(item.endTime) > now) ?? periods[0];
  const kind = neighborhoodWeatherFromText(period?.shortForecast);
  if (!kind) throw new Error('Local weather is temporarily unavailable.');
  return { kind, label, source: 'forecast' };
}
