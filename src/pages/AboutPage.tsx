import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, CheckCircle2, Code2, Cpu, Globe2, Loader2, Shield } from 'lucide-react';
import type { ApiHealthStatus } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';

interface AboutPageProps {
  t: TranslationSchema;
}

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/health',
    summary: 'Returns backend health status and active upstream weather, geocoding, map, and Gemini providers.',
    testUrl: '/api/health',
  },
  {
    method: 'GET',
    path: '/api/weather?lat=20.2961&lon=85.8245&name=Bhubaneswar',
    summary: 'Live Open-Meteo telemetry, 24h/7d forecasts, AQI, disaster risk assessment, and safety advisories.',
    testUrl: '/api/weather?lat=20.2961&lon=85.8245&name=Bhubaneswar&admin1=Odisha&country=India&countryCode=IN',
  },
  {
    method: 'GET',
    path: '/api/analytics?lat=20.2961&lon=85.8245&name=Bhubaneswar',
    summary: 'Historical ERA5 12-month climate stats and multi-year temperature, rain, and wind trends.',
    testUrl: '/api/analytics?lat=20.2961&lon=85.8245&name=Bhubaneswar',
  },
  {
    method: 'GET',
    path: '/api/flood?lat=20.2961&lon=85.8245&name=Bhubaneswar',
    summary: 'Open-Meteo GloFAS hydrological river discharge and Odisha river basin watch.',
    testUrl: '/api/flood?lat=20.2961&lon=85.8245&name=Bhubaneswar',
  },
  {
    method: 'GET',
    path: '/api/agriculture?lat=20.2961&lon=85.8245&name=Bhubaneswar',
    summary: 'Soil temperature, topsoil/root moisture, FAO ET0, and crop irrigation advisories.',
    testUrl: '/api/agriculture?lat=20.2961&lon=85.8245&name=Bhubaneswar',
  },
  {
    method: 'GET',
    path: '/api/odisha-network',
    summary: 'Batch Open-Meteo coastal & inland readings across 8 Odisha stations.',
    testUrl: '/api/odisha-network',
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({ t }) => {
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ url: string; status: number; body: string } | null>(null);
  const [health, setHealth] = useState<ApiHealthStatus | null>(null);

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth({
        status: res.ok ? 'ok' : 'degraded',
        checkedAt: new Date().toISOString(),
        latencyMs: Math.round(performance.now() - start),
        providers: data.providers,
      });
    } catch {
      setHealth({
        status: 'offline',
        checkedAt: new Date().toISOString(),
        latencyMs: 0,
        providers: {
          weather: 'Unreachable',
          geocoding: 'Unreachable',
          maps: 'Unreachable',
          ai: 'Unreachable',
        },
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const runEndpointTest = async (url: string) => {
    setTestingUrl(url);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setTestResult({
        url,
        status: res.status,
        body: JSON.stringify(data, null, 2).slice(0, 1400),
      });
    } catch (err) {
      setTestResult({
        url,
        status: 500,
        body: (err as Error).message,
      });
    } finally {
      setTestingUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.about.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t.tagline} · {t.about.subtitle}
        </p>
      </header>

      {/* Live API Status Monitor */}
      {health && (
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                API &amp; Upstream Provider Status
              </h2>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
              <span className={health.status === 'ok' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                {health.status.toUpperCase()} ({health.latencyMs} ms)
              </span>
              <button onClick={checkHealth} className="font-sans font-medium text-sky-600 hover:underline dark:text-sky-400">
                Re-check
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-3 text-xs dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-slate-500 dark:text-slate-400">Weather &amp; Flood</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{health.providers.weather}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Geocoding</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{health.providers.geocoding}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Maps &amp; Routing</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{health.providers.maps}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">AI &amp; Voice</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{health.providers.ai}</div>
            </div>
          </div>
        </section>
      )}

      {/* Mission & Social Impact */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.about.missionHeading}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          WeatherGuard AI transforms atmospheric telemetry into public-safety intelligence for citizens, farmers, and
          commuters. Built with a dedicated focus on India and cyclone-vulnerable coastal Odisha, it unites live
          Open-Meteo forecasts, ERA5 climate archives, GloFAS flood models, OSRM travel corridors, and multilingual
          voice AI (English, Hindi, Odia) without ever fabricating weather predictions.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200/80 pt-5 dark:border-slate-800 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Verified Datasets</div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Open-Meteo Forecast, ERA5 Archive, GloFAS Flood, Soil Moisture/ET₀, OSM &amp; OSRM.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Grounded Voice &amp; AI</div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Gemini 4 Hydrogen &amp; 3.8 TTS deliver verified weather guidance and spoken reports.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Official Warning Clarity</div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Separates app threshold advisories from official IMD, RSMC, NDMA Sachet, and OSDMA bulletins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Diagram */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.about.architectureHeading}
        </h2>

        <div className="mt-4 grid grid-cols-1 items-center gap-3 md:grid-cols-7">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-700 dark:bg-slate-800/60 md:col-span-2">
            <div className="font-semibold text-slate-900 dark:text-white">React 19 + Tailwind v4 Client</div>
            <div className="mt-1 text-slate-500 dark:text-slate-400">
              11 Modules · Custom SVG Charts · Leaflet OSM + OSRM · EN/HI/OR i18n · Web Speech &amp; High-Contrast
            </div>
          </div>

          <div className="flex justify-center text-slate-400 md:col-span-1">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </div>

          <div className="rounded-xl border border-sky-300 bg-sky-50/80 p-3.5 text-xs dark:border-sky-800 dark:bg-sky-950/40 md:col-span-2">
            <div className="font-semibold text-sky-900 dark:text-sky-200">Express API Gateway (server.ts)</div>
            <div className="mt-1 text-sky-800/80 dark:text-sky-300/80">
              TTL Caching · Disaster Risk &amp; Alert Engine · Flood/Agri/Travel Corridors · Grounded Gemini Prompts
            </div>
          </div>

          <div className="flex justify-center text-slate-400 md:col-span-1">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-700 dark:bg-slate-800/60 md:col-span-1">
            <div className="font-semibold text-slate-900 dark:text-white">Upstream APIs</div>
            <div className="mt-1 text-slate-500 dark:text-slate-400">
              Open-Meteo · GloFAS · ERA5 · OSM · OSRM · Gemini
            </div>
          </div>
        </div>
      </section>

      {/* REST API Documentation & Live Tester */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.about.apiDocsHeading}
          </h2>
        </div>

        <div className="mt-4 divide-y divide-slate-200/80 dark:divide-slate-800">
          {API_ENDPOINTS.map((ep) => (
            <div key={ep.path} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{ep.method}</span>
                  <span className="truncate font-medium text-slate-900 dark:text-slate-100">{ep.path}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{ep.summary}</p>
              </div>

              <button
                onClick={() => runEndpointTest(ep.testUrl)}
                disabled={testingUrl === ep.testUrl}
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-center whitespace-nowrap"
              >
                {testingUrl === ep.testUrl ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                )}
                <span>{t.about.testEndpoint}</span>
              </button>
            </div>
          ))}
        </div>

        {testResult && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 font-mono text-[11px] text-slate-400">
              <span>{testResult.url}</span>
              <span className="text-emerald-400">HTTP {testResult.status}</span>
            </div>
            <pre className="max-h-64 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-sky-200">
              {testResult.body}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};
