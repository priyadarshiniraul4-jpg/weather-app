import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Droplets, Sunrise, Sunset, Wind } from 'lucide-react';
import type { UserSettings, WeatherBundle } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { HourlyTempRainChart } from '../components/Charts';
import { WeatherIcon } from '../components/WeatherIcon';
import {
  formatClockTime,
  formatDayName,
  formatHourLabel,
  formatShortDate,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
} from '../utils/formatters';
import { getWindCompass, getWmoInfo } from '../utils/weatherCodes';

interface ForecastPageProps {
  bundle: WeatherBundle;
  settings: UserSettings;
  t: TranslationSchema;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ bundle, settings, t }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const { hourly, daily } = bundle;

  const weekMin = Math.min(...daily.map((d) => d.tempMin));
  const weekMax = Math.max(...daily.map((d) => d.tempMax));
  const weekSpan = Math.max(1, weekMax - weekMin);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.forecast.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {bundle.location.name}
          {bundle.location.admin1 ? `, ${bundle.location.admin1}` : ''} · {t.forecast.subtitle}
        </p>
      </header>

      {/* 24-Hour Interactive Chart + Scrollable Hour Strip */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.forecast.hourly24Title}
        </h2>
        <HourlyTempRainChart hourly={hourly} tempUnit={settings.tempUnit} />

        <div className="mt-6 overflow-x-auto border-t border-slate-200/80 pt-4 dark:border-slate-800">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-3 font-medium">Time</th>
                <th className="py-2 pr-3 font-medium">Condition</th>
                <th className="py-2 pr-3 font-medium text-right">{t.forecast.tempLabel}</th>
                <th className="py-2 pr-3 font-medium text-right">{t.forecast.rainProbLabel}</th>
                <th className="py-2 pr-3 font-medium text-right">{t.forecast.precipSumLabel}</th>
                <th className="py-2 pr-3 font-medium text-right">{t.metrics.wind}</th>
                <th className="py-2 pr-3 font-medium text-right">{t.metrics.uvIndex}</th>
                <th className="py-2 font-medium text-right">{t.metrics.visibility}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {hourly.slice(0, 24).map((h) => {
                const info = getWmoInfo(h.weatherCode, settings.language);
                return (
                  <tr key={h.time} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 pr-3 font-mono font-medium text-slate-900 tabular-nums dark:text-slate-100">
                      {formatHourLabel(h.time)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <WeatherIcon code={h.weatherCode} isDay={h.isDay} size={20} />
                        <span className="text-slate-700 dark:text-slate-300">{info.label}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono font-semibold text-slate-900 tabular-nums dark:text-white">
                      {formatTemperature(h.temperature, settings.tempUnit)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-sky-600 tabular-nums dark:text-sky-400">
                      {Math.round(h.precipitationProbability)}%
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-600 tabular-nums dark:text-slate-300">
                      {h.precipitation.toFixed(1)} mm
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-600 tabular-nums dark:text-slate-300">
                      {formatWindSpeed(h.windSpeed, settings.windUnit)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-600 tabular-nums dark:text-slate-300">
                      {h.uvIndex.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600 tabular-nums dark:text-slate-300">
                      {formatVisibility(h.visibility)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7-Day Extended Forecast */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.forecast.daily7Title}
        </h2>

        <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
          {daily.map((day, idx) => {
            const info = getWmoInfo(day.weatherCode, settings.language);
            const leftPct = ((day.tempMin - weekMin) / weekSpan) * 100;
            const widthPct = Math.max(8, ((day.tempMax - day.tempMin) / weekSpan) * 100);
            const isExpanded = expandedDay === idx;

            return (
              <div key={day.date} className="py-3">
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : idx)}
                  className="grid w-full grid-cols-12 items-center gap-2 text-left transition-colors hover:opacity-90"
                  aria-expanded={isExpanded}
                >
                  <div className="col-span-4 sm:col-span-3">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatDayName(day.date, idx)}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {formatShortDate(day.date)}
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                    <WeatherIcon code={day.weatherCode} size={26} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                        {info.label}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-sky-600 tabular-nums dark:text-sky-400">
                        <Droplets className="h-3 w-3" />
                        <span>{Math.round(day.precipitationProbabilityMax)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-5 flex items-center gap-3">
                    <span className="w-10 text-right font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      {formatTemperature(day.tempMin, settings.tempUnit)}
                    </span>
                    <div className="relative hidden h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 sm:block">
                      <div
                        className="absolute top-0 h-full rounded-full bg-gradient-to-r from-sky-500 via-amber-400 to-orange-500"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="w-10 font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-white">
                      {formatTemperature(day.tempMax, settings.tempUnit)}
                    </span>
                  </div>

                  <div className="hidden sm:col-span-1 sm:flex justify-end text-slate-400">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 grid grid-cols-2 gap-4 rounded-xl bg-slate-50/90 p-3.5 text-xs dark:bg-slate-800/50 sm:grid-cols-5">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">{t.forecast.precipSumLabel}</div>
                      <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {day.precipitationSum.toFixed(1)} mm ({Math.round(day.precipitationProbabilityMax)}%)
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Wind className="h-3 w-3" />
                        <span>{t.forecast.windMaxLabel}</span>
                      </div>
                      <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {formatWindSpeed(day.windSpeedMax, settings.windUnit)} ({getWindCompass(day.windDirectionDominant)})
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                        {t.metrics.gusts} {formatWindSpeed(day.windGustsMax, settings.windUnit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">{t.forecast.uvMaxLabel}</div>
                      <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {day.uvIndexMax.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Sunrise className="h-3 w-3" />
                        <span>{t.metrics.sunrise}</span>
                      </div>
                      <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {formatClockTime(day.sunrise)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Sunset className="h-3 w-3" />
                        <span>{t.metrics.sunset}</span>
                      </div>
                      <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {formatClockTime(day.sunset)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
