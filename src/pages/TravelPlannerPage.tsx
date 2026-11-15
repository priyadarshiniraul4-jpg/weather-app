import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AlertTriangle, Clock, Loader2, MapPin, Navigation, Route } from 'lucide-react';
import type { LocationInfo, TravelRouteForecast, UserSettings } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { formatTemperature, formatVisibility, formatWindSpeed } from '../utils/formatters';
import { getWmoInfo } from '../utils/weatherCodes';
import { WeatherIcon } from '../components/WeatherIcon';

interface TravelPlannerPageProps {
  activeLocation: LocationInfo;
  settings: UserSettings;
  t: TranslationSchema;
}

const POPULAR_CORRIDORS = [
  { from: 'Bhubaneswar', to: 'Puri' },
  { from: 'Bhubaneswar', to: 'Paradip' },
  { from: 'Cuttack', to: 'Sambalpur' },
  { from: 'Mumbai', to: 'Pune' },
  { from: 'New Delhi', to: 'Jaipur' },
];

export const TravelPlannerPage: React.FC<TravelPlannerPageProps> = ({
  activeLocation,
  settings,
  t,
}) => {
  const [sourceQuery, setSourceQuery] = useState(activeLocation.name || 'Bhubaneswar');
  const [destQuery, setDestQuery] = useState(
    activeLocation.name === 'Puri' ? 'Bhubaneswar' : 'Puri'
  );
  const [routeData, setRouteData] = useState<TravelRouteForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const analyzeRoute = async (srcText: string, dstText: string) => {
    if (!srcText.trim() || !dstText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/travel/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceQuery: srcText.trim(),
          destinationQuery: dstText.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not compute route weather');
      setRouteData(json as TravelRouteForecast);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeRoute(sourceQuery, destQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, {
      center: [20.1, 85.8],
      zoom: 8,
    });
    const tileUrl =
      settings.theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    L.tileLayer(tileUrl, { attribution: '&copy; OpenStreetMap' }).addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [settings.theme]);

  // Draw route polyline + waypoint weather pins
  useEffect(() => {
    const map = mapRef.current;
    const group = routeLayerRef.current;
    if (!map || !group || !routeData) return;
    group.clearLayers();

    const polyline = L.polyline(routeData.geometry, {
      color: routeData.warnings.length > 0 ? '#D97706' : '#0284C7',
      weight: 4,
      opacity: 0.85,
    }).addTo(group);

    routeData.waypoints.forEach((wp) => {
      const color =
        wp.hazardLevel === 'Severe'
          ? '#DC2626'
          : wp.hazardLevel === 'Caution'
          ? '#D97706'
          : '#0284C7';
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${color};color:#fff;padding:3px 7px;border-radius:7px;font-size:10px;font-weight:700;white-space:nowrap;border:1.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-family:var(--font-mono);">
          ${formatTemperature(wp.temperature, settings.tempUnit)} · ${wp.precipitationProb}%
        </div>`,
        iconSize: [86, 22],
        iconAnchor: [43, 11],
      });
      L.marker([wp.latitude, wp.longitude], { icon })
        .bindPopup(
          `<strong>${wp.label}</strong><br/>Temp: ${formatTemperature(wp.temperature, settings.tempUnit)}<br/>Rain Prob: ${wp.precipitationProb}% (${wp.precipitationMm} mm)<br/>Gusts: ${formatWindSpeed(wp.windGustKmh, settings.windUnit)}<br/>Status: ${wp.hazardLevel}`
        )
        .addTo(group);
    });

    map.fitBounds(polyline.getBounds(), { padding: [32, 32] });
  }, [routeData, settings.tempUnit, settings.windUnit]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.travel.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.travel.subtitle}</p>
      </header>

      {/* Route Planner Input Form */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-900/75">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            analyzeRoute(sourceQuery, destQuery);
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end"
        >
          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              {t.travel.sourceLabel}
            </label>
            <div className="relative flex items-center">
              <MapPin className="pointer-events-none absolute left-3 h-4 w-4 text-sky-600" />
              <input
                type="text"
                value={sourceQuery}
                onChange={(e) => setSourceQuery(e.target.value)}
                placeholder="e.g. Bhubaneswar"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              {t.travel.destinationLabel}
            </label>
            <div className="relative flex items-center">
              <Navigation className="pointer-events-none absolute left-3 h-4 w-4 text-emerald-600" />
              <input
                type="text"
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                placeholder="e.g. Puri"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
              <span>{t.travel.planRoute}</span>
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Quick Corridors:</span>
          {POPULAR_CORRIDORS.map((c) => (
            <button
              key={`${c.from}-${c.to}`}
              onClick={() => {
                setSourceQuery(c.from);
                setDestQuery(c.to);
                analyzeRoute(c.from, c.to);
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {c.from} → {c.to}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {routeData && (
        <>
          {/* Route Warnings if any */}
          {routeData.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Corridor Weather Advisories Detected</span>
              </div>
              <ul className="mt-1.5 space-y-1">
                {routeData.warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Map + Safe Departure Windows */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/85 dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-7 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-5 py-3 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {routeData.source.name} → {routeData.destination.name}
                </span>
                <span className="font-mono text-slate-500 tabular-nums dark:text-slate-400">
                  {routeData.distanceKm} km · ~{Math.floor(routeData.durationMinutes / 60)}h{' '}
                  {routeData.durationMinutes % 60}m ({routeData.routeSource})
                </span>
              </div>
              <div ref={mapElRef} className="h-80 flex-1 min-h-[340px] w-full" />
            </section>

            <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-5">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t.travel.safeWindowsTitle}
                </h2>
              </div>
              <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
                {routeData.recommendedWindows.map((win) => (
                  <div key={win.isoTime} className="py-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {win.timeLabel}
                      </span>
                      <span
                        className={`font-semibold ${
                          win.safetyRating === 'Optimal'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : win.safetyRating === 'Fair'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {win.safetyRating}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">{win.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Waypoint Breakdown */}
          <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.travel.waypointsTitle}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {routeData.waypoints.map((wp) => {
                const info = getWmoInfo(wp.weatherCode, settings.language);
                return (
                  <article
                    key={wp.label}
                    className="rounded-xl border border-slate-200/80 p-3.5 text-xs dark:border-slate-800"
                  >
                    <div className="truncate font-semibold text-slate-900 dark:text-white">
                      {wp.label}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <WeatherIcon code={wp.weatherCode} size={28} />
                      <span className="font-mono text-xl font-bold text-slate-900 tabular-nums dark:text-white">
                        {formatTemperature(wp.temperature, settings.tempUnit)}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300">{info.label}</div>
                    <div className="mt-2 space-y-0.5 border-t border-slate-200/70 pt-2 font-mono text-[11px] text-slate-500 tabular-nums dark:border-slate-800 dark:text-slate-400">
                      <div>Rain: {wp.precipitationProb}% ({wp.precipitationMm} mm)</div>
                      <div>Gusts: {formatWindSpeed(wp.windGustKmh, settings.windUnit)}</div>
                      <div>Vis: {formatVisibility(wp.visibilityM)}</div>
                      <div
                        className={`font-sans font-semibold ${
                          wp.hazardLevel === 'Severe'
                            ? 'text-rose-600 dark:text-rose-400'
                            : wp.hazardLevel === 'Caution'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        Status: {wp.hazardLevel}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
