import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchNeighborhoodWeather, neighborhoodWeatherFromText } from '../src/neighborhood-local-weather.mjs';
import { isNeighborhoodLeafSeason, neighborhoodResidents, neighborhoodWalkers, seasonalNeighborhoodWeather } from '../src/neighborhood-world.mjs';

test('neighbors change jobs or destinations as the town clock advances', () => {
  const find = (hour, id, date = 16) => neighborhoodResidents(new Date(2026, 10, date, hour)).find(resident => resident.id === id);
  assert.equal(find(8, 'billiam').destination, 'Billiam');
  assert.equal(find(11, 'billiam').destination, 'Annie');
  assert.equal(find(15, 'billiam').destination, 'Spa');
  assert.equal(find(13, 'em').destination, 'Calm');
  assert.equal(find(22, 'em').destination, 'Spa');
  assert.equal(find(7, 'billiam', 14).path, undefined, 'weekend rounds start later');
  assert.equal(find(11, 'annie').path, undefined, 'the oak stays rooted');
  assert.equal(find(18, 'bobbie').destination, 'Cabaret');
  const morning = new Date(2026, 10, 16, 8);
  const morningResidents = neighborhoodResidents(morning);
  assert.ok(morningResidents.find(resident => resident.id === 'westley').companions.includes('Tate'));
  assert.ok(neighborhoodWalkers(morningResidents, morning).some(resident => resident.id === 'tate'));
  const grooming = neighborhoodResidents(new Date(2026, 10, 16, 14));
  assert.ok(grooming.find(resident => resident.id === 'em').companions.includes('Bobbie'));
  const date = new Date(2026, 10, 16, 11);
  const onFoot = neighborhoodWalkers(neighborhoodResidents(date), date);
  assert.ok(onFoot.length > 0 && onFoot.length <= 3 && onFoot.every(resident => resident.path));
  assert.deepEqual(neighborhoodWalkers(neighborhoodResidents(new Date(2026, 10, 16, 2)), new Date(2026, 10, 16, 2)), []);
});

test('seasonal weather persists within a clock slot and varies by season', () => {
  const day = (month, date, hour, minute = 0) => new Date(2026, month - 1, date, hour, minute);
  assert.equal(seasonalNeighborhoodWeather(day(7, 7, 12)), seasonalNeighborhoodWeather(day(7, 7, 14, 59)));
  assert.ok(Array.from({length: 20}, (_, i) => seasonalNeighborhoodWeather(day(1, i + 1, 12))).includes('snow'));
  assert.ok(Array.from({length: 20}, (_, i) => seasonalNeighborhoodWeather(day(4, i + 1, 12))).includes('rain'));
  assert.equal(isNeighborhoodLeafSeason(day(10, 15, 12)), true);
  assert.equal(isNeighborhoodLeafSeason(day(4, 15, 12)), false);
  assert.equal(neighborhoodWeatherFromText('Rain and Snow Showers'), 'snow');
  assert.equal(neighborhoodWeatherFromText('Fog/Mist'), 'cloudy');
});

test('ZIP weather uses fresh NWS observations and falls back to the current hourly period', async () => {
  const now = Date.parse('2026-11-12T12:00:00Z');
  const urls = [];
  let timestamp = '2026-11-12T11:54:00Z';
  const request = async url => {
    urls.push(url);
    const payload = {
      'https://api.zippopotam.us/us/02108': { places: [{ 'place name': 'Boston', latitude: '42.36', longitude: '-71.06' }] },
      'https://api.weather.gov/points/42.3600,-71.0600': { properties: {
        observationStations: 'https://api.weather.gov/gridpoints/BOX/70,76/stations',
        forecastHourly: 'https://api.weather.gov/gridpoints/BOX/70,76/forecast/hourly',
      } },
      'https://api.weather.gov/gridpoints/BOX/70,76/stations': { observationStations: ['https://api.weather.gov/stations/KBOS'] },
      'https://api.weather.gov/stations/KBOS/observations/latest': { properties: { timestamp, textDescription: 'Light Rain' } },
      'https://api.weather.gov/gridpoints/BOX/70,76/forecast/hourly': { properties: { periods: [
        { startTime: '2026-11-12T11:00:00Z', endTime: '2026-11-12T12:00:00Z', shortForecast: 'Sunny' },
        { startTime: '2026-11-12T12:00:00Z', endTime: '2026-11-12T13:00:00Z', shortForecast: 'Light Snow' },
      ] } },
    }[url];
    return { ok: !!payload, json: async () => payload };
  };
  assert.deepEqual(await fetchNeighborhoodWeather('02108', { request, now }), { kind: 'rain', label: 'Boston', source: 'observation' });
  assert.equal(urls.length, 4);
  assert.ok(urls.slice(1).every(url => !url.includes('02108')), 'the ZIP stays with the geocoding service');
  timestamp = '2026-11-12T07:54:00Z';
  assert.deepEqual(await fetchNeighborhoodWeather('02108', { request, now }), { kind: 'snow', label: 'Boston', source: 'forecast' });
  await assert.rejects(fetchNeighborhoodWeather('nope', { request, now }), /five-digit/);
  await assert.rejects(fetchNeighborhoodWeather('99999', { request, now }), /unavailable/);
});
