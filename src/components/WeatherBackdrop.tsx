import React from 'react';
import { getWmoInfo } from '../utils/weatherCodes';

interface WeatherBackdropProps {
  weatherCode: number;
  isDay: boolean;
}

const RAIN_STREAKS = [
  { left: '8%', delay: '0s', dur: '1.1s' },
  { left: '19%', delay: '0.4s', dur: '1.3s' },
  { left: '31%', delay: '0.15s', dur: '1.05s' },
  { left: '44%', delay: '0.6s', dur: '1.25s' },
  { left: '57%', delay: '0.25s', dur: '1.15s' },
  { left: '69%', delay: '0.55s', dur: '1.35s' },
  { left: '81%', delay: '0.1s', dur: '1.2s' },
  { left: '92%', delay: '0.7s', dur: '1.1s' },
];

export const WeatherBackdrop: React.FC<WeatherBackdropProps> = ({ weatherCode, isDay }) => {
  const { category } = getWmoInfo(weatherCode);
  const isRaining = category === 'rain' || category === 'heavy_rain' || category === 'drizzle' || category === 'thunderstorm';
  const isClear = category === 'clear' || category === 'partly_cloudy';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      {/* Subtle atmospheric gradient wash */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          category === 'thunderstorm'
            ? 'bg-gradient-to-br from-slate-900/15 via-indigo-950/10 to-amber-500/10 dark:from-slate-800/40 dark:via-indigo-950/30 dark:to-amber-500/10'
            : isRaining
            ? 'bg-gradient-to-br from-sky-500/10 via-slate-500/5 to-cyan-500/10 dark:from-sky-900/30 dark:via-slate-900/20 dark:to-cyan-900/20'
            : isDay
            ? 'bg-gradient-to-br from-amber-400/10 via-sky-400/5 to-transparent dark:from-amber-500/10 dark:via-sky-500/10 dark:to-transparent'
            : 'bg-gradient-to-br from-indigo-500/10 via-slate-800/5 to-transparent dark:from-indigo-500/15 dark:via-slate-900/30 dark:to-transparent'
        }`}
      />

      {/* Solar/lunar ambient glow */}
      {isClear && (
        <div
          className={`animate-wg-sun absolute -right-14 -top-14 h-56 w-56 rounded-full blur-3xl ${
            isDay
              ? 'bg-amber-400/25 dark:bg-amber-400/15'
              : 'bg-indigo-400/20 dark:bg-indigo-400/15'
          }`}
        />
      )}

      {/* Drifting cloud mass */}
      {(category === 'cloudy' || category === 'partly_cloudy' || category === 'fog' || isRaining) && (
        <div className="animate-wg-drift absolute -right-10 top-4 h-36 w-72 rounded-full bg-slate-400/15 blur-2xl dark:bg-slate-400/10" />
      )}

      {/* Rain streaks */}
      {isRaining &&
        RAIN_STREAKS.map((s, idx) => (
          <span
            key={idx}
            style={{
              left: s.left,
              animationDelay: s.delay,
              animationDuration: s.dur,
            }}
            className="animate-wg-rain absolute top-0 h-10 w-px bg-gradient-to-b from-transparent via-sky-500/45 to-sky-400/70 dark:via-sky-400/40 dark:to-sky-300/60"
          />
        ))}
    </div>
  );
};
