import React from 'react';
import { getWmoInfo } from '../utils/weatherCodes';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  size?: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  size = 32,
  className = '',
}) => {
  const { category } = getWmoInfo(code);

  if (category === 'clear') {
    if (!isDay) {
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <path
            d="M32.5 31.2A13 13 0 0 1 16.8 15.5a13.05 13.05 0 0 1 2.1-7.1A14 14 0 1 0 39.6 29.1a13.05 13.05 0 0 1-7.1 2.1Z"
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="34" cy="13" r="1.5" fill="#FDE68A" />
          <circle cx="38" cy="19" r="1" fill="#FDE68A" />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <circle cx="24" cy="24" r="9.5" fill="#F59E0B" />
        <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
          <line x1="24" y1="5" x2="24" y2="9.5" />
          <line x1="24" y1="38.5" x2="24" y2="43" />
          <line x1="5" y1="24" x2="9.5" y2="24" />
          <line x1="38.5" y1="24" x2="43" y2="24" />
          <line x1="10.6" y1="10.6" x2="13.8" y2="13.8" />
          <line x1="34.2" y1="34.2" x2="37.4" y2="37.4" />
          <line x1="37.4" y1="10.6" x2="34.2" y2="13.8" />
          <line x1="13.8" y1="34.2" x2="10.6" y2="37.4" />
        </g>
      </svg>
    );
  }

  if (category === 'partly_cloudy') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        {isDay ? (
          <>
            <circle cx="19" cy="18" r="7" fill="#F59E0B" />
            <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="6.5" x2="19" y2="8.5" />
              <line x1="7.5" y1="18" x2="9.5" y2="18" />
              <line x1="11" y1="10" x2="12.5" y2="11.5" />
              <line x1="27" y1="10" x2="25.5" y2="11.5" />
            </g>
          </>
        ) : (
          <path
            d="M22.2 21.6A7.5 7.5 0 0 1 13.4 12.8a7.6 7.6 0 0 1 1.2-4.1 8 8 0 1 0 11.7 11.7 7.6 7.6 0 0 1-4.1 1.2Z"
            fill="#FBBF24"
          />
        )}
        <path
          d="M16 35h19a7 7 0 0 0 1.4-13.85A9 9 0 0 0 19.2 19a7.5 7.5 0 0 0-3.2 16Z"
          fill="#CBD5E1"
          stroke="#94A3B8"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (category === 'cloudy') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M14 34h21.5a6.5 6.5 0 0 0 1.1-12.9A8.5 8.5 0 0 0 20.5 18a7 7 0 0 0-6.5 16Z"
          fill="#94A3B8"
          stroke="#64748B"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (category === 'fog') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M14 26h20a5.5 5.5 0 0 0 .9-10.9A7.5 7.5 0 0 0 20 12.5a6 6 0 0 0-6 13.5Z"
          fill="#CBD5E1"
        />
        <g stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
          <line x1="10" y1="31" x2="38" y2="31" />
          <line x1="13" y1="36.5" x2="35" y2="36.5" />
        </g>
      </svg>
    );
  }

  if (category === 'drizzle' || category === 'rain' || category === 'heavy_rain') {
    const dropCount = category === 'heavy_rain' ? 4 : category === 'rain' ? 3 : 2;
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M13 28h22a6 6 0 0 0 1.1-11.9A8 8 0 0 0 20.6 13a6.5 6.5 0 0 0-7.6 15Z"
          fill="#94A3B8"
          stroke="#64748B"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <g stroke="#0EA5E9" strokeWidth="2.4" strokeLinecap="round">
          <line x1="17" y1="33" x2="15" y2="39" />
          <line x1="24" y1="33" x2="22" y2="41" />
          {dropCount >= 3 && <line x1="31" y1="33" x2="29" y2="39" />}
          {dropCount >= 4 && <line x1="20.5" y1="36" x2="18.5" y2="42" />}
        </g>
      </svg>
    );
  }

  if (category === 'thunderstorm') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M13 27h22a6 6 0 0 0 1.1-11.9A8 8 0 0 0 20.6 12a6.5 6.5 0 0 0-7.6 15Z"
          fill="#64748B"
          stroke="#475569"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M25 27l-5 8h5l-2 7 8-10h-5l3-5h-4Z"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <g stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round">
          <line x1="15" y1="32" x2="13.5" y2="37" />
          <line x1="33" y1="32" x2="31.5" y2="37" />
        </g>
      </svg>
    );
  }

  // Snow
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M13 28h22a6 6 0 0 0 1.1-11.9A8 8 0 0 0 20.6 13a6.5 6.5 0 0 0-7.6 15Z"
        fill="#CBD5E1"
        stroke="#94A3B8"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <g fill="#38BDF8">
        <circle cx="17" cy="35" r="2" />
        <circle cx="24" cy="38" r="2" />
        <circle cx="31" cy="35" r="2" />
      </g>
    </svg>
  );
};
