import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  Droplets,
  ExternalLink,
  Eye,
  Gauge,
  MapPin,
  ShieldAlert,
  Sparkles,
  Sun,
  Wind,
} from 'lucide-react';
import type {
  AiInsightsResponse,
  LocationInfo,
  OdishaStationStatus,
  PageRoute,
  UserSettings,
  WeatherBundle,
} from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { WeatherBackdrop } from '../components/WeatherBackdrop';
import { WeatherIcon } from '../components/WeatherIcon';
import { HourlyTempRainChart, SolarArc } from '../components/Charts';
import {
  formatClockTime,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
} from '../utils/formatters';
import { getUvCategory, getWindCompass, getWmoInfo } from '../utils/weatherCodes';
import { FEATURED_INDIAN_CITIES } from '../data/indianLocations';

interface HomePageProps {
  bundle: WeatherBundle;
  insights: AiInsightsResponse | null;
  insightsLoading: boolean;
  odishaStations: OdishaStationStatus[];
  odishaLoading: boolean;
  settings: UserSettings;
  t: TranslationSchema;
  onSelectLocation: (loc: LocationInfo) => void;
  onNavigate: (page: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  bundle,
  insights,
  insightsLoading,
  odishaStations,
  odishaLoading,
  settings,
  t,
  onSelectLocation,
  onNavigate,
}) => {
  const { current, daily, hourly, location, alerts, riskAssessment } = bundle;
  const today = daily[0];
  const condition = getWmoInfo(current.weatherCode, settings.language);
  const uvInfo = getUvCategory(current.uvIndex);
  const appAdvisories = alerts.filter((a) => a.origin === 'app_advisory');
  const severeAdvisories = appAdvisories.filter(
    (a) => a.severity === 'Extreme' || a.severity === 'Severe' || a.severity === 'Moderate'
  );

  const riskBadgeColor = (level: 'Low' | 'Moderate' | 'High' | 'Severe') => {
    if (level === 'Severe') return 'text-rose-600 dark:text-rose-400';
    if (level === 'High') return 'text-orange-600 dark:text-orange-400';
    if (level === 'Moderate') return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner (only shown when real threshold advisories are active) */}
      {severeAdvisories.length > 0 && (
        <div
          role="region"
          aria-label="Active weather advisories"
          className="flex flex-col justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50/90 px-4 py-3 text-amber-950 backdrop-blur-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-sm font-semibold">
                {severeAdvisories[0].severity} · {severeAdvisories[0].title}
              </div>
              <p className="text-xs text-amber-900/85 dark:text-amber-200/85">
                {severeAdvisories[0].description}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 sm:self-center whitespace-nowrap"
          >
            <span>{t.nav.alerts} ({appAdvisories.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Hero Weather Surface + Solar/Air Quality Column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-8 flex flex-col justify-between">
          <WeatherBackdrop weatherCode={current.weatherCode} isDay={current.isDay} />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {location.name}
                  {location.admin1 ? `, ${location.admin1}` : ''}
                </span>
                <span aria-hidden="true">·</span>
                <span>{location.country}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                </span>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={76} className="shrink-0" />
                <div>
                  <div className="font-display text-5xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white sm:text-6xl">
                    {formatTemperature(current.temperature, settings.tempUnit)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{condition.label}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {t.metrics.feelsLike} {formatTemperature(current.apparentTemperature, settings.tempUnit)}
                    </span>
                    {today && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-xs tabular-nums">
                          H {formatTemperature(today.tempMax, settings.tempUnit)} / L{' '}
                          {formatTemperature(today.tempMin, settings.tempUnit)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
              <div>{bundle.source}</div>
              <div className="mt-0.5 font-mono tabular-nums">
                Updated {formatClockTime(current.time)} ({bundle.timezoneAbbreviation})
              </div>
              {bundle.isCachedFallback && (
                <div className="mt-1 text-amber-600 dark:text-amber-400">
                  Serving cached telemetry while reconnecting
                </div>
              )}
            </div>
          </div>

          {/* 6-Metric Hairline Strip */}
          <div className="relative z-10 mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-200/80 pt-5 dark:border-slate-800 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Wind className="h-3.5 w-3.5" />
                <span>{t.metrics.wind}</span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {formatWindSpeed(current.windSpeed, settings.windUnit)}
              </div>
              <div className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                {getWindCompass(current.windDirection)} · {t.metrics.gusts}{' '}
                {formatWindSpeed(current.windGusts, settings.windUnit)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Droplets className="h-3.5 w-3.5" />
                <span>{t.metrics.humidity}</span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {Math.round(current.humidity)}%
              </div>
              <div className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                {t.metrics.cloudCover} {Math.round(current.cloudCover)}%
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Gauge className="h-3.5 w-3.5" />
                <span>{t.metrics.pressure}</span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {formatPressure(current.pressureMsl, settings.pressureUnit)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {current.pressureMsl <= 1002 ? 'Low system' : 'Sea-level MSL'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Sun className="h-3.5 w-3.5" />
                <span>{t.metrics.uvIndex}</span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {current.uvIndex.toFixed(1)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{uvInfo.label}</div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Eye className="h-3.5 w-3.5" />
                <span>{t.metrics.visibility}</span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {formatVisibility(current.visibility)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {current.visibility < 1000 ? 'Foggy' : 'Clear horizon'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Compass className="h-3.5 w-3.5" />
                <span>{t.metrics.precipitation}</span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {current.precipitation.toFixed(1)} mm
              </div>
              <div className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                {current.aqi?.usAqi != null ? `US AQI ${current.aqi.usAqi}` : 'Live surface'}
              </div>
            </div>
          </div>
        </section>

        {/* Right Side Panel: Solar Daylight + Quick Actions */}
        <aside className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t.metrics.sunrise} &amp; {t.metrics.sunset}
            </h2>
            {today && (
              <div className="mt-3">
                <SolarArc
                  sunrise={today.sunrise}
                  sunset={today.sunset}
                  currentTime={current.time}
                  sunriseLabel={t.metrics.sunrise}
                  sunsetLabel={t.metrics.sunset}
                />
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-200/80 pt-4 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t.home.activeAdvisories}</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {appAdvisories.length}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
              {appAdvisories.length > 0
                ? `${appAdvisories[0].title} (${appAdvisories[0].severity})`
                : t.home.noSevereAlerts}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('forecast')}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
              >
                {t.home.viewAllForecast}
              </button>
              <button
                onClick={() => onNavigate('assistant')}
                className="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
              >
                {t.home.askAssistant}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* AI Disaster Risk Intelligence Section */}
      {riskAssessment && (
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.home.riskTitle}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Overall Risk:{' '}
                <strong className={riskBadgeColor(riskAssessment.overallLevel)}>
                  {riskAssessment.overallLevel}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.home.confidenceLabel}: <strong className="text-slate-700 dark:text-slate-200">{riskAssessment.confidenceLabel}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Clock className="h-3 w-3" />
                {new Date(riskAssessment.dataTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            {riskAssessment.primaryDriver}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {riskAssessment.dimensions.map((dim) => (
              <div
                key={dim.id}
                className="rounded-xl border border-slate-200/80 p-3.5 text-xs dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{dim.label}</span>
                  <span className={`font-semibold ${riskBadgeColor(dim.level)}`}>{dim.level}</span>
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-slate-600 tabular-nums dark:text-slate-300">
                  {dim.metricText}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {dim.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3 text-xs dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {t.home.cycloneWatchLabel}:{' '}
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                {riskAssessment.cycloneWatch.status} (MSL {riskAssessment.cycloneWatch.pressureHpa} hPa · Max Gust{' '}
                {formatWindSpeed(riskAssessment.cycloneWatch.maxGustKmh, settings.windUnit)})
              </span>
            </div>
            <a
              href={riskAssessment.cycloneWatch.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-sky-600 hover:underline dark:text-sky-400 whitespace-nowrap"
            >
              <span>{riskAssessment.cycloneWatch.officialSource}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>
      )}

      {/* 24-Hour Telemetry Chart + Grounded AI Brief */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.home.hourlyTitle}
            </h2>
            <button
              onClick={() => onNavigate('forecast')}
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400 whitespace-nowrap"
            >
              {t.home.viewAllForecast}
            </button>
          </div>
          <HourlyTempRainChart hourly={hourly} tempUnit={settings.tempUnit} />
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t.home.aiBriefTitle}
                </h2>
              </div>
              {insights && (
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {insights.engine === 'gemini-4-hydrogen' ? 'Gemini AI' : 'Telemetry'}
                </span>
              )}
            </div>

            {insightsLoading ? (
              <div className="mt-4 space-y-3 animate-pulse">
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : insights ? (
              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <p className="text-sm text-slate-800 dark:text-slate-100">{insights.summary}</p>
                <div className="border-t border-slate-200/80 pt-2.5 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {t.home.activityLabel}:{' '}
                  </span>
                  {insights.activityAdvice}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {t.home.travelLabel}:{' '}
                  </span>
                  {insights.travelAdvice}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {t.home.preparednessLabel}:{' '}
                  </span>
                  {insights.clothingAndSafety}
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => onNavigate('assistant')}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <span>{t.home.askAssistant}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>

      {/* Odisha Coastal & State Network + Featured India & Recent Switcher */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.home.odishaWatchTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.home.odishaWatchSubtitle}</p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400 whitespace-nowrap"
            >
              {t.nav.map}
            </button>
          </div>

          {odishaLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {odishaStations.map((st) => (
                <button
                  key={st.name}
                  onClick={() =>
                    onSelectLocation({
                      name: st.name,
                      admin1: 'Odisha',
                      country: 'India',
                      countryCode: 'IN',
                      latitude: st.latitude,
                      longitude: st.longitude,
                      isOdisha: true,
                    })
                  }
                  className="group rounded-xl border border-slate-200/80 p-3 text-left transition-colors hover:border-sky-400 hover:bg-sky-50/50 dark:border-slate-800 dark:hover:border-sky-500/60 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {st.name}
                    </span>
                    <WeatherIcon code={st.weatherCode} size={20} />
                  </div>
                  <div className="mt-1.5 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-white">
                    {formatTemperature(st.temperature, settings.tempUnit)}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    <span>{formatWindSpeed(st.windSpeed, settings.windUnit)}</span>
                    <span
                      className={
                        st.riskLevel === 'Severe'
                          ? 'font-medium text-rose-600 dark:text-rose-400'
                          : st.riskLevel === 'Advisory'
                          ? 'font-medium text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {st.riskLevel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-4 space-y-5">
          {settings.recentLocations.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.home.recentTitle}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {settings.recentLocations.slice(0, 5).map((loc, idx) => (
                  <button
                    key={`${loc.name}-${idx}`}
                    onClick={() => onSelectLocation(loc)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-sky-300"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t.home.featuredCitiesTitle}
            </h2>
            <div className="mt-2 divide-y divide-slate-200/70 dark:divide-slate-800">
              {FEATURED_INDIAN_CITIES.slice(0, 7).map((city) => {
                const isActive =
                  Math.abs(city.latitude - location.latitude) < 0.05 &&
                  Math.abs(city.longitude - location.longitude) < 0.05;
                return (
                  <button
                    key={city.name}
                    onClick={() => onSelectLocation(city)}
                    className={`flex w-full items-center justify-between py-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'font-semibold text-sky-600 dark:text-sky-400'
                        : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    <span>
                      {city.name}
                      {city.admin1 ? `, ${city.admin1}` : ''}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {city.latitude.toFixed(1)}°, {city.longitude.toFixed(1)}°
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
