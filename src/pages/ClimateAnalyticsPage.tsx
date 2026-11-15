import React, { useEffect, useState } from 'react';
import { BarChart3, Loader2, RefreshCw, Thermometer, Wind } from 'lucide-react';
import type { ClimateAnalyticsData, LocationInfo, UserSettings } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { formatTemperature, formatWindSpeed, convertTempNumber } from '../utils/formatters';

interface ClimateAnalyticsPageProps {
  location: LocationInfo;
  settings: UserSettings;
  t: TranslationSchema;
}

export const ClimateAnalyticsPage: React.FC<ClimateAnalyticsPageProps> = ({
  location,
  settings,
  t,
}) => {
  const [data, setData] = useState<ClimateAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const fetchAnalytics = async () => {
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
      const res = await fetch(`/api/analytics?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load climate analytics');
      setData(json as ClimateAnalyticsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/30">
        <p className="text-sm font-medium text-rose-800 dark:text-rose-200">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const monthly = data.monthly;
  const maxRain = Math.max(10, ...monthly.map((m) => m.totalPrecipMm));
  const temps = monthly.map((m) => convertTempNumber(m.avgTempC, settings.tempUnit));
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const spanT = Math.max(4, maxT - minT);

  const w = 760;
  const h = 210;
  const padL = 40;
  const padR = 16;
  const padT = 22;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const getX = (i: number) => padL + (i / Math.max(1, monthly.length - 1)) * plotW;
  const getY = (val: number) => padT + ((maxT - val) / spanT) * plotH;

  const linePath = temps
    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`)
    .join(' ');

  const activeIdx = hoverMonth ?? monthly.length - 1;
  const activePoint = monthly[activeIdx];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.analytics.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {location.name} · {t.analytics.subtitle} ({data.periodStart} to {data.periodEnd})
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span>{t.topbar.refresh}</span>
        </button>
      </header>

      {/* 4 Summary KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="text-xs text-slate-500 dark:text-slate-400">{t.analytics.annualAvgTemp}</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {formatTemperature(data.summary.annualAvgTempC, settings.tempUnit)}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">ERA5 Reanalysis</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="text-xs text-slate-500 dark:text-slate-400">{t.analytics.annualRain}</div>
          <div className="mt-1 font-mono text-2xl font-bold text-sky-600 tabular-nums dark:text-sky-400">
            {data.summary.annualTotalRainMm.toFixed(0)} mm
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">12-month cumulative</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="text-xs text-slate-500 dark:text-slate-400">{t.analytics.warmestMonth}</div>
          <div className="mt-1 font-mono text-lg font-bold text-amber-600 tabular-nums dark:text-amber-400">
            {data.summary.warmestMonth}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Monthly mean</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="text-xs text-slate-500 dark:text-slate-400">{t.analytics.wettestMonth}</div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-white">
            {data.summary.wettestMonth}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Peak wind {formatWindSpeed(data.summary.peakWindKmh, settings.windUnit)}
          </div>
        </div>
      </section>

      {/* Monthly Temperature Trend Chart */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.analytics.monthlyTempTitle}
            </h2>
          </div>
          {activePoint && (
            <div className="font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
              {activePoint.label}: Avg {formatTemperature(activePoint.avgTempC, settings.tempUnit)} · Min{' '}
              {formatTemperature(activePoint.minTempC, settings.tempUnit)} · Max{' '}
              {formatTemperature(activePoint.maxTempC, settings.tempUnit)}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-52 w-full min-w-[540px]" onMouseLeave={() => setHoverMonth(null)}>
            {[0, 0.5, 1].map((frac, idx) => {
              const y = padT + frac * plotH;
              const val = Math.round(maxT - frac * spanT);
              return (
                <g key={idx}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={w - padR}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray="3 3"
                  />
                  <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-slate-400 font-mono text-[10px]">
                    {val}°
                  </text>
                </g>
              );
            })}
            <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {monthly.map((m, i) => {
              const x = getX(i);
              const y = getY(temps[i]);
              return (
                <g key={m.month}>
                  <circle
                    cx={x}
                    cy={y}
                    r={activeIdx === i ? 5 : 3.2}
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={h - 8}
                    textAnchor="middle"
                    className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
                  >
                    {m.label}
                  </text>
                  <rect
                    x={x - plotW / (monthly.length * 2)}
                    y={0}
                    width={plotW / monthly.length}
                    height={h}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverMonth(i)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* Monthly Rainfall & Wind Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-7">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.analytics.monthlyRainTitle}
            </h2>
          </div>

          <div className="space-y-2.5">
            {monthly.map((m) => {
              const pct = Math.max(2, (m.totalPrecipMm / maxRain) * 100);
              return (
                <div key={m.month} className="grid grid-cols-12 items-center gap-3 text-xs">
                  <span className="col-span-2 font-mono text-slate-600 dark:text-slate-300">{m.label}</span>
                  <div className="col-span-6 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="col-span-2 text-right font-mono font-semibold text-slate-900 tabular-nums dark:text-white">
                    {m.totalPrecipMm.toFixed(0)} mm
                  </span>
                  <span className="col-span-2 text-right font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    {formatWindSpeed(m.maxWindKmh, settings.windUnit)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Multi-Year Climate Trend Comparison */}
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-5">
          <div className="mb-4 flex items-center gap-2">
            <Wind className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.analytics.yearlyTitle}
            </h2>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 font-medium">Year</th>
                <th className="py-2 text-right font-medium">Mean Temp</th>
                <th className="py-2 text-right font-medium">Total Rain</th>
                <th className="py-2 text-right font-medium">Peak Wind</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.yearlyComparison.map((y) => (
                <tr key={y.year}>
                  <td className="py-2.5 font-mono font-semibold text-slate-900 dark:text-white">{y.year}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {formatTemperature(y.avgTempC, settings.tempUnit)}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-sky-600 dark:text-sky-400">
                    {y.totalPrecipMm.toFixed(0)} mm
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {formatWindSpeed(y.maxWindKmh, settings.windUnit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Source: {data.source}. Note: The latest calendar year reflects year-to-date observations up to {data.periodEnd}.
          </p>
        </section>
      </div>
    </div>
  );
};
