import React from 'react';
import { BookmarkPlus, Eye, Globe, MapPin, Moon, Sun, Trash2 } from 'lucide-react';
import type {
  LanguageCode,
  LocationInfo,
  PressureUnit,
  TempUnit,
  UserSettings,
  WindUnit,
} from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';

interface SettingsPageProps {
  settings: UserSettings;
  activeLocation: LocationInfo;
  t: TranslationSchema;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onSelectLocation: (loc: LocationInfo) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  activeLocation,
  t,
  onUpdateSettings,
  onSelectLocation,
}) => {
  const isCurrentSaved = settings.savedLocations.some(
    (s) =>
      Math.abs(s.latitude - activeLocation.latitude) < 0.05 &&
      Math.abs(s.longitude - activeLocation.longitude) < 0.05
  );

  const handleSaveCurrent = () => {
    if (isCurrentSaved) return;
    onUpdateSettings({
      savedLocations: [activeLocation, ...settings.savedLocations],
    });
  };

  const handleRemoveSaved = (idx: number) => {
    const next = settings.savedLocations.filter((_, i) => i !== idx);
    onUpdateSettings({ savedLocations: next });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.settings.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appearance, Accessibility & Language */}
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t.settings.appearance}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition-colors ${
                  settings.theme === 'light'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>{t.settings.lightMode}</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition-colors ${
                  settings.theme === 'dark'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>{t.settings.darkMode}</span>
              </button>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 px-4 py-3 text-xs dark:border-slate-800">
              <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                <Eye className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>{t.settings.highContrast}</span>
              </span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => onUpdateSettings({ highContrast: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-200/80 pt-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.settings.language}
              </h2>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {(
                [
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी (Hindi)' },
                  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
                ] as Array<{ code: LanguageCode; label: string }>
              ).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onUpdateSettings({ language: lang.code })}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                    settings.language === lang.code
                      ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Measurement Units & Auto-Refresh */}
        <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t.settings.units}
          </h2>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {t.settings.temperatureUnit}
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(['C', 'F'] as TempUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => onUpdateSettings({ tempUnit: u })}
                  className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors ${
                    settings.tempUnit === u
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  °{u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {t.settings.windUnit}
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(
                [
                  { id: 'kmh', label: 'km/h' },
                  { id: 'mph', label: 'mph' },
                  { id: 'ms', label: 'm/s' },
                ] as Array<{ id: WindUnit; label: string }>
              ).map((u) => (
                <button
                  key={u.id}
                  onClick={() => onUpdateSettings({ windUnit: u.id })}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                    settings.windUnit === u.id
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {t.settings.pressureUnit}
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(['hPa', 'inHg'] as PressureUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => onUpdateSettings({ pressureUnit: u })}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                    settings.pressureUnit === u
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {t.settings.autoRefresh}
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {([0, 5, 10, 15] as const).map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateSettings({ autoRefreshMinutes: mins })}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                    settings.autoRefreshMinutes === mins
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mins === 0 ? 'Off' : `${mins}m`}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Location Preferences & Saved Locations */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.settings.locationPrefs}
            </h2>
            <label className="mt-2 flex cursor-pointer items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.autoGpsOnLoad}
                onChange={(e) => onUpdateSettings({ autoGpsOnLoad: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>{t.settings.autoGps}</span>
            </label>
          </div>

          <button
            onClick={handleSaveCurrent}
            disabled={isCurrentSaved}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 whitespace-nowrap"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>
              {isCurrentSaved ? `${activeLocation.name} Saved` : `${t.settings.saveCurrent} (${activeLocation.name})`}
            </span>
          </button>
        </div>

        <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.settings.savedLocations}
          </h3>
          <div className="mt-2 divide-y divide-slate-200/70 dark:divide-slate-800">
            {settings.savedLocations.map((loc, idx) => {
              const isDefault =
                Math.abs(loc.latitude - settings.defaultLocation.latitude) < 0.05 &&
                Math.abs(loc.longitude - settings.defaultLocation.longitude) < 0.05;
              return (
                <div key={`${loc.name}-${idx}`} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                  <button
                    onClick={() => onSelectLocation(loc)}
                    className="flex items-center gap-2 text-left font-medium text-slate-800 hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-400"
                  >
                    <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>
                      {loc.name}
                      {loc.admin1 ? `, ${loc.admin1}` : ''} ({loc.country})
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateSettings({ defaultLocation: loc })}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        isDefault
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isDefault ? 'Default' : t.settings.setDefault}
                    </button>
                    {settings.savedLocations.length > 1 && (
                      <button
                        onClick={() => handleRemoveSaved(idx)}
                        aria-label={`Remove ${loc.name}`}
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
