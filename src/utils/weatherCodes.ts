import type { LanguageCode } from '../types/weather';

export type WeatherVisualCategory =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'thunderstorm';

interface WmoEntry {
  category: WeatherVisualCategory;
  en: string;
  hi: string;
  or: string;
}

const WMO_MAP: Record<number, WmoEntry> = {
  0: { category: 'clear', en: 'Clear Sky', hi: 'साफ़ आसमान', or: 'ନିର୍ମଳ ଆକାଶ' },
  1: { category: 'partly_cloudy', en: 'Mainly Clear', hi: 'मुख्यतः साफ़', or: 'ମୁଖ୍ୟତଃ ନିର୍ମଳ' },
  2: { category: 'partly_cloudy', en: 'Partly Cloudy', hi: 'आंशिक बादल', or: 'ଆଂଶିକ ମେଘୁଆ' },
  3: { category: 'cloudy', en: 'Overcast', hi: 'घने बादल', or: 'ଘନ ମେଘୁଆ' },
  45: { category: 'fog', en: 'Fog', hi: 'कोहरा', or: 'କୁହୁଡ଼ି' },
  48: { category: 'fog', en: 'Depositing Rime Fog', hi: 'घना कोहरा', or: 'ଘନ କୁହୁଡ଼ି' },
  51: { category: 'drizzle', en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी', or: 'ହାଲୁକା ଝିପିଝିପି ବର୍ଷା' },
  53: { category: 'drizzle', en: 'Moderate Drizzle', hi: 'मध्यम बूंदाबांदी', or: 'ମଧ୍ୟମ ଝିପିଝିପି ବର୍ଷା' },
  55: { category: 'drizzle', en: 'Dense Drizzle', hi: 'तेज़ बूंदाबांदी', or: 'ଘନ ଝିପିଝିପି ବର୍ଷା' },
  56: { category: 'drizzle', en: 'Freezing Drizzle', hi: 'बर्फीली बूंदाबांदी', or: 'ଥଣ୍ଡା ଝିପିଝିପି ବର୍ଷା' },
  57: { category: 'drizzle', en: 'Dense Freezing Drizzle', hi: 'घनी बर्फीली बूंदाबांदी', or: 'ପ୍ରବଳ ଥଣ୍ଡା ବର୍ଷା' },
  61: { category: 'rain', en: 'Slight Rain', hi: 'हल्की बारिश', or: 'ହାଲୁକା ବର୍ଷା' },
  63: { category: 'rain', en: 'Moderate Rain', hi: 'मध्यम बारिश', or: 'ମଧ୍ୟମ ବର୍ଷା' },
  65: { category: 'heavy_rain', en: 'Heavy Rain', hi: 'भारी बारिश', or: 'ପ୍ରବଳ ବର୍ଷା' },
  66: { category: 'rain', en: 'Freezing Rain', hi: 'बर्फीली बारिश', or: 'ବରଫ ମିଶ୍ରିତ ବର୍ଷା' },
  67: { category: 'heavy_rain', en: 'Heavy Freezing Rain', hi: 'तेज़ बर्फीली बारिश', or: 'ପ୍ରବଳ ବରଫ ମିଶ୍ରିତ ବର୍ଷା' },
  71: { category: 'snow', en: 'Slight Snowfall', hi: 'हल्की बर्फबारी', or: 'ହାଲୁକା ତୁଷାରପାତ' },
  73: { category: 'snow', en: 'Moderate Snowfall', hi: 'मध्यम बर्फबारी', or: 'ମଧ୍ୟମ ତୁଷାରପାତ' },
  75: { category: 'snow', en: 'Heavy Snowfall', hi: 'भारी बर्फबारी', or: 'ପ୍ରବଳ ତୁଷାରପାତ' },
  77: { category: 'snow', en: 'Snow Grains', hi: 'हिम कण', or: 'ତୁଷାର କଣା' },
  80: { category: 'rain', en: 'Slight Rain Showers', hi: 'हल्की बौछारें', or: 'ହାଲୁକା ବର୍ଷା ଝାପ୍ସା' },
  81: { category: 'rain', en: 'Moderate Rain Showers', hi: 'मध्यम बौछारें', or: 'ମଧ୍ୟମ ବର୍ଷା ଝାପ୍ସା' },
  82: { category: 'heavy_rain', en: 'Violent Rain Showers', hi: 'मूसलाधार बौछारें', or: 'ଅତି ପ୍ରବଳ ବର୍ଷା' },
  85: { category: 'snow', en: 'Slight Snow Showers', hi: 'हल्की हिम बौछारें', or: 'ହାଲୁକା ତୁଷାର ବର୍ଷା' },
  86: { category: 'snow', en: 'Heavy Snow Showers', hi: 'भारी हिम बौछारें', or: 'ପ୍ରବଳ ତୁଷାର ବର୍ଷା' },
  95: { category: 'thunderstorm', en: 'Thunderstorm', hi: 'आंधी-तूफान', or: 'ବଜ୍ରପାତ ସହ ଝଡ଼ବର୍ଷା' },
  96: { category: 'thunderstorm', en: 'Thunderstorm & Hail', hi: 'ओलावृष्टि और तूफान', or: 'କୁଆପଥର ସହ ଝଡ଼ତୋଫାନ' },
  99: { category: 'thunderstorm', en: 'Severe Thunderstorm & Hail', hi: 'भीषण तूफान और ओले', or: 'ଭୟଙ୍କର ଝଡ଼ତୋଫାନ ଓ ବଜ୍ରପାତ' },
};

export function getWmoInfo(code: number, lang: LanguageCode = 'en'): { label: string; category: WeatherVisualCategory } {
  const entry = WMO_MAP[code] || {
    category: 'partly_cloudy' as WeatherVisualCategory,
    en: 'Variable Conditions',
    hi: 'परिवर्तनशील मौसम',
    or: 'ପରିବର୍ତ୍ତନଶୀଳ ପାଗ',
  };
  return {
    label: entry[lang] || entry.en,
    category: entry.category,
  };
}

export function getWindCompass(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return dirs[idx];
}

export function getUvCategory(uv: number): { label: string; level: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' } {
  if (uv < 3) return { label: 'Low', level: 'Low' };
  if (uv < 6) return { label: 'Moderate', level: 'Moderate' };
  if (uv < 8) return { label: 'High', level: 'High' };
  if (uv < 11) return { label: 'Very High', level: 'Very High' };
  return { label: 'Extreme', level: 'Extreme' };
}
