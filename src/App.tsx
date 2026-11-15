import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CalendarDays,
  CloudSun,
  Crosshair,
  Eye,
  Home,
  Info,
  Loader2,
  Map as MapIcon,
  Menu,
  Mic,
  MicOff,
  Moon,
  RefreshCw,
  Route,
  Search,
  Settings as SettingsIcon,
  Sprout,
  Sun,
  Waves,
  X,
} from 'lucide-react';
import type {
  AiInsightsResponse,
  LanguageCode,
  LocationInfo,
  NotificationLogItem,
  OdishaStationStatus,
  PageRoute,
  UserSettings,
  WeatherBundle,
} from './types/weather';
import { TRANSLATIONS } from './i18n/translations';
import { FEATURED_INDIAN_CITIES } from './data/indianLocations';
import { parseVoiceNavigation, startSpeechRecognition } from './utils/voice';
import { HomePage } from './pages/HomePage';
import { ForecastPage } from './pages/ForecastPage';
import { WeatherMapPage } from './pages/WeatherMapPage';
import { ClimateAnalyticsPage } from './pages/ClimateAnalyticsPage';
import { FloodMonitorPage } from './pages/FloodMonitorPage';
import { AgriculturePage } from './pages/AgriculturePage';
import { TravelPlannerPage } from './pages/TravelPlannerPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AlertsPage } from './pages/AlertsPage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';

const SETTINGS_STORAGE_KEY = 'weatherguard_ai_settings_v2';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  highContrast: false,
  language: 'en',
  tempUnit: 'C',
  windUnit: 'kmh',
  pressureUnit: 'hPa',
  autoGpsOnLoad: false,
  autoRefreshMinutes: 5,
  notificationsEnabled: false,
  defaultLocation: FEATURED_INDIAN_CITIES[0], // Bhubaneswar, Odisha
  savedLocations: FEATURED_INDIAN_CITIES.slice(0, 5),
  recentLocations: [],
};

function loadInitialSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      defaultLocation: parsed.defaultLocation || DEFAULT_SETTINGS.defaultLocation,
      savedLocations:
        Array.isArray(parsed.savedLocations) && parsed.savedLocations.length > 0
          ? parsed.savedLocations
          : DEFAULT_SETTINGS.savedLocations,
      recentLocations: Array.isArray(parsed.recentLocations) ? parsed.recentLocations : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(loadInitialSettings);
  const [activePage, setActivePage] = useState<PageRoute>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeLocation, setActiveLocation] = useState<LocationInfo>(
    () => loadInitialSettings().defaultLocation
  );
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [insights, setInsights] = useState<AiInsightsResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [odishaStations, setOdishaStations] = useState<OdishaStationStatus[]>([]);
  const [odishaLoading, setOdishaLoading] = useState(true);

  const [notificationLogs, setNotificationLogs] = useState<NotificationLogItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);
  const t = TRANSLATIONS[settings.language];

  // Sync dark & highContrast classes on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const recordRecentLocation = useCallback((loc: LocationInfo) => {
    setSettings((prev) => {
      const filtered = prev.recentLocations.filter(
        (r) =>
          Math.abs(r.latitude - loc.latitude) > 0.05 ||
          Math.abs(r.longitude - loc.longitude) > 0.05
      );
      return {
        ...prev,
        recentLocations: [loc, ...filtered].slice(0, 6),
      };
    });
  }, []);

  const loadOdishaNetwork = useCallback(async () => {
    setOdishaLoading(true);
    try {
      const res = await fetch('/api/odisha-network');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.stations)) {
        setOdishaStations(data.stations);
      }
    } catch {
      // Non-critical background network panel
    } finally {
      setOdishaLoading(false);
    }
  }, []);

  const loadWeatherForLocation = useCallback(
    async (loc: LocationInfo) => {
      setLoadingWeather(true);
      setWeatherError(null);
      try {
        const params = new URLSearchParams({
          lat: String(loc.latitude),
          lon: String(loc.longitude),
          name: loc.name,
          country: loc.country,
        });
        if (loc.admin1) params.set('admin1', loc.admin1);
        if (loc.countryCode) params.set('countryCode', loc.countryCode);

        const res = await fetch(`/api/weather?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load weather data.');
        }

        const weatherBundle = data as WeatherBundle;
        setBundle(weatherBundle);
        setActiveLocation(weatherBundle.location);

        // Log severe/moderate advisories into Alert Notification Center
        const activeAdvisories = weatherBundle.alerts.filter((a) => a.origin === 'app_advisory');
        if (activeAdvisories.length > 0) {
          setNotificationLogs((prev) => {
            const top = activeAdvisories[0];
            const entry: NotificationLogItem = {
              id: `${top.id}-${Date.now()}`,
              title: `${weatherBundle.location.name}: ${top.title}`,
              body: top.description,
              severity: top.severity,
              timestamp: weatherBundle.fetchedAt,
              read: false,
            };
            return [entry, ...prev].slice(0, 20);
          });

          if (
            settings.notificationsEnabled &&
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted' &&
            (activeAdvisories[0].severity === 'Extreme' || activeAdvisories[0].severity === 'Severe')
          ) {
            new Notification(`WeatherGuard Alert · ${weatherBundle.location.name}`, {
              body: activeAdvisories[0].title,
            });
          }
        }

        // Fetch grounded AI insights in background
        setInsightsLoading(true);
        fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weatherBundle,
            language: settings.language,
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((ins) => {
            if (ins) setInsights(ins);
          })
          .catch(() => {})
          .finally(() => setInsightsLoading(false));
      } catch (err) {
        setWeatherError((err as Error).message);
      } finally {
        setLoadingWeather(false);
      }
    },
    [settings.language, settings.notificationsEnabled]
  );

  const handleDetectGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsMessage(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const detected: LocationInfo = data.location || {
            name: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            country: 'Detected Location',
            latitude,
            longitude,
          };
          await loadWeatherForLocation(detected);
        } catch {
          setGpsMessage('Could not resolve GPS coordinates.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsMessage(
          err.code === 1
            ? 'Location permission was declined. You can search any city above.'
            : 'Unable to acquire GPS signal right now.'
        );
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [loadWeatherForLocation]);

  // Initial load
  useEffect(() => {
    loadOdishaNetwork();
    if (settings.autoGpsOnLoad) {
      handleDetectGps();
    } else {
      loadWeatherForLocation(activeLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatic Real-Time Refresh Timer
  useEffect(() => {
    if (!settings.autoRefreshMinutes || settings.autoRefreshMinutes <= 0) return;
    const ms = settings.autoRefreshMinutes * 60 * 1000;
    const id = setInterval(() => {
      loadWeatherForLocation(activeLocation);
      loadOdishaNetwork();
    }, ms);
    return () => clearInterval(id);
  }, [settings.autoRefreshMinutes, activeLocation, loadWeatherForLocation, loadOdishaNetwork]);

  // Re-fetch AI insights when language changes
  useEffect(() => {
    if (!bundle) return;
    setInsightsLoading(true);
    fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weatherBundle: bundle,
        language: settings.language,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((ins) => {
        if (ins) setInsights(ins);
      })
      .catch(() => {})
      .finally(() => setInsightsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.language]);

  // Debounced city search
  useEffect(() => {
    if (!searchOpen) return;
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(FEATURED_INDIAN_CITIES);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (Array.isArray(data.results)) {
          setSearchResults(data.results);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

  // Close search dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelectLocation = useCallback(
    (loc: LocationInfo) => {
      setSearchOpen(false);
      setSearchQuery('');
      setGpsMessage(null);
      recordRecentLocation(loc);
      loadWeatherForLocation(loc);
    },
    [loadWeatherForLocation, recordRecentLocation]
  );

  const handleVoiceSearch = () => {
    if (voiceListening) {
      stopVoiceRef.current?.();
      setVoiceListening(false);
      return;
    }
    setVoiceListening(true);
    setGpsMessage(null);
    stopVoiceRef.current = startSpeechRecognition(
      settings.language,
      async (transcript) => {
        const nav = parseVoiceNavigation(transcript);
        if (nav) {
          setActivePage(nav);
          return;
        }
        setSearchQuery(transcript);
        setSearchOpen(true);
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(transcript)}`);
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            handleSelectLocation(data.results[0]);
          }
        } catch {
          // Search dropdown stays open
        }
      },
      (err) => setGpsMessage(err),
      () => setVoiceListening(false)
    );
  };

  const navItems: Array<{
    id: PageRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'forecast', label: t.nav.forecast, icon: CalendarDays },
    { id: 'map', label: t.nav.map, icon: MapIcon },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'flood', label: t.nav.flood, icon: Waves },
    { id: 'agriculture', label: t.nav.agriculture, icon: Sprout },
    { id: 'travel', label: t.nav.travel, icon: Route },
    { id: 'assistant', label: t.nav.assistant, icon: Bot },
    { id: 'alerts', label: t.nav.alerts, icon: AlertTriangle },
    { id: 'about', label: t.nav.about, icon: Info },
    { id: 'settings', label: t.nav.settings, icon: SettingsIcon },
  ];

  const activeAlertCount = bundle?.alerts.filter((a) => a.origin === 'app_advisory').length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar Navigation (240px) */}
        <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-slate-200/90 bg-white/90 px-3.5 py-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:flex">
          <div>
            <button
              onClick={() => setActivePage('home')}
              className="flex items-center gap-2.5 px-2 text-left"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                <CloudSun className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap dark:text-white">
                {t.appName}
              </span>
            </button>

            <nav className="mt-6 space-y-0.5" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {item.id === 'alerts' && activeAlertCount > 0 && (
                      <span className="font-mono text-xs font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                        {activeAlertCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200/80 px-2 pt-3.5 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div className="font-medium text-slate-700 dark:text-slate-300">{t.tagline}</div>
            <div className="mt-1">
              {settings.autoRefreshMinutes > 0
                ? `Auto-refresh: ${settings.autoRefreshMinutes}m`
                : 'Manual refresh'}
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative z-10 flex w-64 flex-col justify-between overflow-y-auto bg-white px-4 py-5 dark:bg-slate-900">
              <div>
                <div className="flex items-center justify-between px-2">
                  <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {t.appName}
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-5 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActivePage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium ${
                          active
                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </span>
                        {item.id === 'alerts' && activeAlertCount > 0 && (
                          <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                            {activeAlertCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="border-t border-slate-200 px-2 pt-3 text-xs text-slate-500 dark:border-slate-800">
                {t.tagline}
              </div>
            </aside>
          </div>
        )}

        {/* Main Workspace Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Compact Top Workspace Bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2.5 border-b border-slate-200/90 bg-white/85 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* City / State / Country Search + Voice Search */}
              <div ref={searchContainerRef} className="relative w-full max-w-md">
                <div className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    placeholder={voiceListening ? t.topbar.listening : t.topbar.searchPlaceholder}
                    aria-label={t.topbar.searchPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-16 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-900 sm:text-sm"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {searchLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />}
                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      aria-label={t.topbar.voiceSearch}
                      title={t.topbar.voiceSearch}
                      className={`rounded-lg p-1 transition-colors ${
                        voiceListening
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                          : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {voiceListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {searchOpen && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    {searchResults.length === 0 && !searchLoading ? (
                      <div className="px-3 py-2.5 text-xs text-slate-500">
                        No matching locations found.
                      </div>
                    ) : (
                      searchResults.map((loc, idx) => (
                        <button
                          key={`${loc.name}-${loc.latitude}-${idx}`}
                          onClick={() => handleSelectLocation(loc)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {loc.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {loc.admin1 ? `${loc.admin1}, ` : ''}
                              {loc.country}
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                            {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleDetectGps}
                disabled={gpsLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                {gpsLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                ) : (
                  <Crosshair className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                )}
                <span className="hidden md:inline">
                  {gpsLoading ? t.topbar.locating : t.topbar.useGps}
                </span>
              </button>

              <button
                onClick={() => {
                  loadWeatherForLocation(activeLocation);
                  loadOdishaNetwork();
                }}
                disabled={loadingWeather}
                aria-label={t.topbar.refresh}
                title={t.topbar.refresh}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 ${loadingWeather ? 'animate-spin text-sky-600' : ''}`} />
              </button>

              {/* Quick Language Switcher */}
              <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-900">
                {(
                  [
                    { code: 'en', label: 'EN' },
                    { code: 'hi', label: 'हि' },
                    { code: 'or', label: 'ଓ' },
                  ] as Array<{ code: LanguageCode; label: string }>
                ).map((l) => (
                  <button
                    key={l.code}
                    onClick={() => updateSettings({ language: l.code })}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                      settings.language === l.code
                        ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                aria-label="Toggle high contrast accessibility mode"
                title={t.settings.highContrast}
                className={`hidden md:inline-flex rounded-lg border p-1.5 transition-colors ${
                  settings.highContrast
                    ? 'border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                <Eye className="h-4 w-4" />
              </button>

              <button
                onClick={() =>
                  updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
                }
                aria-label="Toggle theme"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </header>

          {/* Main Viewport */}
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6">
            {gpsMessage && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <span>{gpsMessage}</span>
                <button onClick={() => setGpsMessage(null)} className="ml-3 font-semibold">
                  Dismiss
                </button>
              </div>
            )}

            {weatherError && !bundle ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/30">
                <h2 className="text-base font-semibold text-rose-900 dark:text-rose-200">
                  Unable to reach live weather telemetry
                </h2>
                <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{weatherError}</p>
                <button
                  onClick={() => loadWeatherForLocation(activeLocation)}
                  className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Retry Connection
                </button>
              </div>
            ) : loadingWeather && !bundle ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-64 rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="h-64 rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
                  <div className="h-64 rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
                </div>
              </div>
            ) : bundle ? (
              <>
                {activePage === 'home' && (
                  <HomePage
                    bundle={bundle}
                    insights={insights}
                    insightsLoading={insightsLoading}
                    odishaStations={odishaStations}
                    odishaLoading={odishaLoading}
                    settings={settings}
                    t={t}
                    onSelectLocation={handleSelectLocation}
                    onNavigate={setActivePage}
                  />
                )}
                {activePage === 'forecast' && (
                  <ForecastPage bundle={bundle} settings={settings} t={t} />
                )}
                {activePage === 'map' && (
                  <WeatherMapPage
                    bundle={bundle}
                    odishaStations={odishaStations}
                    settings={settings}
                    t={t}
                    onSelectLocation={handleSelectLocation}
                  />
                )}
                {activePage === 'analytics' && (
                  <ClimateAnalyticsPage location={bundle.location} settings={settings} t={t} />
                )}
                {activePage === 'flood' && (
                  <FloodMonitorPage
                    location={bundle.location}
                    settings={settings}
                    t={t}
                    onSelectLocation={handleSelectLocation}
                  />
                )}
                {activePage === 'agriculture' && (
                  <AgriculturePage location={bundle.location} settings={settings} t={t} />
                )}
                {activePage === 'travel' && (
                  <TravelPlannerPage
                    activeLocation={bundle.location}
                    settings={settings}
                    t={t}
                  />
                )}
                {activePage === 'assistant' && (
                  <AiAssistantPage
                    bundle={bundle}
                    settings={settings}
                    t={t}
                    onNavigate={setActivePage}
                  />
                )}
                {activePage === 'alerts' && (
                  <AlertsPage
                    bundle={bundle}
                    settings={settings}
                    notificationLogs={notificationLogs}
                    t={t}
                    onToggleNotifications={(enabled) => updateSettings({ notificationsEnabled: enabled })}
                    onClearNotifications={() => setNotificationLogs([])}
                  />
                )}
                {activePage === 'about' && <AboutPage t={t} />}
                {activePage === 'settings' && (
                  <SettingsPage
                    settings={settings}
                    activeLocation={bundle.location}
                    t={t}
                    onUpdateSettings={updateSettings}
                    onSelectLocation={handleSelectLocation}
                  />
                )}
              </>
            ) : null}
          </main>

          <footer className="border-t border-slate-200/80 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2">
              <span>WeatherGuard AI · {t.tagline}</span>
              <span>
                Telemetry: Open-Meteo (Forecast · ERA5 · GloFAS) · Maps: OpenStreetMap &amp; OSRM · Official India Alerts: IMD &amp; OSDMA
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
