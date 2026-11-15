import React, { useState } from 'react';
import type { HourlyForecastItem, TempUnit } from '../types/weather';
import { convertTempNumber, formatClockTime, formatHourLabel } from '../utils/formatters';

interface HourlyTempRainChartProps {
  hourly: HourlyForecastItem[];
  tempUnit: TempUnit;
}

export const HourlyTempRainChart: React.FC<HourlyTempRainChartProps> = ({ hourly, tempUnit }) => {
  const data = hourly.slice(0, 24);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Hourly forecast data unavailable.
      </div>
    );
  }

  const width = 760;
  const height = 220;
  const padLeft = 36;
  const padRight = 18;
  const padTop = 26;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const temps = data.map((d) => convertTempNumber(d.temperature, tempUnit));
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const rangeT = Math.max(4, maxT - minT);

  const getX = (i: number) => padLeft + (i / (data.length - 1)) * plotW;
  const getY = (t: number) => padTop + ((maxT - t) / rangeT) * (plotH * 0.72) + plotH * 0.05;

  const linePath = temps
    .map((t, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(t).toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(temps.length - 1).toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const activeIndex = hoverIdx ?? 0;
  const activeItem = data[activeIndex];
  const activeTemp = temps[activeIndex];

  return (
    <div className="w-full">
      {/* Live hovered reading readout */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {formatHourLabel(activeItem.time)}
          </span>
          <span>
            {Math.round(activeTemp)}°{tempUnit}
          </span>
          <span className="text-sky-600 dark:text-sky-400">
            Rain {activeItem.precipitationProbability}% ({activeItem.precipitation.toFixed(1)} mm)
          </span>
          <span>Wind {Math.round(activeItem.windSpeed)} km/h</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-amber-500" /> Temp (°{tempUnit})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-sky-500/45" /> Rain %
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full min-w-[540px] select-none"
          role="img"
          aria-label="24-hour temperature and precipitation probability chart"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="wgTempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal baseline grid */}
          {[0, 0.5, 1].map((frac, idx) => {
            const y = padTop + frac * plotH;
            const tempVal = Math.round(maxT - frac * rangeT);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px]"
                >
                  {tempVal}°
                </text>
              </g>
            );
          })}

          {/* Precipitation probability bars */}
          {data.map((d, i) => {
            const prob = Math.min(100, Math.max(0, d.precipitationProbability || 0));
            const barH = (prob / 100) * (plotH * 0.42);
            const barW = Math.max(6, plotW / data.length - 6);
            const x = getX(i) - barW / 2;
            const y = padTop + plotH - barH;
            return (
              <rect
                key={d.time}
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                className={
                  hoverIdx === i
                    ? 'fill-sky-500/65 transition-colors'
                    : 'fill-sky-500/30 transition-colors dark:fill-sky-400/25'
                }
              />
            );
          })}

          {/* Temperature area + curve */}
          <path d={areaPath} fill="url(#wgTempFill)" />
          <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover vertical guide & active node */}
          {hoverIdx !== null && (
            <line
              x1={getX(hoverIdx)}
              y1={padTop}
              x2={getX(hoverIdx)}
              y2={padTop + plotH}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {temps.map((t, i) => {
            const x = getX(i);
            const y = getY(t);
            const showLabel = i % 3 === 0;
            return (
              <g key={i}>
                {showLabel && (
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
                  >
                    {formatHourLabel(data[i].time)}
                  </text>
                )}
                {(hoverIdx === i || i === 0) && (
                  <circle cx={x} cy={y} r={hoverIdx === i ? 4.5 : 3} fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                )}
                {/* Invisible interactive hit strip */}
                <rect
                  x={x - plotW / (data.length * 2)}
                  y={0}
                  width={plotW / data.length}
                  height={height}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIdx(i)}
                  onClick={() => setHoverIdx(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface SolarArcProps {
  sunrise: string;
  sunset: string;
  currentTime: string;
  sunriseLabel: string;
  sunsetLabel: string;
}

export const SolarArc: React.FC<SolarArcProps> = ({
  sunrise,
  sunset,
  currentTime,
  sunriseLabel,
  sunsetLabel,
}) => {
  const parseMinutes = (iso: string) => {
    const t = iso.split('T')[1];
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const srMin = parseMinutes(sunrise);
  const ssMin = parseMinutes(sunset);
  const curMin = parseMinutes(currentTime);
  const span = Math.max(1, ssMin - srMin);
  const progress = Math.min(1, Math.max(0, (curMin - srMin) / span));
  const isDaylight = curMin >= srMin && curMin <= ssMin;

  // Semi-circle path from (16, 76) to (184, 76), center (100, 76), radius 84
  const angle = Math.PI * (1 - progress);
  const sunX = 100 + 84 * Math.cos(angle);
  const sunY = 76 - 62 * Math.sin(angle);

  const daylightHours = Math.floor(span / 60);
  const daylightMins = span % 60;

  return (
    <div className="flex flex-col justify-between">
      <svg viewBox="0 0 200 92" className="mx-auto h-24 w-full max-w-[220px]" aria-hidden="true">
        <line x1="8" y1="76" x2="192" y2="76" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1.5" />
        <path
          d="M 16 76 A 84 62 0 0 1 184 76"
          fill="none"
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {isDaylight && (
          <circle cx={sunX} cy={sunY} r="6.5" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="2" />
        )}
      </svg>
      <div className="mt-1 flex items-center justify-between text-xs">
        <div>
          <div className="text-slate-500 dark:text-slate-400">{sunriseLabel}</div>
          <div className="font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {formatClockTime(sunrise)}
          </div>
        </div>
        <div className="text-center font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
          {daylightHours}h {daylightMins}m
        </div>
        <div className="text-right">
          <div className="text-slate-500 dark:text-slate-400">{sunsetLabel}</div>
          <div className="font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {formatClockTime(sunset)}
          </div>
        </div>
      </div>
    </div>
  );
};
