import type { LanguageCode, PageRoute } from '../types/weather';

const LANG_BCP47: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  or: 'or-IN',
};

let activeAudio: HTMLAudioElement | null = null;

export function stopAllSpeech(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakWeatherText(
  text: string,
  language: LanguageCode,
  onEnd?: () => void
): Promise<'gemini-tts' | 'browser-tts' | 'unavailable'> {
  stopAllSpeech();
  const cleanText = text.trim();
  if (!cleanText) {
    onEnd?.();
    return 'unavailable';
  }

  try {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        activeAudio = audio;
        audio.onended = () => {
          activeAudio = null;
          onEnd?.();
        };
        audio.onerror = () => {
          activeAudio = null;
          onEnd?.();
        };
        await audio.play();
        return 'gemini-tts';
      }
    }
  } catch {
    // Fall through to browser Web Speech synthesis
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = LANG_BCP47[language] || 'en-IN';
    utter.rate = 0.98;
    utter.onend = () => onEnd?.();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
    return 'browser-tts';
  }

  onEnd?.();
  return 'unavailable';
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function startSpeechRecognition(
  language: LanguageCode,
  onResult: (transcript: string) => void,
  onError: (msg: string) => void,
  onEnd?: () => void
): () => void {
  const w = window as unknown as Record<string, any>;
  const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Rec) {
    onError('Voice input is not supported in this browser. Please type your query.');
    onEnd?.();
    return () => {};
  }

  const recognition = new Rec();
  recognition.lang = LANG_BCP47[language] || 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event?.results?.[0]?.[0]?.transcript || '';
    if (transcript) onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    const code = event?.error || 'unknown';
    onError(
      code === 'not-allowed'
        ? 'Microphone permission was denied.'
        : 'Could not capture speech clearly. Please try again.'
    );
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
  return () => {
    try {
      recognition.stop();
    } catch {
      // Ignore stop errors
    }
  };
}

export function parseVoiceNavigation(transcript: string): PageRoute | null {
  const lower = transcript.toLowerCase();
  const hasNavVerb =
    lower.includes('open') ||
    lower.includes('go to') ||
    lower.includes('show') ||
    lower.includes('switch to') ||
    lower.includes('खोल') ||
    lower.includes('दिखा') ||
    lower.includes('ଖୋଲ');

  if (!hasNavVerb) return null;

  if (lower.includes('flood') || lower.includes('बाढ़') || lower.includes('ବନ୍ୟା')) return 'flood';
  if (lower.includes('agri') || lower.includes('crop') || lower.includes('farm') || lower.includes('कृषि') || lower.includes('ଚାଷ')) return 'agriculture';
  if (lower.includes('travel') || lower.includes('route') || lower.includes('trip') || lower.includes('यात्रा') || lower.includes('ଯାତ୍ରା')) return 'travel';
  if (lower.includes('analytic') || lower.includes('climate') || lower.includes('history') || lower.includes('जलवायु')) return 'analytics';
  if (lower.includes('forecast') || lower.includes('7 day') || lower.includes('पूर्वानुमान')) return 'forecast';
  if (lower.includes('map') || lower.includes('radar') || lower.includes('मानचित्र')) return 'map';
  if (lower.includes('alert') || lower.includes('emergency') || lower.includes('cyclone') || lower.includes('चेतावनी')) return 'alerts';
  if (lower.includes('setting') || lower.includes('theme') || lower.includes('सेटिंग')) return 'settings';
  if (lower.includes('about') || lower.includes('api')) return 'about';
  if (lower.includes('home') || lower.includes('dashboard') || lower.includes('होम')) return 'home';

  return null;
}
