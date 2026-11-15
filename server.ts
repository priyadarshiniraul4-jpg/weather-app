import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  fetchAgricultureData,
  fetchClimateAnalytics,
  fetchFloodMonitor,
  fetchOdishaNetwork,
  fetchTravelRouteForecast,
  fetchWeatherBundle,
  reverseGeocode,
  searchLocations,
} from './server/weatherService';
import {
  generateQuickInsights,
  generateWeatherChatReply,
  generateWeatherSpeech,
} from './server/aiService';
import type { ChatMessage, LanguageCode, LocationInfo, WeatherBundle } from './src/types/weather';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseLocationFromQuery(query: express.Request['query']): LocationInfo | null {
  const lat = Number(query.lat);
  const lon = Number(query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  return {
    name: String(query.name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`),
    admin1: query.admin1 ? String(query.admin1) : undefined,
    country: String(query.country || 'India'),
    countryCode: query.countryCode ? String(query.countryCode) : undefined,
    latitude: lat,
    longitude: lon,
  };
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'WeatherGuard AI Backend',
      timestamp: new Date().toISOString(),
      providers: {
        weather: 'Open-Meteo Forecast, Archive & GloFAS Flood API',
        geocoding: 'Open-Meteo Geocoding & OSM Nominatim',
        maps: 'OpenStreetMap, RainViewer & OSRM Routing',
        ai:
          process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
            ? 'Gemini 4 Hydrogen & 3.8 TTS (Configured)'
            : 'Telemetry Fallback Mode',
      },
    });
  });

  app.get('/api/docs', (_req, res) => {
    res.json({
      name: 'WeatherGuard AI REST API',
      version: '2.0.0',
      endpoints: [
        {
          method: 'GET',
          path: '/api/health',
          description: 'Service health and active upstream provider configuration.',
        },
        {
          method: 'GET',
          path: '/api/geocode?q=Bhubaneswar',
          description: 'Search cities, states, and countries via Open-Meteo Geocoding API.',
        },
        {
          method: 'GET',
          path: '/api/reverse-geocode?lat=20.2961&lon=85.8245',
          description: 'Resolve GPS coordinates to city/state/country via OpenStreetMap Nominatim.',
        },
        {
          method: 'GET',
          path: '/api/weather?lat=20.2961&lon=85.8245&name=Bhubaneswar&admin1=Odisha&country=India&countryCode=IN',
          description: 'Fetch live weather, 24h hourly, 7-day forecast, AQI, disaster risk assessment, and safety advisories.',
        },
        {
          method: 'GET',
          path: '/api/odisha-network',
          description: 'Batch Open-Meteo telemetry for 8 Odisha coastal and inland monitoring stations.',
        },
        {
          method: 'GET',
          path: '/api/analytics?lat=20.2961&lon=85.8245&name=Bhubaneswar',
          description: 'Historical ERA5 climate statistics, 12-month monthly breakdowns, and multi-year trends.',
        },
        {
          method: 'GET',
          path: '/api/flood?lat=20.2961&lon=85.8245&name=Bhubaneswar',
          description: 'Open-Meteo GloFAS river discharge, flood risk indicators, and Odisha river basin watch.',
        },
        {
          method: 'GET',
          path: '/api/agriculture?lat=20.2961&lon=85.8245&name=Bhubaneswar',
          description: 'Soil moisture, soil temperature, FAO ET0 evapotranspiration, irrigation and crop advisories.',
        },
        {
          method: 'POST',
          path: '/api/travel/route',
          description: 'OSRM driving route geometry paired with 5-waypoint Open-Meteo weather hazards and safe departure windows.',
        },
        {
          method: 'POST',
          path: '/api/ai/insights',
          description: 'Generate grounded weather trend, activity, and travel insights from live telemetry.',
        },
        {
          method: 'POST',
          path: '/api/ai/chat',
          description: 'Conversational AI weather assistant grounded strictly in live Open-Meteo forecast data.',
        },
        {
          method: 'POST',
          path: '/api/ai/tts',
          description: 'Generate spoken weather briefing audio via Gemini TTS (with browser Web Speech fallback).',
        },
      ],
    });
  });

  app.get('/api/geocode', async (req, res) => {
    try {
      const q = String(req.query.q || '');
      const results = await searchLocations(q);
      res.json({ results });
    } catch (error) {
      console.error('Geocode error:', error);
      res.status(502).json({
        error: 'Unable to reach geocoding service. Please try again or pick a preset city.',
      });
    }
  });

  app.get('/api/reverse-geocode', async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      res.status(400).json({ error: 'Valid lat and lon query parameters are required.' });
      return;
    }
    const location = await reverseGeocode(lat, lon);
    res.json({ location });
  });

  app.get('/api/weather', async (req, res) => {
    try {
      const location = parseLocationFromQuery(req.query);
      if (!location) {
        res.status(400).json({ error: 'Valid latitude (-90..90) and longitude (-180..180) are required.' });
        return;
      }
      const bundle = await fetchWeatherBundle(location);
      res.json(bundle);
    } catch (error) {
      console.error('Weather fetch error:', error);
      res.status(502).json({
        error: 'Live weather telemetry is temporarily unreachable. Please retry shortly.',
      });
    }
  });

  app.get('/api/odisha-network', async (_req, res) => {
    try {
      const stations = await fetchOdishaNetwork();
      res.json({
        updatedAt: new Date().toISOString(),
        stations,
      });
    } catch (error) {
      console.error('Odisha network error:', error);
      res.status(502).json({
        error: 'Unable to fetch Odisha station network telemetry.',
      });
    }
  });

  app.get('/api/analytics', async (req, res) => {
    try {
      const location = parseLocationFromQuery(req.query);
      if (!location) {
        res.status(400).json({ error: 'Valid lat and lon parameters are required.' });
        return;
      }
      const data = await fetchClimateAnalytics(location);
      res.json(data);
    } catch (error) {
      console.error('Climate analytics error:', error);
      res.status(502).json({ error: 'Historical climate archive is temporarily unavailable.' });
    }
  });

  app.get('/api/flood', async (req, res) => {
    try {
      const location = parseLocationFromQuery(req.query);
      if (!location) {
        res.status(400).json({ error: 'Valid lat and lon parameters are required.' });
        return;
      }
      const data = await fetchFloodMonitor(location);
      res.json(data);
    } catch (error) {
      console.error('Flood monitor error:', error);
      res.status(502).json({ error: 'GloFAS flood telemetry is temporarily unavailable.' });
    }
  });

  app.get('/api/agriculture', async (req, res) => {
    try {
      const location = parseLocationFromQuery(req.query);
      if (!location) {
        res.status(400).json({ error: 'Valid lat and lon parameters are required.' });
        return;
      }
      const data = await fetchAgricultureData(location);
      res.json(data);
    } catch (error) {
      console.error('Agriculture error:', error);
      res.status(502).json({ error: 'Agricultural soil telemetry is temporarily unavailable.' });
    }
  });

  app.post('/api/travel/route', async (req, res) => {
    try {
      const { source, destination, sourceQuery, destinationQuery } = req.body as {
        source?: LocationInfo;
        destination?: LocationInfo;
        sourceQuery?: string;
        destinationQuery?: string;
      };

      let resolvedSource = source;
      let resolvedDest = destination;

      if (!resolvedSource && sourceQuery?.trim()) {
        const matches = await searchLocations(sourceQuery.trim());
        resolvedSource = matches[0];
      }
      if (!resolvedDest && destinationQuery?.trim()) {
        const matches = await searchLocations(destinationQuery.trim());
        resolvedDest = matches[0];
      }

      if (!resolvedSource || !resolvedDest) {
        res.status(400).json({ error: 'Valid source and destination locations are required.' });
        return;
      }

      const routeForecast = await fetchTravelRouteForecast(resolvedSource, resolvedDest);
      res.json(routeForecast);
    } catch (error) {
      console.error('Travel route error:', error);
      res.status(502).json({ error: 'Unable to compute travel weather corridor right now.' });
    }
  });

  app.post('/api/ai/insights', async (req, res) => {
    try {
      const { weatherBundle, language } = req.body as {
        weatherBundle?: WeatherBundle;
        language?: LanguageCode;
      };
      if (!weatherBundle?.current || !weatherBundle?.location) {
        res.status(400).json({ error: 'weatherBundle payload is required.' });
        return;
      }
      const insights = await generateQuickInsights(weatherBundle, language || 'en');
      res.json(insights);
    } catch (error) {
      console.error('AI insights error:', error);
      res.status(500).json({ error: 'Failed to generate weather insights.' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history, weatherBundle, language } = req.body as {
        message?: string;
        history?: ChatMessage[];
        weatherBundle?: WeatherBundle;
        language?: LanguageCode;
      };
      if (!message?.trim()) {
        res.status(400).json({ error: 'Message cannot be empty.' });
        return;
      }
      if (!weatherBundle?.current || !weatherBundle?.location) {
        res.status(400).json({ error: 'Live weather context is required before chatting.' });
        return;
      }

      const result = await generateWeatherChatReply({
        message: message.trim(),
        history: Array.isArray(history) ? history : [],
        bundle: weatherBundle,
        language: language || 'en',
      });
      res.json(result);
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({
        error: 'WeatherGuard AI could not process that request right now. Please try again.',
      });
    }
  });

  app.post('/api/ai/tts', async (req, res) => {
    try {
      const { text, language } = req.body as { text?: string; language?: LanguageCode };
      if (!text?.trim()) {
        res.status(400).json({ error: 'Text is required for speech synthesis.' });
        return;
      }
      const audio = await generateWeatherSpeech({
        text: text.trim(),
        language: language || 'en',
      });
      if (!audio) {
        res.json({ fallback: 'browser' });
        return;
      }
      res.json(audio);
    } catch {
      res.json({ fallback: 'browser' });
    }
  });

  return app;
}

async function startServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherGuard AI server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
