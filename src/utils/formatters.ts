import type { PressureUnit, TempUnit, WindUnit } from '../types/weather';

export function formatTemperature(celsius: number, unit: TempUnit): string {
  const val = unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(val)}°${unit}`;
}

export function convertTempNumber(celsius: number, unit: TempUnit): number {
  return unit === 'F' ? Math.round(((celsius * 9) / 5 + 32) * 10) / 10 : Math.round(celsius * 10) / 10;
}

export function formatWindSpeed(kmh: number, unit: WindUnit): string {
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  if (unit === 'ms') {
    return `${(kmh / 3.6).toFixed(1)} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatPressure(hpa: number, unit: PressureUnit): string {
  if (unit === 'inHg') {
    return `${(hpa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatHourLabel(isoTime: string): string {
  // Open-Meteo returns local ISO strings like "2026-11-15T14:00"
  const timePart = isoTime.split('T')[1];
  if (!timePart) return isoTime;
  const hour = parseInt(timePart.slice(0, 2), 10);
  if (Number.isNaN(hour)) return timePart.slice(0, 5);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${period}`;
}

export function formatClockTime(isoTime: string): string {
  const timePart = isoTime.split('T')[1];
  if (!timePart) return isoTime;
  const [hStr, mStr] = timePart.split(':');
  const hour = parseInt(hStr, 10);
  if (Number.isNaN(hour)) return timePart.slice(0, 5);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${mStr?.slice(0, 2) || '00'} ${period}`;
}

export function formatDayName(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3) return isoDate;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3) return isoDate;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
