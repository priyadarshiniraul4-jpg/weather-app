import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AlertTriangle, CloudRain, Droplets, Loader2, RefreshCw, ShieldAlert, Waves } from 'lucide-react';
import type { FloodMonitorData, LocationInfo, UserSettings } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { formatShortDate } from '../utils/formatters';

interface FloodMonitorPageProps {
  location: LocationInfo;
  settings: UserSettings;
  t: TranslationSchema;
  onSelectLocation: (loc: LocationInfo) => void;
}

export const FloodMonitorPage: React.FC<FloodMonitorPageProps> = ({
  location,
  settings,
  t,
  onSelectLocation,
}) => {
  const [data, setData] = useState<FloodMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const loadFloodData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(location.latitude),
        lon: String(location.longitude),
        name: location.name,
        country: location.country,
      });
      const res = await fetch(`/api/flood?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to load flood telemetry');
      setData(json as FloodMonitorData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloodData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]);

  // Initialize Leaflet hydrological risk map
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, {
      center: [20.5, 85.8],
      zoom: 7,
      zoomControl: true,
    });
    const tileUrl =
      settings.theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    L.tileLayer(tileUrl, { attribution: '&copy; OpenStreetMap' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [settings.theme]);

  // Plot active location + Odisha river basins
  useEffect(() => {
    const group = layerRef.current;
    if (!group || !data) return;
    group.clearLayers();

    L.circleMarker([data.location.latitude, data.location.longitude], {
      radius: 9,
      color: '#0284C7',
      fillColor: '#38BDF8',
      fillOpacity: 0.85,
      weight: 2,
    })
      .bindPopup(
        `<strong>${data.location.name}</strong><br/>Flood Status: ${data.floodRiskLevel}<br/>24h Rain: ${data.rainNext24hMm} mm`
      )
      .addTo(group);

    data.odishaBasins.forEach((b) => {
      const color =
        b.riskLevel === 'Severe'
          ? '#DC2626'
          : b.riskLevel === 'High'
          ? '#EA580C'
          : b.riskLevel === 'Elevated'
          ? '#D97706'
          : '#0D9488';

      const marker = L.circleMarker([b.latitude, b.longitude], {
        radius: 8,
        color: '#FFFFFF',
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(group);

      marker.bindPopup(
        `<strong>${b.name} (${b.river})</strong><br/>District: ${b.district}<br/>Discharge: ${b.dischargeM3s} m³/s<br/>24h Rain: ${b.rain24hMm} mm<br/>Status: ${b.riskLevel}`
      );
    });
  }, [data]);

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
          onClick={loadFloodData}
          className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const maxDischarge = Math.max(10, ...data.dailyDischarge.map((d) => d.dischargeMaxM3s || d.dischargeM3s));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.flood.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {location.name} · {t.flood.subtitle}
          </p>
        </div>
        <button
          onClick={loadFloodData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span>{t.topbar.refresh}</span>
        </button>
      </header>

      {/* 4 Key Hydrological KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Waves className="h-3.5 w-3.5 text-sky-600" />
            <span>{t.flood.currentDischarge}</span>
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {data.currentDischargeM3s != null ? `${data.currentDischargeM3s} m³/s` : 'N/A'}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
            {data.dischargeRatio != null ? `${data.dischargeRatio}× seasonal mean` : 'GloFAS grid'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CloudRain className="h-3.5 w-3.5 text-sky-600" />
            <span>{t.flood.rain24h}</span>
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-sky-600 tabular-nums dark:text-sky-400">
            {data.rainNext24hMm} mm
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Next 24h intensity</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Droplets className="h-3.5 w-3.5 text-sky-600" />
            <span>{t.flood.rain7d}</span>
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {data.rainNext7dMm} mm
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">7-day accumulation</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>{t.flood.riskStatus}</span>
          </div>
          <div
            className={`mt-1 font-display text-2xl font-bold ${
              data.floodRiskLevel === 'Severe'
                ? 'text-rose-600 dark:text-rose-400'
                : data.floodRiskLevel === 'High'
                ? 'text-orange-600 dark:text-orange-400'
                : data.floodRiskLevel === 'Elevated'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {data.floodRiskLevel}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Open-Meteo GloFAS</div>
        </div>
      </section>

      {/* 7-Day Discharge Projection + Geographical Flood Basin Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.flood.dischargeTitle}
          </h2>
          <div className="space-y-3">
            {data.dailyDischarge.map((d) => {
              const pct = Math.max(4, (d.dischargeM3s / maxDischarge) * 100);
              return (
                <div key={d.date} className="grid grid-cols-12 items-center gap-3 text-xs">
                  <span className="col-span-3 font-mono text-slate-600 dark:text-slate-300">
                    {formatShortDate(d.date)}
                  </span>
                  <div className="col-span-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="col-span-4 text-right font-mono font-semibold text-slate-900 tabular-nums dark:text-white">
                    {d.dischargeM3s} <span className="text-[10px] font-normal text-slate-500">m³/s</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-200/80 pt-4 dark:border-slate-800">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>{t.flood.safetyTitle}</span>
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {data.safetyRecommendations.map((rec, i) => (
                <li key={i}>• {rec}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/85 dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-6 flex flex-col">
          <div className="border-b border-slate-200/80 px-5 py-3.5 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Odisha River Basin &amp; Affected Corridor Map
            </h2>
          </div>
          <div ref={mapElRef} className="h-72 flex-1 min-h-[300px] w-full" />
        </section>
      </div>

      {/* Odisha River Basins Watch Table */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.flood.basinsTitle}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-3 font-medium">Basin / Station</th>
                <th className="py-2 pr-3 font-medium">River &amp; District</th>
                <th className="py-2 pr-3 text-right font-medium">Live Discharge</th>
                <th className="py-2 pr-3 text-right font-medium">Mean Baseline</th>
                <th className="py-2 pr-3 text-right font-medium">24h Rain</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.odishaBasins.map((b) => (
                <tr key={b.name} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-white">
                    <button
                      onClick={() =>
                        onSelectLocation({
                          name: b.name,
                          admin1: 'Odisha',
                          country: 'India',
                          countryCode: 'IN',
                          latitude: b.latitude,
                          longitude: b.longitude,
                          isOdisha: true,
                        })
                      }
                      className="text-left hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      {b.name}
                    </button>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                    {b.river} · {b.district}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {b.dischargeM3s} m³/s
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {b.dischargeMeanM3s} m³/s
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-sky-600 dark:text-sky-400">
                    {b.rain24hMm} mm
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    <span
                      className={
                        b.riskLevel === 'Severe'
                          ? 'text-rose-600 dark:text-rose-400'
                          : b.riskLevel === 'High'
                          ? 'text-orange-600 dark:text-orange-400'
                          : b.riskLevel === 'Elevated'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {b.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
