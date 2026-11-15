import type {
  AgricultureData,
  ClimateAnalyticsData,
  CurrentWeather,
  DailyForecastItem,
  DisasterRiskAssessment,
  FloodMonitorData,
  HourlyForecastItem,
  LocationInfo,
  MonthlyClimatePoint,
  OdishaStationStatus,
  RiverBasinPoint,
  RouteWaypointWeather,
  TravelRouteForecast,
  WeatherAlert,
  WeatherBundle,
  YearlyComparisonPoint,
} from '../src/types/weather';
import { FEATURED_INDIAN_CITIES, ODISHA_STATIONS, isLocationInOdisha } from '../src/data/indianLocations';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const weatherCache = new Map<string, CacheEntry<WeatherBundle>>();
const climateCache = new Map<string, CacheEntry<ClimateAnalyticsData>>();
const floodCache = new Map<string, CacheEntry<FloodMonitorData>>();
const agriCache = new Map<string, CacheEntry<AgricultureData>>();
const odishaCache = { entry: null as CacheEntry<OdishaStationStatus[]> | null };

const CACHE_TTL_MS = 5 * 60 * 1000;
const CLIMATE_TTL_MS = 30 * 60 * 1000;

const ODISHA_RIVER_BASINS = [
  { name: 'Mahanadi Delta', river: 'Mahanadi', district: 'Cuttack', latitude: 20.4625, longitude: 85.883 },
  { name: 'Baitarani Basin', river: 'Baitarani', district: 'Bhadrak / Jajpur', latitude: 21.21, longitude: 86.12 },
  { name: 'Brahmani Basin', river: 'Brahmani', district: 'Kendrapara', latitude: 20.75, longitude: 86.25 },
  { name: 'Subarnarekha Lower', river: 'Subarnarekha', district: 'Balasore', latitude: 21.55, longitude: 87.15 },
  { name: 'Rushikulya Basin', river: 'Rushikulya', district: 'Ganjam', latitude: 19.38, longitude: 85.05 },
];

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 9000, headers?: Record<string, string>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function searchLocations(query: string): Promise<LocationInfo[]> {
  const trimmed = query.trim();
  if (!trimmed) return FEATURED_INDIAN_CITIES;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`;
  try {
    const data = await fetchJsonWithTimeout<{
      results?: Array<{
        id: number;
        name: string;
        admin1?: string;
        country?: string;
        country_code?: string;
        latitude: number;
        longitude: number;
        timezone?: string;
      }>;
    }>(url);

    const mapped: LocationInfo[] = (data.results || []).map((r) => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1,
      country: r.country || 'Unknown',
      countryCode: r.country_code,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      isOdisha: isLocationInOdisha({
        name: r.name,
        admin1: r.admin1,
        latitude: r.latitude,
        longitude: r.longitude,
      }),
    }));

    return mapped.sort((a, b) => {
      const aIn = a.countryCode === 'IN' ? 0 : 1;
      const bIn = b.countryCode === 'IN' ? 0 : 1;
      if (a.name.toLowerCase() === b.name.toLowerCase()) return aIn - bIn;
      return 0;
    });
  } catch (error) {
    const lower = trimmed.toLowerCase();
    const localMatches = FEATURED_INDIAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        (c.admin1 && c.admin1.toLowerCase().includes(lower)) ||
        c.country.toLowerCase().includes(lower)
    );
    if (localMatches.length > 0) return localMatches;
    throw error;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  const roundedLat = Number(lat.toFixed(4));
  const roundedLon = Number(lon.toFixed(4));

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${roundedLat}&lon=${roundedLon}&zoom=10`;
    const data = await fetchJsonWithTimeout<{
      name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        county?: string;
        state_district?: string;
        state?: string;
        country?: string;
        country_code?: string;
      };
    }>(url, 6000, {
      'User-Agent': 'WeatherGuardAI/1.0 (https://weatherguard.local)',
    });

    const addr = data.address || {};
    const name =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.state_district ||
      addr.county ||
      data.name ||
      `${roundedLat.toFixed(2)}°N, ${roundedLon.toFixed(2)}°E`;

    const admin1 = addr.state || addr.state_district;
    const country = addr.country || 'Detected Location';
    const countryCode = addr.country_code?.toUpperCase();

    return {
      name,
      admin1,
      country,
      countryCode,
      latitude: roundedLat,
      longitude: roundedLon,
      isOdisha: isLocationInOdisha({ name, admin1, latitude: roundedLat, longitude: roundedLon }),
    };
  } catch {
    return {
      name: `${roundedLat.toFixed(2)}°, ${roundedLon.toFixed(2)}°`,
      country: 'GPS Coordinates',
      latitude: roundedLat,
      longitude: roundedLon,
      isOdisha: isLocationInOdisha({ name: '', latitude: roundedLat, longitude: roundedLon }),
    };
  }
}

export function evaluateDisasterRisk(
  current: CurrentWeather,
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  location: LocationInfo,
  issuedAt: string
): DisasterRiskAssessment {
  const next24 = hourly.slice(0, 24);
  const rain24 = next24.reduce((s, h) => s + (h.precipitation || 0), 0);
  const rainMaxProb = Math.max(0, ...next24.map((h) => h.precipitationProbability || 0));
  const maxGusts = Math.max(current.windGusts || 0, ...next24.map((h) => h.windGusts || 0));
  const hasStormCode =
    [95, 96, 99].includes(current.weatherCode) ||
    next24.some((h) => [95, 96, 99].includes(h.weatherCode));
  const maxTemp = Math.max(current.temperature, ...next24.map((h) => h.temperature));
  const maxApparent = Math.max(current.apparentTemperature, ...next24.map((h) => h.apparentTemperature));
  const minTemp = Math.min(current.temperature, ...next24.map((h) => h.temperature));
  const pressure = current.pressureMsl || 1013;

  const rainLevel: DisasterRiskAssessment['overallLevel'] =
    rain24 >= 100 || (daily[0]?.precipitationSum ?? 0) >= 100
      ? 'Severe'
      : rain24 >= 45
      ? 'High'
      : rain24 >= 15 || rainMaxProb >= 70
      ? 'Moderate'
      : 'Low';

  const stormLevel: DisasterRiskAssessment['overallLevel'] =
    maxGusts >= 75 || (hasStormCode && maxGusts >= 55)
      ? 'Severe'
      : hasStormCode || maxGusts >= 48
      ? 'High'
      : maxGusts >= 32
      ? 'Moderate'
      : 'Low';

  const thermalLevel: DisasterRiskAssessment['overallLevel'] =
    maxTemp >= 44 || maxApparent >= 47 || minTemp <= 0
      ? 'Severe'
      : maxTemp >= 40 || maxApparent >= 43 || minTemp <= 5
      ? 'High'
      : maxTemp >= 36 || minTemp <= 9
      ? 'Moderate'
      : 'Low';

  const cycloneLevel: DisasterRiskAssessment['overallLevel'] =
    pressure <= 992 || maxGusts >= 88
      ? 'Severe'
      : pressure <= 1000 && maxGusts >= 50
      ? 'High'
      : pressure <= 1004 && maxGusts >= 38
      ? 'Moderate'
      : 'Low';

  const rank: Record<DisasterRiskAssessment['overallLevel'], number> = {
    Low: 0,
    Moderate: 1,
    High: 2,
    Severe: 3,
  };

  const dims = [
    {
      id: 'rain_flood' as const,
      label: 'Heavy Rainfall & Runoff',
      level: rainLevel,
      metricText: `${rain24.toFixed(1)} mm / 24h · ${Math.round(rainMaxProb)}% peak prob`,
      explanation:
        rainLevel === 'Low'
          ? 'Expected 24h precipitation stays below urban drainage stress thresholds.'
          : 'Sustained rainfall increases surface runoff and local waterlogging risk.',
    },
    {
      id: 'storm_wind' as const,
      label: 'Thunderstorm & Wind Gusts',
      level: stormLevel,
      metricText: `Gusts ${Math.round(maxGusts)} km/h${hasStormCode ? ' · Convective WMO 95–99' : ''}`,
      explanation:
        stormLevel === 'Low'
          ? 'Surface wind gusts and convective indices remain within normal bounds.'
          : 'Elevated gusts or thunderstorm activity may disrupt outdoor travel and power lines.',
    },
    {
      id: 'heat_cold' as const,
      label: 'Thermal Extremes (Heat / Cold)',
      level: thermalLevel,
      metricText: `Range ${minTemp.toFixed(1)}°C – ${maxTemp.toFixed(1)}°C (Feels ${maxApparent.toFixed(1)}°C)`,
      explanation:
        thermalLevel === 'Low'
          ? 'Ambient and apparent temperatures remain within safe physiological limits.'
          : 'Thermal stress threshold approached; limit midday exposure or cold-hour transit.',
    },
    {
      id: 'cyclone_pressure' as const,
      label: 'Cyclonic Pressure & Coastal Gale',
      level: cycloneLevel,
      metricText: `MSL ${Math.round(pressure)} hPa · Peak Gust ${Math.round(maxGusts)} km/h`,
      explanation:
        cycloneLevel === 'Low'
          ? 'Barometric sea-level pressure indicates stable synoptic conditions.'
          : 'Depressed barometric pressure paired with rising gusts warrants coastal monitoring.',
    },
  ];

  const sortedBySeverity = [...dims].sort((a, b) => rank[b.level] - rank[a.level]);
  const overallLevel = sortedBySeverity[0].level;
  const primaryDriver =
    overallLevel === 'Low'
      ? 'All atmospheric risk indicators are nominal in the next 24h window.'
      : `${sortedBySeverity[0].label}: ${sortedBySeverity[0].metricText}`;

  const isIndia = location.countryCode === 'IN' || location.country.toLowerCase() === 'india';

  return {
    overallLevel,
    confidenceLabel: 'High (0–24h NWP Horizon)',
    dataTimestamp: issuedAt,
    primaryDriver,
    dimensions: dims,
    cycloneWatch: {
      active: cycloneLevel === 'High' || cycloneLevel === 'Severe',
      status:
        cycloneLevel === 'Severe'
          ? 'Cyclonic Gale Telemetry Triggered — Verify IMD RSMC Track'
          : cycloneLevel === 'High'
          ? 'Low-Pressure / Elevated Gust Watch'
          : 'No Local Cyclonic Pressure Anomaly Detected',
      pressureHpa: Math.round(pressure),
      maxGustKmh: Math.round(maxGusts),
      officialSource: isIndia ? 'IMD RSMC New Delhi (Bay of Bengal & Arabian Sea)' : 'WMO Severe Weather Information Centre',
      officialUrl: isIndia ? 'https://rsmcnewdelhi.imd.gov.in/' : 'https://severeweather.wmo.int/',
    },
  };
}

export function evaluateWeatherAlerts(
  current: CurrentWeather,
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  location: LocationInfo,
  issuedAt: string
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const next24 = hourly.slice(0, 24);
  const max24RainProb = Math.max(0, ...next24.map((h) => h.precipitationProbability || 0));
  const total24Rain = next24.reduce((acc, h) => acc + (h.precipitation || 0), 0);
  const max24Gusts = Math.max(current.windGusts || 0, ...next24.map((h) => h.windGusts || 0));
  const max24Temp = Math.max(current.temperature, ...next24.map((h) => h.temperature));
  const max24Apparent = Math.max(current.apparentTemperature, ...next24.map((h) => h.apparentTemperature));
  const min24Temp = Math.min(current.temperature, ...next24.map((h) => h.temperature));
  const max24Uv = Math.max(current.uvIndex || 0, ...next24.map((h) => h.uvIndex || 0));
  const min24Visibility = Math.min(current.visibility ?? 10000, ...next24.map((h) => h.visibility ?? 10000));
  const hasStormCode =
    [95, 96, 99].includes(current.weatherCode) ||
    next24.some((h) => [95, 96, 99].includes(h.weatherCode));
  const lowPressureSystem = current.pressureMsl > 0 && current.pressureMsl <= 1000;

  const isIndia = location.countryCode === 'IN' || location.country.toLowerCase() === 'india';
  const isOdisha = Boolean(location.isOdisha);

  if (max24Gusts >= 62 || (lowPressureSystem && max24Gusts >= 45)) {
    alerts.push({
      id: 'app-cyclone-gale',
      origin: 'app_advisory',
      severity: max24Gusts >= 88 || current.pressureMsl <= 992 ? 'Extreme' : 'Severe',
      category: 'cyclone',
      title: isOdisha
        ? 'Cyclonic Wind & Coastal Pressure Advisory'
        : 'Severe Gale Wind & Low-Pressure Advisory',
      description: `Live telemetry detects sustained low pressure (${Math.round(current.pressureMsl)} hPa) and peak wind gusts reaching ${Math.round(max24Gusts)} km/h over the next 24 hours.`,
      triggerMetric: `Gusts ${Math.round(max24Gusts)} km/h · Pressure ${Math.round(current.pressureMsl)} hPa`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      regionFocus: isOdisha ? 'Odisha / Bay of Bengal Coast' : location.name,
      safetyInstructions: [
        'Secure loose rooftop items, tin sheets, signage, and outdoor equipment immediately.',
        'Avoid coastal beaches, jetties, and small-craft marine navigation until winds subside.',
        'Keep battery banks charged and store 72 hours of drinking water and essential medicines.',
        isOdisha
          ? 'Monitor OSDMA and IMD Paradip/Bhubaneswar bulletins for evacuation notices.'
          : 'Follow local municipal emergency broadcasts.',
      ],
    });
  } else if (max24Gusts >= 42) {
    alerts.push({
      id: 'app-strong-wind',
      origin: 'app_advisory',
      severity: 'Moderate',
      category: 'wind',
      title: 'Strong Wind & Gust Advisory',
      description: `Elevated wind gusts up to ${Math.round(max24Gusts)} km/h are forecast within the next 24 hours.`,
      triggerMetric: `Peak Gusts ${Math.round(max24Gusts)} km/h`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Exercise caution when driving high-profile vehicles or two-wheelers on open highways.',
        'Avoid parking under old trees or unstable power lines.',
      ],
    });
  }

  if (total24Rain >= 50 || (daily[0]?.precipitationSum ?? 0) >= 50) {
    const rainVal = Math.max(total24Rain, daily[0]?.precipitationSum ?? 0);
    alerts.push({
      id: 'app-heavy-rain',
      origin: 'app_advisory',
      severity: rainVal >= 115 ? 'Extreme' : 'Severe',
      category: 'heavy_rain',
      title: 'Heavy Rainfall & Waterlogging Advisory',
      description: `Cumulative rainfall of ${rainVal.toFixed(1)} mm is projected over the next 24 hours (${max24RainProb}% peak hourly probability).`,
      triggerMetric: `${rainVal.toFixed(1)} mm / 24h · ${max24RainProb}% prob.`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Avoid low-lying underpasses, waterlogged roads, and fast-flowing drainage channels.',
        'Delay non-essential intercity road travel during peak rainfall hours.',
        'Check roof drains and keep emergency flashlights accessible.',
      ],
    });
  } else if (total24Rain >= 15 || max24RainProb >= 70) {
    alerts.push({
      id: 'app-moderate-rain',
      origin: 'app_advisory',
      severity: 'Moderate',
      category: 'heavy_rain',
      title: 'High Rain Probability Advisory',
      description: `Significant rain showers (${total24Rain.toFixed(1)} mm expected, up to ${max24RainProb}% probability) expected over the next 24 hours.`,
      triggerMetric: `${total24Rain.toFixed(1)} mm · ${max24RainProb}% peak chance`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Carry waterproof rain gear and plan extra commute buffer time.',
        'Protect sensitive electronics and outdoor agricultural produce.',
      ],
    });
  }

  if (hasStormCode) {
    alerts.push({
      id: 'app-thunderstorm',
      origin: 'app_advisory',
      severity: 'Severe',
      category: 'thunderstorm',
      title: 'Thunderstorm & Lightning Safety Advisory',
      description: `Convective storm weather codes (WMO 95–99) appear in live or upcoming 24-hour forecasts for ${location.name}.`,
      triggerMetric: 'Convective Storm Window Active',
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Move indoors immediately when thunder is heard; stay away from open fields, water bodies, and isolated trees.',
        'Unplug non-essential appliances and avoid corded electronics during active lightning.',
        'Use the Damini Lightning Alert app (IITM/IMD) if in India for real-time strike proximity.',
      ],
    });
  }

  if (max24Temp >= 40 || max24Apparent >= 43) {
    alerts.push({
      id: 'app-heatwave',
      origin: 'app_advisory',
      severity: max24Temp >= 44 || max24Apparent >= 47 ? 'Extreme' : 'Severe',
      category: 'heatwave',
      title: 'Extreme Heat & Thermal Stress Advisory',
      description: `Air temperature reaches ${max24Temp.toFixed(1)}°C with heat-index feels-like up to ${max24Apparent.toFixed(1)}°C in the next 24 hours.`,
      triggerMetric: `Peak ${max24Temp.toFixed(1)}°C · Feels Like ${max24Apparent.toFixed(1)}°C`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Avoid strenuous outdoor labor between 11:00 AM and 4:00 PM.',
        'Hydrate frequently with ORS, water, or buttermilk; wear light cotton clothing and head cover.',
        'Check on elderly family members, infants, and outdoor workers for heat-exhaustion symptoms.',
      ],
    });
  }

  if (min24Temp <= 5) {
    alerts.push({
      id: 'app-cold-wave',
      origin: 'app_advisory',
      severity: min24Temp <= 0 ? 'Severe' : 'Moderate',
      category: 'cold_wave',
      title: 'Cold Wave & Low Temperature Advisory',
      description: `Minimum temperature drops to ${min24Temp.toFixed(1)}°C over the next 24 hours.`,
      triggerMetric: `Min ${min24Temp.toFixed(1)}°C`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Wear layered insulated clothing, especially during early morning and late night hours.',
        'Ensure proper ventilation when using indoor room heaters.',
      ],
    });
  }

  if (max24Uv >= 8) {
    alerts.push({
      id: 'app-uv',
      origin: 'app_advisory',
      severity: max24Uv >= 11 ? 'Severe' : 'Moderate',
      category: 'uv',
      title: 'Very High UV Radiation Advisory',
      description: `Peak UV index is forecast at ${max24Uv.toFixed(1)} during midday solar hours.`,
      triggerMetric: `UV Index ${max24Uv.toFixed(1)}`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Apply SPF 30+ broad-spectrum sunscreen and wear UV-protective sunglasses.',
        'Seek shade during peak solar hours (11:00 AM – 3:00 PM).',
      ],
    });
  }

  if (min24Visibility < 1000) {
    alerts.push({
      id: 'app-fog-visibility',
      origin: 'app_advisory',
      severity: min24Visibility < 300 ? 'Severe' : 'Moderate',
      category: 'visibility',
      title: 'Dense Fog & Low Visibility Advisory',
      description: `Horizontal visibility is expected to drop to ${(min24Visibility / 1000).toFixed(2)} km.`,
      triggerMetric: `Visibility ${(min24Visibility / 1000).toFixed(2)} km`,
      sourceName: 'WeatherGuard AI Telemetry Engine (Open-Meteo Live)',
      issuedAt,
      safetyInstructions: [
        'Use low-beam fog lights and maintain double following distance while driving.',
        'Check railway and flight schedules before departing to stations or airports.',
      ],
    });
  }

  if (isOdisha) {
    alerts.push({
      id: 'official-osdma-imd-odisha',
      origin: 'official_reference',
      severity: 'Low',
      category: 'official_portal',
      title: 'IMD Bhubaneswar & OSDMA Official Odisha Bulletins',
      description:
        'Verify official district-level color-coded warnings (Red/Orange/Yellow), Bay of Bengal cyclone tracks, and fishermen sea-state advisories directly from IMD & Odisha State Disaster Management Authority.',
      sourceName: 'India Meteorological Department (IMD) & OSDMA',
      officialUrl: 'https://mausam.imd.gov.in/bhubaneswar/',
      issuedAt,
      regionFocus: 'Odisha State',
      safetyInstructions: [
        'Odisha State Emergency Helpline: 1070 (Toll-Free) | District Helpline: 1077 | Unified Emergency: 112.',
        'Official OSDMA cyclone shelter & disaster updates: https://www.osdma.org/',
      ],
    });
  }

  if (isIndia) {
    alerts.push({
      id: 'official-imd-rsmc-sachet',
      origin: 'official_reference',
      severity: 'Low',
      category: 'official_portal',
      title: 'IMD National Warnings & NDMA Sachet CAP Portal',
      description:
        'Official Indian government Common Alerting Protocol (CAP) weather warnings, RSMC tropical cyclone advisories, and nowcasts are issued exclusively by IMD and NDMA.',
      sourceName: 'IMD Mausam / RSMC New Delhi / NDMA Sachet',
      officialUrl: 'https://sachet.ndma.gov.in/',
      issuedAt,
      regionFocus: 'India',
      safetyInstructions: [
        'IMD National Forecast & Warnings: https://mausam.imd.gov.in/',
        'RSMC Tropical Cyclone Track (Bay of Bengal & Arabian Sea): https://rsmcnewdelhi.imd.gov.in/',
      ],
    });
  } else {
    alerts.push({
      id: 'official-wmo-swic',
      origin: 'official_reference',
      severity: 'Low',
      category: 'official_portal',
      title: 'WMO Severe Weather Information Centre (SWIC)',
      description:
        'Official national meteorological warnings for your region are published via the World Meteorological Organization Severe Weather Information Centre.',
      sourceName: 'World Meteorological Organization (WMO)',
      officialUrl: 'https://severeweather.wmo.int/',
      issuedAt,
      regionFocus: location.country,
      safetyInstructions: [
        'Always verify official evacuation or civil-defense directives with your national meteorological service.',
      ],
    });
  }

  return alerts;
}

export async function fetchWeatherBundle(location: LocationInfo): Promise<WeatherBundle> {
  const cacheKey = `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return {
      ...cached.data,
      location: {
        ...cached.data.location,
        name: location.name || cached.data.location.name,
        admin1: location.admin1 ?? cached.data.location.admin1,
        country: location.country || cached.data.location.country,
        countryCode: location.countryCode ?? cached.data.location.countryCode,
      },
    };
  }

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
    `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,visibility,wind_speed_10m,wind_gusts_10m,uv_index,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant` +
    `&timezone=auto&forecast_days=7`;

  const aqiUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=european_aqi,us_aqi,pm2_5,pm10&timezone=auto`;

  try {
    const [forecastRes, aqiRes] = await Promise.all([
      fetchJsonWithTimeout<any>(forecastUrl, 9000),
      fetchJsonWithTimeout<any>(aqiUrl, 5000).catch(() => null),
    ]);

    const c = forecastRes.current;
    const h = forecastRes.hourly;
    const d = forecastRes.daily;

    const allHourly: HourlyForecastItem[] = (h.time || []).map((time: string, i: number) => ({
      time,
      temperature: h.temperature_2m?.[i] ?? 0,
      apparentTemperature: h.apparent_temperature?.[i] ?? 0,
      humidity: h.relative_humidity_2m?.[i] ?? 0,
      precipitationProbability: h.precipitation_probability?.[i] ?? 0,
      precipitation: h.precipitation?.[i] ?? 0,
      weatherCode: h.weather_code?.[i] ?? 0,
      pressureMsl: h.pressure_msl?.[i] ?? 1013,
      visibility: h.visibility?.[i] ?? 10000,
      windSpeed: h.wind_speed_10m?.[i] ?? 0,
      windGusts: h.wind_gusts_10m?.[i] ?? 0,
      uvIndex: h.uv_index?.[i] ?? 0,
      isDay: Boolean(h.is_day?.[i] ?? 1),
    }));

    const currentHourPrefix = String(c.time || '').slice(0, 13);
    let startIdx = allHourly.findIndex((item) => item.time.slice(0, 13) >= currentHourPrefix);
    if (startIdx < 0) startIdx = 0;
    const hourly = allHourly.slice(startIdx, startIdx + 25);

    const currentHourData = hourly[0] || allHourly[0];

    const current: CurrentWeather = {
      time: c.time,
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      isDay: Boolean(c.is_day),
      precipitation: c.precipitation,
      rain: c.rain,
      weatherCode: c.weather_code,
      cloudCover: c.cloud_cover,
      pressureMsl: c.pressure_msl,
      surfacePressure: c.surface_pressure,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      windGusts: c.wind_gusts_10m,
      visibility: currentHourData?.visibility ?? 10000,
      uvIndex: currentHourData?.uvIndex ?? 0,
      aqi: aqiRes?.current
        ? {
            usAqi: aqiRes.current.us_aqi ?? null,
            europeanAqi: aqiRes.current.european_aqi ?? null,
            pm25: aqiRes.current.pm2_5 ?? null,
            pm10: aqiRes.current.pm10 ?? null,
          }
        : undefined,
    };

    const daily: DailyForecastItem[] = (d.time || []).map((date: string, i: number) => ({
      date,
      weatherCode: d.weather_code?.[i] ?? 0,
      tempMax: d.temperature_2m_max?.[i] ?? 0,
      tempMin: d.temperature_2m_min?.[i] ?? 0,
      apparentTempMax: d.apparent_temperature_max?.[i] ?? 0,
      apparentTempMin: d.apparent_temperature_min?.[i] ?? 0,
      sunrise: d.sunrise?.[i] ?? '',
      sunset: d.sunset?.[i] ?? '',
      uvIndexMax: d.uv_index_max?.[i] ?? 0,
      precipitationSum: d.precipitation_sum?.[i] ?? 0,
      rainSum: d.rain_sum?.[i] ?? 0,
      precipitationProbabilityMax: d.precipitation_probability_max?.[i] ?? 0,
      windSpeedMax: d.wind_speed_10m_max?.[i] ?? 0,
      windGustsMax: d.wind_gusts_10m_max?.[i] ?? 0,
      windDirectionDominant: d.wind_direction_10m_dominant?.[i] ?? 0,
    }));

    const fetchedAt = new Date().toISOString();
    const enrichedLocation: LocationInfo = {
      ...location,
      timezone: forecastRes.timezone,
      isOdisha: isLocationInOdisha(location),
    };

    const alerts = evaluateWeatherAlerts(current, hourly, daily, enrichedLocation, fetchedAt);
    const riskAssessment = evaluateDisasterRisk(current, hourly, daily, enrichedLocation, fetchedAt);

    const bundle: WeatherBundle = {
      location: enrichedLocation,
      timezone: forecastRes.timezone || 'UTC',
      timezoneAbbreviation: forecastRes.timezone_abbreviation || 'UTC',
      fetchedAt,
      source: 'Open-Meteo Live Weather & Air Quality API',
      current,
      hourly,
      daily,
      alerts,
      riskAssessment,
    };

    weatherCache.set(cacheKey, { data: bundle, expiresAt: Date.now() + CACHE_TTL_MS });
    return bundle;
  } catch (error) {
    if (cached) {
      return {
        ...cached.data,
        isCachedFallback: true,
      };
    }
    throw error;
  }
}

export async function fetchOdishaNetwork(): Promise<OdishaStationStatus[]> {
  if (odishaCache.entry && Date.now() < odishaCache.entry.expiresAt) {
    return odishaCache.entry.data;
  }

  const lats = ODISHA_STATIONS.map((s) => s.latitude).join(',');
  const lons = ODISHA_STATIONS.map((s) => s.longitude).join(',');
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m` +
    `&timezone=Asia%2FKolkata`;

  try {
    const raw = await fetchJsonWithTimeout<any>(url, 9000);
    const items = Array.isArray(raw) ? raw : [raw];

    const stations: OdishaStationStatus[] = ODISHA_STATIONS.map((station, idx) => {
      const c = items[idx]?.current || {};
      const gusts = c.wind_gusts_10m ?? 0;
      const precip = c.precipitation ?? 0;
      const code = c.weather_code ?? 0;
      const pressure = c.pressure_msl ?? 1013;

      let riskLevel: OdishaStationStatus['riskLevel'] = 'Nominal';
      if (gusts >= 62 || precip >= 15 || [95, 96, 99].includes(code) || pressure <= 996) {
        riskLevel = 'Severe';
      } else if (gusts >= 42 || precip >= 5 || pressure <= 1002) {
        riskLevel = 'Advisory';
      } else if (gusts >= 28 || precip >= 1 || [61, 63, 80, 81].includes(code)) {
        riskLevel = 'Watch';
      }

      return {
        name: station.name,
        district: station.district,
        latitude: station.latitude,
        longitude: station.longitude,
        coastal: station.coastal,
        temperature: c.temperature_2m ?? 0,
        humidity: c.relative_humidity_2m ?? 0,
        windSpeed: c.wind_speed_10m ?? 0,
        windGusts: gusts,
        precipitation: precip,
        weatherCode: code,
        pressureMsl: pressure,
        riskLevel,
      };
    });

    odishaCache.entry = { data: stations, expiresAt: Date.now() + CACHE_TTL_MS };
    return stations;
  } catch (error) {
    if (odishaCache.entry) {
      return odishaCache.entry.data;
    }
    throw error;
  }
}

export async function fetchClimateAnalytics(location: LocationInfo): Promise<ClimateAnalyticsData> {
  const cacheKey = `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
  const cached = climateCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, location };
  }

  // Use safe archive window ending 5 days ago (ERA5 archive lag is typically ~2-5 days)
  const endDateObj = new Date(Date.now() - 5 * 86400_000);
  const startDateObj = new Date(endDateObj.getTime() - 365 * 86400_000);
  const multiYearStartObj = new Date(Date.UTC(endDateObj.getUTCFullYear() - 3, 0, 1));

  const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10);
  const periodStart = formatIsoDate(startDateObj);
  const periodEnd = formatIsoDate(endDateObj);
  const multiStart = formatIsoDate(multiYearStartObj);

  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&start_date=${multiStart}&end_date=${periodEnd}` +
    `&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;

  const res = await fetchJsonWithTimeout<any>(url, 12000);
  const d = res.daily || {};
  const times: string[] = d.time || [];

  const monthlyMap = new Map<
    string,
    { temps: number[]; maxT: number; minT: number; rain: number; windMax: number }
  >();
  const yearlyMap = new Map<string, { temps: number[]; rain: number; windMax: number }>();

  for (let i = 0; i < times.length; i++) {
    const dateStr = times[i];
    const tMean = d.temperature_2m_mean?.[i];
    const tMax = d.temperature_2m_max?.[i];
    const tMin = d.temperature_2m_min?.[i];
    const precip = d.precipitation_sum?.[i] ?? 0;
    const wind = d.wind_speed_10m_max?.[i] ?? 0;

    if (tMean == null) continue;

    const yearKey = dateStr.slice(0, 4);
    const yEntry = yearlyMap.get(yearKey) || { temps: [], rain: 0, windMax: 0 };
    yEntry.temps.push(tMean);
    yEntry.rain += precip;
    if (wind > yEntry.windMax) yEntry.windMax = wind;
    yearlyMap.set(yearKey, yEntry);

    // Monthly breakdown strictly for the trailing 12-month window
    if (dateStr >= periodStart) {
      const mKey = dateStr.slice(0, 7);
      const mEntry = monthlyMap.get(mKey) || {
        temps: [],
        maxT: -999,
        minT: 999,
        rain: 0,
        windMax: 0,
      };
      mEntry.temps.push(tMean);
      if (tMax != null && tMax > mEntry.maxT) mEntry.maxT = tMax;
      if (tMin != null && tMin < mEntry.minT) mEntry.minT = tMin;
      mEntry.rain += precip;
      if (wind > mEntry.windMax) mEntry.windMax = wind;
      monthlyMap.set(mKey, mEntry);
    }
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthly: MonthlyClimatePoint[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, m]) => {
      const [yr, mo] = month.split('-').map(Number);
      const avg = m.temps.reduce((a, b) => a + b, 0) / Math.max(1, m.temps.length);
      return {
        month,
        label: `${monthNames[(mo - 1) % 12]} '${String(yr).slice(2)}`,
        avgTempC: Number(avg.toFixed(1)),
        maxTempC: Number((m.maxT > -900 ? m.maxT : avg).toFixed(1)),
        minTempC: Number((m.minT < 900 ? m.minT : avg).toFixed(1)),
        totalPrecipMm: Number(m.rain.toFixed(1)),
        maxWindKmh: Number(m.windMax.toFixed(1)),
      };
    });

  const yearlyComparison: YearlyComparisonPoint[] = Array.from(yearlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, y]) => ({
      year,
      avgTempC: Number((y.temps.reduce((a, b) => a + b, 0) / Math.max(1, y.temps.length)).toFixed(1)),
      totalPrecipMm: Number(y.rain.toFixed(1)),
      maxWindKmh: Number(y.windMax.toFixed(1)),
    }));

  const warmest = [...monthly].sort((a, b) => b.avgTempC - a.avgTempC)[0];
  const wettest = [...monthly].sort((a, b) => b.totalPrecipMm - a.totalPrecipMm)[0];
  const annualAvgTempC =
    monthly.reduce((s, m) => s + m.avgTempC, 0) / Math.max(1, monthly.length);
  const annualTotalRainMm = monthly.reduce((s, m) => s + m.totalPrecipMm, 0);
  const peakWindKmh = Math.max(0, ...monthly.map((m) => m.maxWindKmh));

  const payload: ClimateAnalyticsData = {
    location,
    periodStart,
    periodEnd,
    source: 'Open-Meteo Historical ERA5 Reanalysis Archive',
    fetchedAt: new Date().toISOString(),
    monthly,
    yearlyComparison,
    summary: {
      warmestMonth: warmest ? `${warmest.label} (${warmest.avgTempC}°C)` : 'N/A',
      wettestMonth: wettest ? `${wettest.label} (${wettest.totalPrecipMm} mm)` : 'N/A',
      annualAvgTempC: Number(annualAvgTempC.toFixed(1)),
      annualTotalRainMm: Number(annualTotalRainMm.toFixed(1)),
      peakWindKmh: Number(peakWindKmh.toFixed(1)),
    },
  };

  climateCache.set(cacheKey, { data: payload, expiresAt: Date.now() + CLIMATE_TTL_MS });
  return payload;
}

export async function fetchFloodMonitor(location: LocationInfo): Promise<FloodMonitorData> {
  const cacheKey = `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
  const cached = floodCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, location };
  }

  const localFloodUrl =
    `https://flood-api.open-meteo.com/v1/flood?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&daily=river_discharge,river_discharge_mean,river_discharge_max&forecast_days=7`;

  const localRainUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&daily=precipitation_sum&forecast_days=7&timezone=auto`;

  const basinLats = ODISHA_RIVER_BASINS.map((b) => b.latitude).join(',');
  const basinLons = ODISHA_RIVER_BASINS.map((b) => b.longitude).join(',');
  const basinFloodUrl =
    `https://flood-api.open-meteo.com/v1/flood?latitude=${basinLats}&longitude=${basinLons}` +
    `&daily=river_discharge,river_discharge_mean&forecast_days=2`;
  const basinRainUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${basinLats}&longitude=${basinLons}` +
    `&daily=precipitation_sum&forecast_days=2&timezone=Asia%2FKolkata`;

  const [localFloodRes, localRainRes, basinFloodRes, basinRainRes] = await Promise.all([
    fetchJsonWithTimeout<any>(localFloodUrl, 9000),
    fetchJsonWithTimeout<any>(localRainUrl, 9000),
    fetchJsonWithTimeout<any>(basinFloodUrl, 9000).catch(() => null),
    fetchJsonWithTimeout<any>(basinRainUrl, 9000).catch(() => null),
  ]);

  const fd = localFloodRes.daily || {};
  const times: string[] = fd.time || [];
  const dailyDischarge = times.map((date, i) => ({
    date,
    dischargeM3s: Number((fd.river_discharge?.[i] ?? 0).toFixed(2)),
    dischargeMeanM3s: Number((fd.river_discharge_mean?.[i] ?? 0).toFixed(2)),
    dischargeMaxM3s: Number((fd.river_discharge_max?.[i] ?? 0).toFixed(2)),
  }));

  const currentDischarge = dailyDischarge[0]?.dischargeM3s ?? null;
  const baselineMean = dailyDischarge[0]?.dischargeMeanM3s ?? null;
  const dischargeRatio =
    currentDischarge != null && baselineMean && baselineMean > 0
      ? Number((currentDischarge / baselineMean).toFixed(2))
      : null;

  const rainDaily: number[] = localRainRes?.daily?.precipitation_sum || [];
  const rainNext24hMm = Number((rainDaily[0] ?? 0).toFixed(1));
  const rainNext7dMm = Number(rainDaily.reduce((a, b) => a + (b || 0), 0).toFixed(1));

  let floodRiskLevel: FloodMonitorData['floodRiskLevel'] = 'Normal';
  if ((dischargeRatio != null && dischargeRatio >= 2.5) || rainNext24hMm >= 100) {
    floodRiskLevel = 'Severe';
  } else if ((dischargeRatio != null && dischargeRatio >= 1.8) || rainNext24hMm >= 60) {
    floodRiskLevel = 'High';
  } else if ((dischargeRatio != null && dischargeRatio >= 1.3) || rainNext24hMm >= 25 || rainNext7dMm >= 120) {
    floodRiskLevel = 'Elevated';
  }

  const basinFloodArr = Array.isArray(basinFloodRes) ? basinFloodRes : basinFloodRes ? [basinFloodRes] : [];
  const basinRainArr = Array.isArray(basinRainRes) ? basinRainRes : basinRainRes ? [basinRainRes] : [];

  const odishaBasins: RiverBasinPoint[] = ODISHA_RIVER_BASINS.map((b, i) => {
    const dis = basinFloodArr[i]?.daily?.river_discharge?.[0] ?? 0;
    const mean = basinFloodArr[i]?.daily?.river_discharge_mean?.[0] ?? 0;
    const r24 = basinRainArr[i]?.daily?.precipitation_sum?.[0] ?? 0;
    const ratio = mean > 0 ? dis / mean : 1;
    let risk: RiverBasinPoint['riskLevel'] = 'Normal';
    if (ratio >= 2.5 || r24 >= 100) risk = 'Severe';
    else if (ratio >= 1.8 || r24 >= 60) risk = 'High';
    else if (ratio >= 1.3 || r24 >= 25) risk = 'Elevated';

    return {
      name: b.name,
      river: b.river,
      district: b.district,
      latitude: b.latitude,
      longitude: b.longitude,
      dischargeM3s: Number(dis.toFixed(1)),
      dischargeMeanM3s: Number(mean.toFixed(1)),
      rain24hMm: Number(r24.toFixed(1)),
      riskLevel: risk,
    };
  });

  const safetyRecommendations =
    floodRiskLevel === 'Severe' || floodRiskLevel === 'High'
      ? [
          'Avoid river embankments, causeways, and low-lying floodplains.',
          'Move livestock, vehicles, and essential grain stores to elevated ground.',
          'Follow official Central Water Commission (CWC) & OSDMA flood bulletins.',
        ]
      : [
          'River discharge and 24h rainfall totals remain within manageable seasonal levels.',
          'Keep storm drains clear ahead of peak monsoon or convective downpours.',
        ];

  const payload: FloodMonitorData = {
    location,
    fetchedAt: new Date().toISOString(),
    source: 'Open-Meteo GloFAS Flood API & Forecast Precipitation',
    currentDischargeM3s: currentDischarge,
    baselineMeanM3s: baselineMean,
    dischargeRatio,
    floodRiskLevel,
    rainNext24hMm,
    rainNext7dMm,
    dailyDischarge,
    odishaBasins,
    safetyRecommendations,
  };

  floodCache.set(cacheKey, { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });
  return payload;
}

export async function fetchAgricultureData(location: LocationInfo): Promise<AgricultureData> {
  const cacheKey = `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
  const cached = agriCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, location };
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=temperature_2m,relative_humidity_2m` +
    `&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm,soil_moisture_3_to_9cm,et0_fao_evapotranspiration` +
    `&daily=temperature_2m_max,precipitation_sum,et0_fao_evapotranspiration&forecast_days=3&timezone=auto`;

  const res = await fetchJsonWithTimeout<any>(url, 9000);
  const h = res.hourly || {};
  const d = res.daily || {};

  // Find nearest current hour index
  const curTimePrefix = String(res.current?.time || '').slice(0, 13);
  let idx = (h.time || []).findIndex((t: string) => t.slice(0, 13) >= curTimePrefix);
  if (idx < 0) idx = 0;

  const soilTemp0cmC = Number((h.soil_temperature_0cm?.[idx] ?? res.current?.temperature_2m ?? 25).toFixed(1));
  const topMoisture = Number(((h.soil_moisture_0_to_1cm?.[idx] ?? 0.25) * 100).toFixed(1));
  const rootMoisture = Number(((h.soil_moisture_3_to_9cm?.[idx] ?? 0.25) * 100).toFixed(1));
  const todayEt0Mm = Number((d.et0_fao_evapotranspiration?.[0] ?? 3.5).toFixed(2));
  const next3DaysRainMm = Number(
    ((d.precipitation_sum || []) as number[]).reduce((a, b) => a + (b || 0), 0).toFixed(1)
  );
  const humidityPct = Math.round(res.current?.relative_humidity_2m ?? 60);
  const maxTempTodayC = Number((d.temperature_2m_max?.[0] ?? res.current?.temperature_2m ?? 30).toFixed(1));

  // FAO Net Water Balance (3-day expected rain minus 3-day ET0 demand estimate)
  const et0ThreeDay = ((d.et0_fao_evapotranspiration || []) as number[]).reduce((a, b) => a + (b || 0), 0);
  const netBalance = Number((next3DaysRainMm - et0ThreeDay).toFixed(1));

  let irrigationStatus: AgricultureData['irrigationAdvice']['status'] = 'Standard Irrigation';
  let reason = `Expected 3-day evapotranspiration (${et0ThreeDay.toFixed(1)} mm) slightly exceeds forecast rain (${next3DaysRainMm} mm).`;

  if (next3DaysRainMm >= 20 || rootMoisture >= 36) {
    irrigationStatus = 'Skip Irrigation';
    reason = `Soil root-zone moisture (${rootMoisture}%) and upcoming 3-day rain (${next3DaysRainMm} mm) cover crop water demand; avoid waterlogging.`;
  } else if (netBalance >= 0) {
    irrigationStatus = 'Reduce Irrigation';
    reason = `Forecast rainfall (${next3DaysRainMm} mm) offsets crop evapotranspiration (${et0ThreeDay.toFixed(1)} mm).`;
  } else if (rootMoisture < 18 || maxTempTodayC >= 37) {
    irrigationStatus = 'Increase Irrigation';
    reason = `Low root-zone moisture (${rootMoisture}%) and high thermal demand (${maxTempTodayC}°C max) increase crop water stress; irrigate during early morning or evening.`;
  }

  const isOdishaOrEast = Boolean(location.isOdisha) || (location.longitude >= 81 && location.latitude <= 24);
  const cropAdvisories = [
    {
      crop: isOdishaOrEast ? 'Paddy (Rice)' : 'Cereal Crops (Rice / Wheat)',
      seasonFocus: isOdishaOrEast ? 'Odisha Coastal & Inland Plains' : 'Regional Field Crops',
      recommendation:
        next3DaysRainMm >= 25
          ? 'Maintain bund height and clear excess drainage outlets to prevent submergence during heavy spells.'
          : 'Maintain shallow standing water (2–5 cm) at active vegetative stage; apply top-dressing only on dry windows.',
    },
    {
      crop: 'Pulses & Oilseeds (Moong / Mustard / Groundnut)',
      seasonFocus: 'Moisture-Sensitive Crops',
      recommendation:
        humidityPct >= 80
          ? 'High ambient humidity (' + humidityPct + '%) elevates fungal blight risk; inspect lower leaves and avoid overhead sprinkling.'
          : 'Moderate humidity supports healthy pod filling; schedule light irrigation only if root moisture drops below 20%.',
    },
    {
      crop: 'Horticulture & Vegetables',
      seasonFocus: 'Spraying & Field Operations',
      recommendation:
        next3DaysRainMm >= 10
          ? 'Postpone foliar pesticide or fertilizer spraying ahead of rain to prevent nutrient wash-off.'
          : `Soil surface temp is ${soilTemp0cmC}°C; mulch young seedlings if midday temperatures exceed 34°C.`,
    },
  ];

  const payload: AgricultureData = {
    location,
    fetchedAt: new Date().toISOString(),
    source: 'Open-Meteo Soil Moisture, Soil Temperature & FAO ET₀ API',
    soilTemp0cmC,
    soilMoistureTopPct: topMoisture,
    soilMoistureRootPct: rootMoisture,
    todayEt0Mm,
    next3DaysRainMm,
    humidityPct,
    maxTempTodayC,
    irrigationAdvice: {
      status: irrigationStatus,
      netWaterBalanceMm: netBalance,
      reason,
    },
    cropAdvisories,
  };

  agriCache.set(cacheKey, { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });
  return payload;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchTravelRouteForecast(
  source: LocationInfo,
  destination: LocationInfo
): Promise<TravelRouteForecast> {
  let geometry: Array<[number, number]> = [
    [source.latitude, source.longitude],
    [destination.latitude, destination.longitude],
  ];
  let distanceKm = haversineKm(source.latitude, source.longitude, destination.latitude, destination.longitude);
  let durationMinutes = Math.round((distanceKm / 55) * 60);
  let routeSource: TravelRouteForecast['routeSource'] = 'Direct Corridor Estimate';

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}?overview=simplified&geometries=geojson`;
    const osrm = await fetchJsonWithTimeout<any>(osrmUrl, 7000);
    const route = osrm?.routes?.[0];
    if (route?.geometry?.coordinates?.length >= 2) {
      geometry = (route.geometry.coordinates as Array<[number, number]>).map(([lon, lat]) => [lat, lon]);
      distanceKm = Number((route.distance / 1000).toFixed(1));
      durationMinutes = Math.round(route.duration / 60);
      routeSource = 'OSRM Driving Route';
    }
  } catch {
    // Keep great-circle corridor fallback
  }

  // Sample 5 evenly spaced points along geometry
  const sampleIndices = [
    0,
    Math.floor((geometry.length - 1) * 0.25),
    Math.floor((geometry.length - 1) * 0.5),
    Math.floor((geometry.length - 1) * 0.75),
    geometry.length - 1,
  ];
  const sampleCoords = sampleIndices.map((idx, i) => {
    const [lat, lon] = geometry[idx];
    const label =
      i === 0
        ? `Origin: ${source.name}`
        : i === 4
        ? `Destination: ${destination.name}`
        : `Corridor Pt ${i} (${Math.round((i / 4) * 100)}%)`;
    return { label, lat, lon };
  });

  const lats = sampleCoords.map((p) => p.lat.toFixed(4)).join(',');
  const lons = sampleCoords.map((p) => p.lon.toFixed(4)).join(',');
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&current=temperature_2m,weather_code,precipitation,wind_speed_10m,wind_gusts_10m` +
    `&hourly=precipitation_probability,precipitation,weather_code,wind_gusts_10m,visibility` +
    `&forecast_days=2&timezone=auto`;

  const raw = await fetchJsonWithTimeout<any>(weatherUrl, 9000);
  const list = Array.isArray(raw) ? raw : [raw];

  const waypoints: RouteWaypointWeather[] = sampleCoords.map((pt, i) => {
    const item = list[i] || {};
    const c = item.current || {};
    const h = item.hourly || {};
    const curPrefix = String(c.time || '').slice(0, 13);
    let hIdx = (h.time || []).findIndex((t: string) => t.slice(0, 13) >= curPrefix);
    if (hIdx < 0) hIdx = 0;

    const prob = h.precipitation_probability?.[hIdx] ?? 0;
    const rainMm = c.precipitation ?? h.precipitation?.[hIdx] ?? 0;
    const gusts = c.wind_gusts_10m ?? h.wind_gusts_10m?.[hIdx] ?? 0;
    const vis = h.visibility?.[hIdx] ?? 10000;
    const code = c.weather_code ?? 0;

    let hazard: RouteWaypointWeather['hazardLevel'] = 'Clear';
    if ([95, 96, 99].includes(code) || gusts >= 55 || rainMm >= 10 || vis < 800) {
      hazard = 'Severe';
    } else if (prob >= 60 || gusts >= 38 || rainMm >= 2 || vis < 2500) {
      hazard = 'Caution';
    }

    return {
      label: pt.label,
      latitude: Number(pt.lat.toFixed(4)),
      longitude: Number(pt.lon.toFixed(4)),
      temperature: Number((c.temperature_2m ?? 0).toFixed(1)),
      weatherCode: code,
      precipitationProb: Math.round(prob),
      precipitationMm: Number(rainMm.toFixed(1)),
      windSpeedKmh: Math.round(c.wind_speed_10m ?? 0),
      windGustKmh: Math.round(gusts),
      visibilityM: Math.round(vis),
      hazardLevel: hazard,
    };
  });

  const warnings: string[] = [];
  waypoints.forEach((wp) => {
    if (wp.hazardLevel === 'Severe') {
      warnings.push(
        `Severe hazard near ${wp.label}: ${wp.precipitationMm} mm rain, gusts ${wp.windGustKmh} km/h, visibility ${(wp.visibilityM / 1000).toFixed(1)} km.`
      );
    } else if (wp.hazardLevel === 'Caution') {
      warnings.push(
        `Caution near ${wp.label}: ${wp.precipitationProb}% rain chance, gusts ${wp.windGustKmh} km/h.`
      );
    }
  });

  // Evaluate next 24h departure windows in 4-hour increments using origin & destination hourly forecasts
  const originHours = list[0]?.hourly || {};
  const destHours = list[list.length - 1]?.hourly || {};
  const curPrefix = String(list[0]?.current?.time || '').slice(0, 13);
  let startIdx = (originHours.time || []).findIndex((t: string) => t.slice(0, 13) >= curPrefix);
  if (startIdx < 0) startIdx = 0;

  const recommendedWindows: TravelRouteForecast['recommendedWindows'] = [];
  for (let offset = 0; offset < 24; offset += 4) {
    const idx = startIdx + offset;
    const iso = originHours.time?.[idx];
    if (!iso) break;
    const maxProb = Math.max(
      originHours.precipitation_probability?.[idx] ?? 0,
      destHours.precipitation_probability?.[idx] ?? 0
    );
    const maxGust = Math.max(
      originHours.wind_gusts_10m?.[idx] ?? 0,
      destHours.wind_gusts_10m?.[idx] ?? 0
    );
    const minVis = Math.min(
      originHours.visibility?.[idx] ?? 10000,
      destHours.visibility?.[idx] ?? 10000
    );
    const storm =
      [95, 96, 99].includes(originHours.weather_code?.[idx]) ||
      [95, 96, 99].includes(destHours.weather_code?.[idx]);

    let safetyRating: 'Optimal' | 'Fair' | 'Avoid' = 'Optimal';
    let reason = `Low rain risk (${Math.round(maxProb)}%), clear visibility (${(minVis / 1000).toFixed(1)} km).`;

    if (storm || maxGust >= 55 || minVis < 800) {
      safetyRating = 'Avoid';
      reason = `Severe storm, gusts (${Math.round(maxGust)} km/h), or low visibility (${(minVis / 1000).toFixed(1)} km).`;
    } else if (maxProb >= 55 || maxGust >= 38 || minVis < 2500) {
      safetyRating = 'Fair';
      reason = `Moderate rain probability (${Math.round(maxProb)}%) or breezy gusts (${Math.round(maxGust)} km/h).`;
    }

    const hourNum = parseInt(iso.split('T')[1]?.slice(0, 2) || '0', 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const h12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
    const timeLabel = `${iso.slice(5, 10)} · ${h12}:00 ${period}`;

    recommendedWindows.push({
      timeLabel,
      isoTime: iso,
      safetyRating,
      reason,
    });
  }

  return {
    source,
    destination,
    distanceKm: Number(distanceKm.toFixed(1)),
    durationMinutes,
    routeSource,
    geometry,
    waypoints,
    warnings,
    recommendedWindows,
    fetchedAt: new Date().toISOString(),
  };
}
