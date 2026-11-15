import assert from 'node:assert/strict';
import { evaluateDisasterRisk, evaluateWeatherAlerts } from '../server/weatherService';
import { formatPressure, formatTemperature, formatWindSpeed } from '../src/utils/formatters';
import { getWindCompass, getWmoInfo } from '../src/utils/weatherCodes';
import { parseVoiceNavigation } from '../src/utils/voice';
import type { CurrentWeather, DailyForecastItem, HourlyForecastItem, LocationInfo } from '../src/types/weather';

function runTests() {
  // 1. Unit formatting tests
  assert.equal(formatTemperature(30, 'C'), '30°C');
  assert.equal(formatTemperature(0, 'F'), '32°F');
  assert.equal(formatWindSpeed(36, 'ms'), '10.0 m/s');
  assert.equal(formatPressure(1013, 'hPa'), '1013 hPa');
  assert.equal(getWindCompass(0), 'N');
  assert.equal(getWindCompass(90), 'E');

  // 2. Multilingual WMO description checks
  assert.equal(getWmoInfo(0, 'en').label, 'Clear Sky');
  assert.ok(getWmoInfo(95, 'hi').label.length > 0);
  assert.ok(getWmoInfo(65, 'or').label.length > 0);

  // 3. Voice navigation intent parser checks
  assert.equal(parseVoiceNavigation('Open flood monitor'), 'flood');
  assert.equal(parseVoiceNavigation('Show travel planner'), 'travel');
  assert.equal(parseVoiceNavigation('Open smart agriculture'), 'agriculture');
  assert.equal(parseVoiceNavigation('What is the weather tomorrow?'), null);

  // 4. Alert & Disaster Risk Intelligence engine tests (Odisha cyclone-grade conditions)
  const odishaLoc: LocationInfo = {
    name: 'Paradip',
    admin1: 'Odisha',
    country: 'India',
    countryCode: 'IN',
    latitude: 20.3165,
    longitude: 86.6114,
    isOdisha: true,
  };

  const severeCurrent: CurrentWeather = {
    time: '2026-11-15T12:00',
    temperature: 29,
    apparentTemperature: 33,
    humidity: 92,
    isDay: true,
    precipitation: 18,
    rain: 18,
    weatherCode: 95,
    cloudCover: 98,
    pressureMsl: 990,
    surfacePressure: 989,
    windSpeed: 65,
    windDirection: 120,
    windGusts: 92,
    visibility: 800,
    uvIndex: 2,
  };

  const hourly: HourlyForecastItem[] = [
    {
      time: '2026-11-15T12:00',
      temperature: 29,
      apparentTemperature: 33,
      humidity: 92,
      precipitationProbability: 95,
      precipitation: 58,
      weatherCode: 95,
      pressureMsl: 990,
      visibility: 800,
      windSpeed: 65,
      windGusts: 92,
      uvIndex: 2,
      isDay: true,
    },
  ];

  const daily: DailyForecastItem[] = [
    {
      date: '2026-11-15',
      weatherCode: 95,
      tempMax: 30,
      tempMin: 25,
      apparentTempMax: 34,
      apparentTempMin: 27,
      sunrise: '2026-11-15T05:55',
      sunset: '2026-11-15T17:05',
      uvIndexMax: 4,
      precipitationSum: 85,
      rainSum: 85,
      precipitationProbabilityMax: 95,
      windSpeedMax: 68,
      windGustsMax: 92,
      windDirectionDominant: 120,
    },
  ];

  const alerts = evaluateWeatherAlerts(severeCurrent, hourly, daily, odishaLoc, '2026-11-15T12:00:00Z');
  const appAlerts = alerts.filter((a) => a.origin === 'app_advisory');
  const officialAlerts = alerts.filter((a) => a.origin === 'official_reference');

  assert.ok(appAlerts.some((a) => a.category === 'cyclone' && a.severity === 'Extreme'));
  assert.ok(appAlerts.some((a) => a.category === 'heavy_rain'));
  assert.ok(appAlerts.some((a) => a.category === 'thunderstorm'));
  assert.ok(appAlerts.some((a) => a.category === 'visibility'));
  assert.ok(officialAlerts.some((a) => a.id === 'official-osdma-imd-odisha'));
  assert.ok(officialAlerts.some((a) => a.id === 'official-imd-rsmc-sachet'));

  const risk = evaluateDisasterRisk(severeCurrent, hourly, daily, odishaLoc, '2026-11-15T12:00:00Z');
  assert.equal(risk.overallLevel, 'Severe');
  assert.equal(risk.cycloneWatch.active, true);
  assert.equal(risk.dimensions.length, 4);

  console.log('All WeatherGuard AI unit tests passed!');
}

runTests();
