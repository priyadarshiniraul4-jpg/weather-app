# WeatherGuard AI

> **"Know the Weather. Prepare Before It Happens."**

WeatherGuard AI is a full-stack weather intelligence, disaster risk assessment, smart agriculture, travel corridor, and voice-enabled preparedness platform built with React 19, TypeScript, Tailwind CSS v4, Express, Open-Meteo (Forecast, ERA5 Archive, GloFAS Flood, Soil/ET₀), OpenStreetMap + Leaflet + OSRM, RainViewer Radar, and Gemini AI (`@google/genai`).

---

## Core & Expanded Modules

1. **Live Dashboard & AI Disaster Risk Intelligence**: Real-time Open-Meteo telemetry, Air Quality (US AQI), 24-hour interactive chart, solar arc, 4-dimension disaster risk breakdown (rainfall/runoff, storm/wind, thermal extremes, cyclonic pressure), forecast confidence, data timestamps, and Cyclone Watch linking to IMD RSMC.
2. **Hourly & 7-Day Forecast**: Interactive 24-hour temperature & precipitation chart, full hourly table, and expandable 7-day range breakdown.
3. **Interactive Weather & Risk Map**: OpenStreetMap + Leaflet with RainViewer live precipitation radar, clickable Odisha coastal stations, and click-anywhere Open-Meteo coordinate lookup.
4. **Historical Weather & Climate Analytics**: Trailing 12-month monthly temperature, rainfall, and wind charts plus multi-year climate comparison from the Open-Meteo ERA5 Historical Archive.
5. **Flood & Heavy Rainfall Monitoring**: Live Open-Meteo GloFAS hydrological river discharge projections, rainfall intensity, Odisha major river basin watch (Mahanadi, Baitarani, Brahmani, Subarnarekha, Rushikulya), and interactive basin risk map.
6. **Smart Agriculture Module**: Soil surface temperature, topsoil & root-zone volumetric moisture, FAO Penman-Monteith ET₀ water balance, rainfall-driven irrigation advice, and regional crop-weather advisories.
7. **Smart Travel Weather Planner**: Origin-to-destination driving corridor via OSRM + 5-waypoint live Open-Meteo weather hazards, interactive Leaflet route map, and 24-hour safest departure windows.
8. **AI Weather & Voice Assistant**: Grounded Gemini 4 Hydrogen chat, Speech-to-Text voice search/queries, Text-to-Speech spoken weather reports (`gemini-3.8-flash-lite-tts` + Web Speech fallback) in English, Hindi, and Odia, plus voice-assisted navigation.
9. **Emergency Preparedness & Alert Center**: Clear separation of app-generated advisories vs. official IMD/OSDMA/NDMA portals, cyclone/flood/heatwave safety checklists, emergency helpline directory (`112`, `1070`, `1077`, `1078`), browser alert logs, and downloadable preparedness guide.
10. **Accessibility & Personalization**: English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ) localization, High-Contrast Accessibility Mode, Light/Dark themes, customizable units, automatic refresh intervals, favorites, and recent locations.

---

## REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and active upstream providers. |
| `GET` | `/api/docs` | Machine-readable API endpoint manifest. |
| `GET` | `/api/geocode?q=Bhubaneswar` | City/state/country search via Open-Meteo Geocoding. |
| `GET` | `/api/reverse-geocode?lat=...&lon=...` | Coordinate lookup via OpenStreetMap Nominatim. |
| `GET` | `/api/weather?lat=...&lon=...` | Live weather, 24h/7d forecast, AQI, disaster risk & advisories. |
| `GET` | `/api/odisha-network` | Batch telemetry across 8 Odisha monitoring stations. |
| `GET` | `/api/analytics?lat=...&lon=...` | ERA5 historical monthly & multi-year climate analytics. |
| `GET` | `/api/flood?lat=...&lon=...` | GloFAS river discharge & Odisha river basin flood risk. |
| `GET` | `/api/agriculture?lat=...&lon=...` | Soil moisture, soil temp, FAO ET₀ & crop advisories. |
| `POST` | `/api/travel/route` | OSRM driving route + 5-waypoint Open-Meteo hazard analysis. |
| `POST` | `/api/ai/insights` | Grounded JSON trend, activity, and travel summary. |
| `POST` | `/api/ai/chat` | Grounded conversational weather assistant. |
| `POST` | `/api/ai/tts` | Gemini TTS WAV synthesis with browser fallback. |

---

## Local Setup & Commands

```bash
npm install
npm run dev     # Starts Express + Vite server on port 3000
npm run lint    # Runs TypeScript type checking (tsc --noEmit)
npm run build   # Builds production frontend bundle
npm test        # Runs automated unit tests
```
