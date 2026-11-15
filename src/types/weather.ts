export type LanguageCode = 'en' | 'hi' | 'or';
export type TempUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'mph' | 'ms';
export type PressureUnit = 'hPa' | 'inHg';
export type ThemeMode = 'light' | 'dark';

export type PageRoute =
  | 'home'
  | 'forecast'
  | 'map'
  | 'analytics'
  | 'flood'
  | 'agriculture'
  | 'travel'
  | 'assistant'
  | 'alerts'
  | 'about'
  | 'settings';

export interface LocationInfo {
  id?: string | number;
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isOdisha?: boolean;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  weatherCode: number;
  cloudCover: number;
  pressureMsl: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  visibility: number; // meters
  uvIndex: number;
  aqi?: {
    usAqi: number | null;
    europeanAqi: number | null;
    pm25: number | null;
    pm10: number | null;
  };
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  pressureMsl: number;
  visibility: number;
  windSpeed: number;
  windGusts: number;
  uvIndex: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  rainSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
}

export type AlertOrigin = 'official_reference' | 'app_advisory';
export type AlertSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Low';
export type AlertCategory =
  | 'cyclone'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'heatwave'
  | 'cold_wave'
  | 'wind'
  | 'uv'
  | 'visibility'
  | 'flood'
  | 'official_portal';

export interface WeatherAlert {
  id: string;
  origin: AlertOrigin;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  triggerMetric?: string;
  sourceName: string;
  officialUrl?: string;
  issuedAt: string;
  safetyInstructions: string[];
  regionFocus?: string;
}

export interface RiskDimension {
  id: 'rain_flood' | 'storm_wind' | 'heat_cold' | 'cyclone_pressure';
  label: string;
  level: 'Low' | 'Moderate' | 'High' | 'Severe';
  metricText: string;
  explanation: string;
}

export interface DisasterRiskAssessment {
  overallLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  confidenceLabel: 'High (0–24h NWP Horizon)' | 'Moderate (Multi-day Horizon)';
  dataTimestamp: string;
  primaryDriver: string;
  dimensions: RiskDimension[];
  cycloneWatch: {
    active: boolean;
    status: string;
    pressureHpa: number;
    maxGustKmh: number;
    officialSource: string;
    officialUrl: string;
  };
}

export interface WeatherBundle {
  location: LocationInfo;
  timezone: string;
  timezoneAbbreviation: string;
  fetchedAt: string;
  source: string;
  isCachedFallback?: boolean;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts: WeatherAlert[];
  riskAssessment: DisasterRiskAssessment;
}

export interface OdishaStationStatus {
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  coastal: boolean;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  weatherCode: number;
  pressureMsl: number;
  riskLevel: 'Nominal' | 'Watch' | 'Advisory' | 'Severe';
}

export interface MonthlyClimatePoint {
  month: string; // YYYY-MM
  label: string;
  avgTempC: number;
  maxTempC: number;
  minTempC: number;
  totalPrecipMm: number;
  maxWindKmh: number;
}

export interface YearlyComparisonPoint {
  year: string;
  avgTempC: number;
  totalPrecipMm: number;
  maxWindKmh: number;
}

export interface ClimateAnalyticsData {
  location: LocationInfo;
  periodStart: string;
  periodEnd: string;
  source: string;
  fetchedAt: string;
  monthly: MonthlyClimatePoint[];
  yearlyComparison: YearlyComparisonPoint[];
  summary: {
    warmestMonth: string;
    wettestMonth: string;
    annualAvgTempC: number;
    annualTotalRainMm: number;
    peakWindKmh: number;
  };
}

export interface FloodDailyDischarge {
  date: string;
  dischargeM3s: number;
  dischargeMeanM3s: number;
  dischargeMaxM3s: number;
}

export interface RiverBasinPoint {
  name: string;
  river: string;
  district: string;
  latitude: number;
  longitude: number;
  dischargeM3s: number;
  dischargeMeanM3s: number;
  rain24hMm: number;
  riskLevel: 'Normal' | 'Elevated' | 'High' | 'Severe';
}

export interface FloodMonitorData {
  location: LocationInfo;
  fetchedAt: string;
  source: string;
  currentDischargeM3s: number | null;
  baselineMeanM3s: number | null;
  dischargeRatio: number | null;
  floodRiskLevel: 'Normal' | 'Elevated' | 'High' | 'Severe';
  rainNext24hMm: number;
  rainNext7dMm: number;
  dailyDischarge: FloodDailyDischarge[];
  odishaBasins: RiverBasinPoint[];
  safetyRecommendations: string[];
}

export interface AgricultureData {
  location: LocationInfo;
  fetchedAt: string;
  source: string;
  soilTemp0cmC: number;
  soilMoistureTopPct: number; // 0-1cm volumetric converted to %
  soilMoistureRootPct: number; // 3-9cm volumetric converted to %
  todayEt0Mm: number;
  next3DaysRainMm: number;
  humidityPct: number;
  maxTempTodayC: number;
  irrigationAdvice: {
    status: 'Skip Irrigation' | 'Reduce Irrigation' | 'Standard Irrigation' | 'Increase Irrigation';
    netWaterBalanceMm: number;
    reason: string;
  };
  cropAdvisories: Array<{
    crop: string;
    seasonFocus: string;
    recommendation: string;
  }>;
}

export interface RouteWaypointWeather {
  label: string;
  latitude: number;
  longitude: number;
  temperature: number;
  weatherCode: number;
  precipitationProb: number;
  precipitationMm: number;
  windSpeedKmh: number;
  windGustKmh: number;
  visibilityM: number;
  hazardLevel: 'Clear' | 'Caution' | 'Severe';
}

export interface TravelRouteForecast {
  source: LocationInfo;
  destination: LocationInfo;
  distanceKm: number;
  durationMinutes: number;
  routeSource: 'OSRM Driving Route' | 'Direct Corridor Estimate';
  geometry: Array<[number, number]>; // [lat, lon]
  waypoints: RouteWaypointWeather[];
  warnings: string[];
  recommendedWindows: Array<{
    timeLabel: string;
    isoTime: string;
    safetyRating: 'Optimal' | 'Fair' | 'Avoid';
    reason: string;
  }>;
  fetchedAt: string;
}

export interface AiInsightsResponse {
  summary: string;
  activityAdvice: string;
  travelAdvice: string;
  clothingAndSafety: string;
  engine: 'gemini-4-hydrogen' | 'telemetry-fallback';
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  engine?: string;
}

export interface NotificationLogItem {
  id: string;
  title: string;
  body: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
}

export interface ApiHealthStatus {
  status: 'ok' | 'degraded' | 'offline';
  checkedAt: string;
  latencyMs: number;
  providers: {
    weather: string;
    geocoding: string;
    maps: string;
    ai: string;
  };
}

export interface UserSettings {
  theme: ThemeMode;
  highContrast: boolean;
  language: LanguageCode;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
  autoGpsOnLoad: boolean;
  autoRefreshMinutes: 0 | 5 | 10 | 15;
  notificationsEnabled: boolean;
  defaultLocation: LocationInfo;
  savedLocations: LocationInfo[];
  recentLocations: LocationInfo[];
}
