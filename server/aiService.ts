import { GoogleGenAI, Type } from '@google/genai';
import type { AiInsightsResponse, ChatMessage, LanguageCode, WeatherBundle } from '../src/types/weather';
import { getWmoInfo } from '../src/utils/weatherCodes';

let cachedClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

function buildCompactWeatherContext(bundle: WeatherBundle): string {
  const next24 = bundle.hourly.slice(0, 24).map((h) => ({
    t: h.time,
    tempC: h.temperature,
    feelsC: h.apparentTemperature,
    rainPct: h.precipitationProbability,
    rainMm: h.precipitation,
    windKmh: h.windSpeed,
    gustKmh: h.windGusts,
    uv: h.uvIndex,
    visM: h.visibility,
    cond: getWmoInfo(h.weatherCode, 'en').label,
  }));

  const week = bundle.daily.map((d) => ({
    date: d.date,
    cond: getWmoInfo(d.weatherCode, 'en').label,
    minC: d.tempMin,
    maxC: d.tempMax,
    rainMm: d.precipitationSum,
    rainProbPct: d.precipitationProbabilityMax,
    windMaxKmh: d.windSpeedMax,
    gustMaxKmh: d.windGustsMax,
    uvMax: d.uvIndexMax,
    sunrise: d.sunrise,
    sunset: d.sunset,
  }));

  const activeAlerts = bundle.alerts
    .filter((a) => a.origin === 'app_advisory')
    .map((a) => `${a.severity}: ${a.title} (${a.triggerMetric})`);

  return JSON.stringify({
    location: `${bundle.location.name}${bundle.location.admin1 ? ', ' + bundle.location.admin1 : ''}, ${bundle.location.country}`,
    coords: { lat: bundle.location.latitude, lon: bundle.location.longitude },
    isOdisha: Boolean(bundle.location.isOdisha),
    fetchedAt: bundle.fetchedAt,
    current: {
      tempC: bundle.current.temperature,
      feelsLikeC: bundle.current.apparentTemperature,
      humidityPct: bundle.current.humidity,
      windKmh: bundle.current.windSpeed,
      gustKmh: bundle.current.windGusts,
      pressureHpa: bundle.current.pressureMsl,
      uv: bundle.current.uvIndex,
      visibilityM: bundle.current.visibility,
      cloudPct: bundle.current.cloudCover,
      condition: getWmoInfo(bundle.current.weatherCode, 'en').label,
      aqiUs: bundle.current.aqi?.usAqi ?? null,
    },
    activeAdvisories: activeAlerts,
    next24Hours: next24,
    sevenDayForecast: week,
  });
}

function languageInstruction(lang: LanguageCode): string {
  if (lang === 'hi') return 'Respond naturally in Hindi (हिन्दी) unless the user writes in another language.';
  if (lang === 'or') return 'Respond naturally in Odia (ଓଡ଼ିଆ) unless the user writes in another language.';
  return 'Respond in clear, concise English unless the user writes in Hindi or Odia.';
}

function buildDeterministicInsights(bundle: WeatherBundle, lang: LanguageCode): AiInsightsResponse {
  const c = bundle.current;
  const today = bundle.daily[0];
  const next24Rain = Math.max(0, ...bundle.hourly.slice(0, 24).map((h) => h.precipitationProbability));
  const cond = getWmoInfo(c.weatherCode, lang).label;
  const temp = Math.round(c.temperature);
  const maxT = Math.round(today?.tempMax ?? c.temperature);
  const minT = Math.round(today?.tempMin ?? c.temperature);

  if (lang === 'hi') {
    return {
      summary: `${bundle.location.name} में अभी ${temp}°C (${cond}) है। अगले 24 घंटों में तापमान ${minT}°C से ${maxT}°C के बीच रहने और बारिश की अधिकतम संभावना ${next24Rain}% रहने का अनुमान है।`,
      activityAdvice:
        next24Rain >= 60 || c.windGusts >= 40
          ? 'तेज़ हवा या बारिश की संभावना के कारण बाहरी खेल या लंबी सैर टालें; इनडोर गतिविधियाँ सुरक्षित रहेंगी।'
          : c.uvIndex >= 7
          ? 'दोपहर 11 से 3 बजे के बीच धूप से बचें। सुबह या शाम की बाहरी गतिविधियाँ उपयुक्त हैं।'
          : 'मौसम सामान्य है; सुबह और शाम के समय बाहरी सैर या व्यायाम के लिए अच्छा समय है।',
      travelAdvice:
        c.visibility < 2000 || next24Rain >= 70
          ? 'कम दृश्यता या बारिश की संभावना के कारण यात्रा में अतिरिक्त समय रखें और सावधानी से वाहन चलाएँ।'
          : 'वर्तमान ओपन-मेटियो डेटा के अनुसार सड़क यात्रा के लिए स्थितियाँ सामान्य हैं।',
      clothingAndSafety: `हल्के व आरामदायक कपड़े पहनें${next24Rain >= 45 ? ' और साथ में छाता या रेनकोट रखें' : ''}। पर्याप्त पानी पिएँ।`,
      engine: 'telemetry-fallback',
      generatedAt: new Date().toISOString(),
    };
  }

  if (lang === 'or') {
    return {
      summary: `${bundle.location.name}ରେ ବର୍ତ୍ତମାନ ${temp}°C (${cond}) ତାପମାତ୍ରା ରହିଛି। ଆସନ୍ତା ୨୪ ଘଣ୍ଟାରେ ତାପମାତ୍ରା ${minT}°C ରୁ ${maxT}°C ଏବଂ ବର୍ଷାର ସମ୍ଭାବନା ${next24Rain}% ପର୍ଯ୍ୟନ୍ତ ରହିପାରେ।`,
      activityAdvice:
        next24Rain >= 60 || c.windGusts >= 40
          ? 'ବର୍ଷା କିମ୍ବା ପବନର ସମ୍ଭାବନା ଥିବାରୁ ବାହାର କାମ ପରିବର୍ତ୍ତେ ଘର ଭିତର କାର୍ଯ୍ୟକଳାପ ବାଛନ୍ତୁ।'
          : 'ସକାଳ କିମ୍ବା ସନ୍ଧ୍ୟା ସମୟ ବାହାର ବୁଲାବୁଲି ଓ ବ୍ୟାୟାମ ପାଇଁ ଉପଯୁକ୍ତ ଅଟେ।',
      travelAdvice:
        c.visibility < 2000 || next24Rain >= 70
          ? 'ବର୍ଷା କିମ୍ବା କମ୍ ଦୃଶ୍ୟମାନତା ହେତୁ ଯାତ୍ରା ସମୟରେ ସତର୍କ ରୁହନ୍ତୁ।'
          : 'ବର୍ତ୍ତମାନର ପାଣିପାଗ ତଥ୍ୟ ଅନୁଯାୟୀ ଯାତାୟାତ ପାଇଁ ପରିସ୍ଥିତି ସାଧାରଣ ରହିଛି।',
      clothingAndSafety: `ଆରାମଦାୟକ ପୋଷାକ ପିନ୍ଧନ୍ତୁ${next24Rain >= 45 ? ' ଏବଂ ଛତା କିମ୍ବା ରେନକୋଟ୍ ସାଥିରେ ରଖନ୍ତୁ' : ''}।`,
      engine: 'telemetry-fallback',
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    summary: `${bundle.location.name} is currently ${temp}°C with ${cond.toLowerCase()}. Over the next 24 hours, temperatures range from ${minT}°C to ${maxT}°C with up to ${next24Rain}% rain probability.`,
    activityAdvice:
      next24Rain >= 60 || c.windGusts >= 40
        ? 'High rain probability or strong gusts ahead — prioritize indoor plans and postpone exposed outdoor sports.'
        : c.uvIndex >= 7
        ? 'Midday UV is elevated; schedule outdoor walks or exercise before 10:00 AM or after 4:30 PM.'
        : 'Conditions are favorable for outdoor walks, cycling, or errands with moderate wind speeds.',
    travelAdvice:
      c.visibility < 2000 || next24Rain >= 70
        ? 'Allow extra transit buffer due to reduced visibility or likely wet roads; watch local advisories.'
        : `Road visibility (${(c.visibility / 1000).toFixed(1)} km) and winds (${Math.round(c.windSpeed)} km/h) indicate smooth transit conditions.`,
    clothingAndSafety: `${temp >= 30 ? 'Wear breathable light fabrics and stay hydrated' : temp <= 16 ? 'Carry a warm layer for cooler hours' : 'Light comfortable layers work well'}${next24Rain >= 40 ? '; pack rain protection' : ''}.`,
    engine: 'telemetry-fallback',
    generatedAt: new Date().toISOString(),
  };
}

export async function generateQuickInsights(
  bundle: WeatherBundle,
  lang: LanguageCode
): Promise<AiInsightsResponse> {
  const ai = getAiClient();
  if (!ai) {
    return buildDeterministicInsights(bundle, lang);
  }

  const contextJson = buildCompactWeatherContext(bundle);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Analyze this live Open-Meteo weather telemetry and return practical guidance.\n\nTELEMETRY:\n${contextJson}`,
      config: {
        systemInstruction:
          `You are WeatherGuard AI's meteorological advisor. ${languageInstruction(lang)} ` +
          `STRICT RULE: Only cite numbers, temperatures, rain probabilities, wind speeds, and conditions present in the provided TELEMETRY JSON. Never invent or hallucinate any forecast data. Keep each field concise (1-2 sentences).`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Concise 1-2 sentence weather trend summary using exact telemetry values.' },
            activityAdvice: { type: Type.STRING, description: 'Practical outdoor/indoor activity suggestion.' },
            travelAdvice: { type: Type.STRING, description: 'Commute and travel safety recommendation.' },
            clothingAndSafety: { type: Type.STRING, description: 'Clothing, hydration, or rain/cyclone preparedness tip.' },
          },
          required: ['summary', 'activityAdvice', 'travelAdvice', 'clothingAndSafety'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    if (!parsed.summary) throw new Error('Empty AI JSON response');
    return {
      summary: parsed.summary,
      activityAdvice: parsed.activityAdvice,
      travelAdvice: parsed.travelAdvice,
      clothingAndSafety: parsed.clothingAndSafety,
      engine: 'gemini-4-hydrogen',
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Gemini quick insights fallback activated:', (err as Error).message);
    return buildDeterministicInsights(bundle, lang);
  }
}

export async function generateWeatherChatReply(params: {
  message: string;
  history: ChatMessage[];
  bundle: WeatherBundle;
  language: LanguageCode;
}): Promise<{ reply: string; engine: string }> {
  const { message, history, bundle, language } = params;
  const ai = getAiClient();
  const contextJson = buildCompactWeatherContext(bundle);

  if (!ai) {
    const fallback = buildDeterministicInsights(bundle, language);
    return {
      reply: `${fallback.summary}\n\nActivity: ${fallback.activityAdvice}\nTravel: ${fallback.travelAdvice}\nPreparedness: ${fallback.clothingAndSafety}`,
      engine: 'telemetry-fallback',
    };
  }

  const recentHistory = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = [
    `LIVE WEATHER TELEMETRY (Open-Meteo, fetched ${bundle.fetchedAt}):`,
    contextJson,
    recentHistory ? `\nCONVERSATION HISTORY:\n${recentHistory}` : '',
    `\nUSER QUESTION:\n${message}`,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction:
        `You are WeatherGuard AI Assistant, an intelligent meteorological & safety advisor. ${languageInstruction(language)} ` +
        `GROUNDING RULES:\n` +
        `1. Base every numeric figure, temperature, rain probability, wind speed, UV index, visibility, and forecast day strictly on the LIVE WEATHER TELEMETRY JSON provided.\n` +
        `2. If the user asks about a different city not in the telemetry or a date beyond the 7-day window, clearly explain that you currently have live Open-Meteo data for ${bundle.location.name} for the next 7 days and invite them to search that city in the top bar.\n` +
        `3. Clearly distinguish WeatherGuard AI advisories from official government warnings (like IMD / OSDMA in India/Odisha).\n` +
        `4. Be practical, accurate, concise, and safety-focused. Never invent forecasts.`,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return {
    reply: text,
    engine: 'gemini-4-hydrogen',
  };
}

export async function generateWeatherSpeech(params: {
  text: string;
  language: LanguageCode;
}): Promise<{ audioBase64: string; mimeType: string; engine: string } | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const langLabel =
    params.language === 'hi' ? 'Hindi' : params.language === 'or' ? 'Odia' : 'English';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: params.text.slice(0, 1200),
              speechMetadata: {
                style: `Clear, calm, informative ${langLabel} weather broadcaster`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!part?.data) return null;

    return {
      audioBase64: part.data,
      mimeType: part.mimeType || 'audio/wav',
      engine: 'gemini-3.8-flash-lite-tts',
    };
  } catch (err) {
    console.warn('Gemini TTS fallback to browser speechSynthesis:', (err as Error).message);
    return null;
  }
}
