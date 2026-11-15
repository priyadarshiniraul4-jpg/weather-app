import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Loader2, MapPin, Navigation } from 'lucide-react';
import type {
  LocationInfo,
  OdishaStationStatus,
  UserSettings,
  WeatherBundle,
} from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { formatTemperature, formatWindSpeed } from '../utils/formatters';
import { getWmoInfo } from '../utils/weatherCodes';

interface WeatherMapPageProps {
  bundle: WeatherBundle;
  odishaStations: OdishaStationStatus[];
  settings: UserSettings;
  t: TranslationSchema;
  onSelectLocation: (loc: LocationInfo) => void;
}

export const WeatherMapPage: React.FC<WeatherMapPageProps> = ({
  bundle,
  odishaStations,
  settings,
  t,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [showRadar, setShowRadar] = useState(true);
  const [showOdishaMarkers, setShowOdishaMarkers] = useState(true);
  const [radarTimestamp, setRadarTimestamp] = useState<string | null>(null);
  const [inspectedBundle, setInspectedBundle] = useState<WeatherBundle | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Initialize Leaflet Map with OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [bundle.location.latitude, bundle.location.longitude],
      zoom: 7,
      zoomControl: true,
    });

    const markersGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = markersGroup;

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setInspectLoading(true);
      setInspectError(null);
      try {
        const revRes = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lng}`);
        const revData = await revRes.json();
        const loc: LocationInfo = revData.location || {
          name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
          country: 'Selected Coordinates',
          latitude: lat,
          longitude: lng,
        };
        const wRes = await fetch(
          `/api/weather?lat=${loc.latitude}&lon=${loc.longitude}&name=${encodeURIComponent(loc.name)}&country=${encodeURIComponent(loc.country)}${loc.admin1 ? `&admin1=${encodeURIComponent(loc.admin1)}` : ''}${loc.countryCode ? `&countryCode=${encodeURIComponent(loc.countryCode)}` : ''}`
        );
        if (!wRes.ok) throw new Error('Unable to fetch weather for selected coordinates');
        const wData = (await wRes.json()) as WeatherBundle;
        setInspectedBundle(wData);
      } catch (err) {
        setInspectError((err as Error).message);
      } finally {
        setInspectLoading(false);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Recenter map when active location changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([bundle.location.latitude, bundle.location.longitude], mapRef.current.getZoom(), {
      animate: true,
    });
  }, [bundle.location.latitude, bundle.location.longitude]);

  // Switch OpenStreetMap / Dark Carto tile layer with theme
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    const tileUrl =
      settings.theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution =
      settings.theme === 'dark'
        ? '&copy; OpenStreetMap contributors &copy; CARTO'
        : '&copy; OpenStreetMap contributors';

    baseLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
    }).addTo(map);
  }, [settings.theme]);

  // Fetch & toggle RainViewer live precipitation radar overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!showRadar) {
      if (radarLayerRef.current) {
        map.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !mapRef.current) return;
        const past = data?.radar?.past;
        const latest = Array.isArray(past) && past.length > 0 ? past[past.length - 1] : null;
        if (!latest?.path) return;

        setRadarTimestamp(new Date(latest.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (radarLayerRef.current) {
          mapRef.current.removeLayer(radarLayerRef.current);
        }
        radarLayerRef.current = L.tileLayer(
          `https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,
          {
            opacity: 0.55,
            zIndex: 10,
            attribution: 'RainViewer Live Radar',
          }
        ).addTo(mapRef.current);
      })
      .catch(() => {
        // Radar overlay is optional enhancement; OSM base map + live markers remain active
      });

    return () => {
      cancelled = true;
    };
  }, [showRadar]);

  // Render active location + Odisha station markers
  useEffect(() => {
    const group = markersLayerRef.current;
    if (!group) return;
    group.clearLayers();

    // Active city marker
    const activeIcon = L.divIcon({
      className: '',
      html: `<div style="background:#0284C7;color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:var(--font-mono);">
        ${bundle.location.name} · ${formatTemperature(bundle.current.temperature, settings.tempUnit)}
      </div>`,
      iconSize: [120, 26],
      iconAnchor: [60, 13],
    });
    L.marker([bundle.location.latitude, bundle.location.longitude], { icon: activeIcon }).addTo(group);

    if (showOdishaMarkers) {
      odishaStations.forEach((st) => {
        const isCurrent =
          Math.abs(st.latitude - bundle.location.latitude) < 0.05 &&
          Math.abs(st.longitude - bundle.location.longitude) < 0.05;
        if (isCurrent) return;

        const color =
          st.riskLevel === 'Severe'
            ? '#DC2626'
            : st.riskLevel === 'Advisory'
            ? '#D97706'
            : '#0F172A';

        const icon = L.divIcon({
          className: '',
          html: `<div style="background:${color};color:#fff;padding:3px 7px;border-radius:6px;font-size:10px;font-weight:600;white-space:nowrap;border:1px solid rgba(255,255,255,0.8);box-shadow:0 2px 6px rgba(0,0,0,0.25);font-family:var(--font-mono);">
            ${st.name} ${formatTemperature(st.temperature, settings.tempUnit)}
          </div>`,
          iconSize: [100, 22],
          iconAnchor: [50, 11],
        });

        const marker = L.marker([st.latitude, st.longitude], { icon }).addTo(group);
        marker.on('click', () => {
          onSelectLocation({
            name: st.name,
            admin1: 'Odisha',
            country: 'India',
            countryCode: 'IN',
            latitude: st.latitude,
            longitude: st.longitude,
            isOdisha: true,
          });
        });
      });
    }
  }, [bundle, odishaStations, showOdishaMarkers, settings.tempUnit, onSelectLocation]);

  const activeInfo = inspectedBundle || bundle;
  const activeCond = getWmoInfo(activeInfo.current.weatherCode, settings.language);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.map.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.map.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRadar((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              showRadar
                ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t.map.radarLayer}</span>
            {radarTimestamp && showRadar && (
              <span className="font-mono text-[10px] opacity-80">({radarTimestamp})</span>
            )}
          </button>

          <button
            onClick={() => setShowOdishaMarkers((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              showOdishaMarkers
                ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>{t.map.odishaStations}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
          <div ref={mapContainerRef} className="h-[460px] w-full lg:h-[540px]" />
          <div className="border-t border-slate-200/80 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t.map.clickHint}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {inspectedBundle ? t.map.inspectHere : 'Active Station'}
              </span>
              {inspectLoading && <Loader2 className="h-4 w-4 animate-spin text-sky-600" />}
            </div>

            {inspectError && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{inspectError}</p>
            )}

            <div className="mt-3">
              <div className="flex items-center gap-1.5 text-base font-semibold text-slate-900 dark:text-white">
                <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>{activeInfo.location.name}</span>
              </div>
              <div className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                {activeInfo.location.admin1 ? `${activeInfo.location.admin1}, ` : ''}
                {activeInfo.location.country} · {activeInfo.location.latitude.toFixed(3)}°,{' '}
                {activeInfo.location.longitude.toFixed(3)}°
              </div>
            </div>

            <div className="mt-5 border-y border-slate-200/80 py-4 dark:border-slate-800">
              <div className="font-display text-4xl font-bold text-slate-900 tabular-nums dark:text-white">
                {formatTemperature(activeInfo.current.temperature, settings.tempUnit)}
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activeCond.label}</div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">{t.metrics.wind}</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatWindSpeed(activeInfo.current.windSpeed, settings.windUnit)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">{t.metrics.gusts}</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatWindSpeed(activeInfo.current.windGusts, settings.windUnit)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">{t.metrics.humidity}</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {Math.round(activeInfo.current.humidity)}%
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">{t.metrics.pressure}</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {Math.round(activeInfo.current.pressureMsl)} hPa
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 space-y-2">
            {inspectedBundle && (
              <button
                onClick={() => onSelectLocation(inspectedBundle.location)}
                className="w-full rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700"
              >
                {t.map.setAsActive}
              </button>
            )}
            <button
              onClick={() => {
                mapRef.current?.setView([20.2961, 85.8245], 7, { animate: true });
              }}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Focus Odisha Coast (Bay of Bengal)
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
