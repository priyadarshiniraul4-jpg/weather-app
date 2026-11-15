import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Mic, MicOff, Send, Trash2, User, Volume2, VolumeX } from 'lucide-react';
import type { ChatMessage, PageRoute, UserSettings, WeatherBundle } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';
import { formatTemperature, formatWindSpeed } from '../utils/formatters';
import { getWmoInfo } from '../utils/weatherCodes';
import {
  parseVoiceNavigation,
  speakWeatherText,
  startSpeechRecognition,
  stopAllSpeech,
} from '../utils/voice';

interface AiAssistantPageProps {
  bundle: WeatherBundle;
  settings: UserSettings;
  t: TranslationSchema;
  onNavigate: (page: PageRoute) => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  bundle,
  settings,
  t,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const stopRecRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      stopAllSpeech();
      stopRecRef.current?.();
    };
  }, []);

  const cond = getWmoInfo(bundle.current.weatherCode, settings.language);

  const buildSpokenReport = () => {
    const tempText = formatTemperature(bundle.current.temperature, settings.tempUnit);
    const windText = formatWindSpeed(bundle.current.windSpeed, settings.windUnit);
    const rainProb = Math.max(0, ...bundle.hourly.slice(0, 24).map((h) => h.precipitationProbability));
    const riskLevel = bundle.riskAssessment?.overallLevel || 'Low';

    if (settings.language === 'hi') {
      return `${bundle.location.name} का लाइव मौसम रिपोर्ट: वर्तमान तापमान ${tempText} और मौसम ${cond.label} है। हवा की गति ${windText} है। अगले 24 घंटों में बारिश की अधिकतम संभावना ${rainProb} प्रतिशत और समग्र जोखिम स्तर ${riskLevel} है।`;
    }
    if (settings.language === 'or') {
      return `${bundle.location.name} ର ଲାଇଭ୍ ପାଣିପାଗ ରିପୋର୍ଟ: ବର୍ତ୍ତମାନ ତାପମାତ୍ରା ${tempText} ଏବଂ ପାଗ ${cond.label} ରହିଛି। ପବନର ବେଗ ${windText}। ଆସନ୍ତା ୨୪ ଘଣ୍ଟାରେ ବର୍ଷାର ସମ୍ଭାବନା ${rainProb} ପ୍ରତିଶତ ଏବଂ ବିପଦ ସ୍ତର ${riskLevel} ଅଟେ।`;
    }
    return `WeatherGuard AI live report for ${bundle.location.name}: Currently ${tempText} with ${cond.label}. Wind is ${windText}. Peak rain probability over the next 24 hours is ${rainProb} percent, with an overall disaster risk level of ${riskLevel}.`;
  };

  const handlePlayReport = async () => {
    if (speakingId === 'brief') {
      stopAllSpeech();
      setSpeakingId(null);
      return;
    }
    setSpeakingId('brief');
    await speakWeatherText(buildSpokenReport(), settings.language, () => setSpeakingId(null));
  };

  const handleSpeakMessage = async (msgId: string, text: string) => {
    if (speakingId === msgId) {
      stopAllSpeech();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(msgId);
    await speakWeatherText(text, settings.language, () => setSpeakingId(null));
  };

  const sendMessage = async (text: string, speakResponse = false) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    // Check voice-assisted navigation intents first
    const navTarget = parseVoiceNavigation(trimmed);
    if (navTarget) {
      setVoiceNote(`Navigating to ${navTarget}...`);
      onNavigate(navTarget);
      return;
    }

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setVoiceNote(null);
    setSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
          weatherBundle: bundle,
          language: settings.language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Assistant request failed');
      }
      const botId = `${Date.now()}-a`;
      const botMsg: ChatMessage = {
        id: botId,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        engine: data.engine,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (speakResponse) {
        setSpeakingId(botId);
        await speakWeatherText(data.reply, settings.language, () => setSpeakingId(null));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const toggleVoiceInput = () => {
    if (listening) {
      stopRecRef.current?.();
      setListening(false);
      return;
    }
    setError(null);
    setVoiceNote(null);
    setListening(true);
    stopRecRef.current = startSpeechRecognition(
      settings.language,
      (transcript) => {
        setInput(transcript);
        sendMessage(transcript, true);
      },
      (msg) => setError(msg),
      () => setListening(false)
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.assistant.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.assistant.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePlayReport}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              speakingId === 'brief'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {speakingId === 'brief' ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{speakingId === 'brief' ? t.assistant.stopSpeaking : t.assistant.speakBrief}</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={() => {
                stopAllSpeech();
                setSpeakingId(null);
                setMessages([]);
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.assistant.clearChat}</span>
            </button>
          )}
        </div>
      </header>

      {/* Grounding context metadata line */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white/85 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/75 dark:text-slate-300">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Live Grounding Context:
          </span>
          <span>
            {bundle.location.name}, {bundle.location.country}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {formatTemperature(bundle.current.temperature, settings.tempUnit)} ({cond.label})
          </span>
          <span aria-hidden="true">·</span>
          <span>Languages: EN / हिन्दी / ଓଡ଼ିଆ</span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.assistant.groundedNotice}</span>
      </div>

      {voiceNote && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
          {voiceNote}
        </div>
      )}

      {/* Chat Viewport */}
      <section className="flex h-[540px] flex-col rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                <Bot className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                Ask by text or voice about {bundle.location.name}&apos;s live weather
              </h2>
              <p className="mt-1 max-w-lg text-xs text-slate-500 dark:text-slate-400">
                {t.assistant.voiceNavHint}
              </p>

              <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                {t.assistant.suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-left text-xs font-medium text-slate-700 transition-colors hover:border-sky-400 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-sky-500/60 dark:hover:bg-slate-800"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'border border-slate-200/90 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <div className="mt-2 flex items-center justify-between gap-4 border-t border-slate-200/60 pt-1.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      <span>Source: Open-Meteo · {msg.engine || 'AI'}</span>
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 font-sans text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="h-3 w-3" />
                            <span>{t.assistant.stopSpeaking}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {sending && (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
                Analyzing live Open-Meteo forecast data...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Form with Voice Microphone */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2 border-t border-slate-200/80 p-3 dark:border-slate-800"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={t.assistant.voiceInput}
            title={t.assistant.voiceInput}
            className={`inline-flex items-center justify-center rounded-xl border p-2.5 transition-colors ${
              listening
                ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? t.topbar.listening : t.assistant.inputPlaceholder}
            disabled={sending}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 whitespace-nowrap"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{t.assistant.send}</span>
          </button>
        </form>
      </section>
    </div>
  );
};
