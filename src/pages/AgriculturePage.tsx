import React, { useEffect, useState } from 'react';
import { Droplets, Loader2, RefreshCw, Sprout, Sun, Thermometer } from 'lucide-react';
import type { AgricultureData, LocationInfo, UserSettings } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { formatTemperature } from '../utils/formatters';

interface AgriculturePageProps {
  location: LocationInfo;
  settings: UserSettings;
  t: TranslationSchema;
}

export const AgriculturePage: React.FC<AgriculturePageProps> = ({ location, settings, t }) => {
  const [data, setData] = useState<AgricultureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgri = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(location.latitude),
        lon: String(location.longitude),
        name: location.name,
        country: location.country,
      });
      if (location.admin1) params.set('admin1', location.admin1);
      const res = await fetch(`/api/agriculture?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load agriculture telemetry');
      setData(json as AgricultureData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgri();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/30">
        <p className="text-sm font-medium text-rose-800 dark:text-rose-200">{error}</p>
        <button
          onClick={loadAgri}
          className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.agriculture.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {location.name} · {t.agriculture.subtitle}
          </p>
        </div>
        <button
          onClick={loadAgri}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span>{t.topbar.refresh}</span>
        </button>
      </header>

      {/* Irrigation Recommendation Hero */}
      <section className="rounded-2xl border border-emerald-300/80 bg-emerald-50/70 p-6 dark:border-emerald-900/70 dark:bg-emerald-950/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {t.agriculture.irrigationTitle}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              {data.irrigationAdvice.status}
            </h2>
          </div>
          <div className="text-right font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
            <div>3-Day Net Water Balance: {data.irrigationAdvice.netWaterBalanceMm >= 0 ? '+' : ''}{data.irrigationAdvice.netWaterBalanceMm} mm</div>
            <div>3-Day Forecast Rain: {data.next3DaysRainMm} mm</div>
          </div>
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {data.irrigationAdvice.reason}
        </p>
      </section>

      {/* 4 Soil & Evapotranspiration Metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Thermometer className="h-3.5 w-3.5 text-amber-500" />
            <span>{t.agriculture.soilTemp}</span>
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {formatTemperature(data.soilTemp0cmC, settings.tempUnit)}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Air Max {formatTemperature(data.maxTempTodayC, settings.tempUnit)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Droplets className="h-3.5 w-3.5 text-sky-600" />
            <span>{t.agriculture.topMoisture}</span>
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-sky-600 tabular-nums dark:text-sky-400">
            {data.soilMoistureTopPct}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Volumetric water</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Sprout className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t.agriculture.rootMoisture}</span>
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
            {data.soilMoistureRootPct}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Humidity {data.humidityPct}%</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>{t.agriculture.et0Label}</span>
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {data.todayEt0Mm} mm
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Penman-Monteith ET₀</div>
        </div>
      </section>

      {/* Regional Crop Advisories */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.agriculture.cropAdvisoriesTitle}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.cropAdvisories.map((c) => (
            <article
              key={c.crop}
              className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                {c.seasonFocus}
              </div>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{c.crop}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {c.recommendation}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
          Telemetry Source: {data.source} · Updated {new Date(data.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </section>
    </div>
  );
};
