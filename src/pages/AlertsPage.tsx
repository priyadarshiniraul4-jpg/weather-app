import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Download,
  ExternalLink,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import type { LanguageCode, NotificationLogItem, UserSettings, WeatherBundle } from '../types/weather';
import type { TranslationSchema } from '../i18n/translations';

interface AlertsPageProps {
  bundle: WeatherBundle;
  settings: UserSettings;
  notificationLogs: NotificationLogItem[];
  t: TranslationSchema;
  onToggleNotifications: (enabled: boolean) => void;
  onClearNotifications: () => void;
}

const PREPAREDNESS_GUIDES: Record<
  LanguageCode,
  {
    before: string[];
    during: string[];
    heatwave: string[];
    helplines: Array<{ label: string; number: string }>;
  }
> = {
  en: {
    before: [
      'Pack an emergency kit: dry rations, 3 days of drinking water, torch, power bank, first-aid, and waterproofed ID documents.',
      'Trim weak tree branches near rooftops and secure loose tin sheets or solar panels before winds strengthen.',
      'Track official IMD Bhubaneswar & OSDMA color-coded warnings (Yellow, Orange, Red) and identify your nearest Cyclone Shelter.',
    ],
    during: [
      'Move to a reinforced pucca building or designated OSDMA multi-purpose cyclone shelter if advised by district authorities.',
      'Switch off main electrical supply and unplug appliances during severe lightning or waterlogging.',
      'Do not venture into flooded streets, coastal embankments, or sea waters until IMD lifts marine warnings.',
    ],
    heatwave: [
      'Avoid strenuous outdoor labor between 11:00 AM and 4:00 PM; reschedule farm or construction work to early morning.',
      'Drink ORS, water, or salted buttermilk frequently even when not thirsty; wear loose light-colored cotton clothes.',
      'Seek medical help immediately if dizziness, high body temperature without sweating, or confusion appears.',
    ],
    helplines: [
      { label: 'Unified National Emergency', number: '112' },
      { label: 'Odisha State Emergency (OSDMA)', number: '1070' },
      { label: 'District Disaster Control Room', number: '1077' },
      { label: 'NDRF Disaster Helpline', number: '1078' },
      { label: 'Ambulance / Medical', number: '108' },
      { label: 'Fire & Rescue', number: '101' },
    ],
  },
  hi: {
    before: [
      'आपातकालीन किट तैयार रखें: सूखा राशन, 3 दिन का पीने का पानी, टॉर्च, पावर बैंक, प्राथमिक चिकित्सा और वाटरप्रूफ दस्तावेज़।',
      'तेज़ हवा चलने से पहले छत की कमजोर टहनियाँ काटें और ढीली टिन की चादरें या सामग्री सुरक्षित करें।',
      'IMD भुवनेश्वर और OSDMA की आधिकारिक चेतावनियों (येलो, ऑरेंज, रेड) पर नज़र रखें और निकटतम चक्रवात आश्रय स्थल पहचानें।',
    ],
    during: [
      'प्रशासन के निर्देश पर तुरंत पक्के भवन या नजदीकी OSDMA चक्रवात आश्रय केंद्र में जाएँ।',
      'बिजली चमकने या जलभराव के समय मुख्य बिजली स्विच बंद करें और उपकरणों के प्लग निकाल दें।',
      'जब तक IMD समुद्री चेतावनी वापस न ले, जलमग्न सड़कों या समुद्र तट के पास न जाएँ।',
    ],
    heatwave: [
      'सुबह 11 बजे से शाम 4 बजे के बीच कड़ी धूप में बाहर जाने या भारी श्रम से बचें।',
      'नियमित अंतराल पर पानी, ओआरएस (ORS) या छाछ पिएँ; हल्के सूती कपड़े और सिर पर कपड़ा रखें।',
      'चक्कर आने, अत्यधिक कमजोरी या हीट-स्ट्रोक के लक्षण दिखने पर तुरंत छाया में जाएँ और चिकित्सा सहायता लें।',
    ],
    helplines: [
      { label: 'राष्ट्रीय आपातकाल', number: '112' },
      { label: 'ओडिशा राज्य आपातकाल', number: '1070' },
      { label: 'जिला नियंत्रण कक्ष', number: '1077' },
      { label: 'NDRF हेल्पलाइन', number: '1078' },
      { label: 'एम्बुलेंस', number: '108' },
      { label: 'अग्निशमन', number: '101' },
    ],
  },
  or: {
    before: [
      'ଜରୁରୀକାଳୀନ କିଟ୍ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ: ଶୁଖିଲା ଖାଦ୍ୟ, ୩ ଦିନର ପିଇବା ପାଣି, ଟର୍ଚ୍ଚ, ପାୱାର ବ୍ୟାଙ୍କ, ପ୍ରାଥମିକ ଚିକିତ୍ସା ଓ ୱାଟରପ୍ରୁଫ୍ କାଗଜପତ୍ର।',
      'ପବନ ବଢ଼ିବା ପୂର୍ବରୁ ଛାତ ପାଖର ଦୁର୍ବଳ ଡାଳ କାଟନ୍ତୁ ଏବଂ ଢିଲା ଟିଣ ଚଦର ବା ସାମଗ୍ରୀକୁ ବାନ୍ଧି ରଖନ୍ତୁ।',
      'IMD ଭୁବନେଶ୍ୱର ଓ OSDMA ର ସରକାରୀ ସତର୍କ ସୂଚନା (ହଳଦିଆ, କମଳା, ଲାଲ) ଦେଖନ୍ତୁ ଏବଂ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳ ଚିହ୍ନଟ କରନ୍ତୁ।',
    ],
    during: [
      'ଜିଲ୍ଲା ପ୍ରଶାସନର ପରାମର୍ଶ ଅନୁଯାୟୀ ତୁରନ୍ତ ପକ୍କା ଘର କିମ୍ବା OSDMA ବହୁମୁଖୀ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ।',
      'ବଜ୍ରପାତ କିମ୍ବା ପାଣି ଜମିବା ସମୟରେ ମୁଖ୍ୟ ବିଦ୍ୟୁତ୍ ସୁଇଚ୍ ବନ୍ଦ ରଖନ୍ତୁ।',
      'IMD ସତର୍କତା ପ୍ରତ୍ୟାହାର ନ କରିବା ପର୍ଯ୍ୟନ୍ତ ସମୁଦ୍ର କୂଳ କିମ୍ବା ବନ୍ୟା ଜଳ ଭିତରକୁ ଯାଆନ୍ତୁ ନାହିଁ।',
    ],
    heatwave: [
      'ସକାଳ ୧୧ଟାରୁ ଅପରାହ୍ନ ୪ଟା ମଧ୍ୟରେ ପ୍ରବଳ ଖରାରେ ବାହାର କାମ କରିବା ଠାରୁ ଦୂରେଇ ରୁହନ୍ତୁ।',
      'ବାରମ୍ବାର ପାଣି, ORS କିମ୍ବା ଘୋଳଦହି ପିଅନ୍ତୁ ଏବଂ ହାଲୁକା ସୂତା ପୋଷାକ ପିନ୍ଧନ୍ତୁ।',
      'ମୁଣ୍ଡ ବୁଲାଇବା କିମ୍ବା ଅଂଶୁଘାତର ଲକ୍ଷଣ ଦେଖାଗଲେ ତୁରନ୍ତ ଛାଇକୁ ଯାଆନ୍ତୁ ଏବଂ ଡାକ୍ତରୀ ସହାୟତା ନିଅନ୍ତୁ।',
    ],
    helplines: [
      { label: 'ଜାତୀୟ ଜରୁରୀକାଳୀନ', number: '112' },
      { label: 'ଓଡ଼ିଶା ରାଜ୍ୟ ନିୟନ୍ତ୍ରଣ କକ୍ଷ', number: '1070' },
      { label: 'ଜିଲ୍ଲା ନିୟନ୍ତ୍ରଣ କକ୍ଷ', number: '1077' },
      { label: 'NDRF ସହାୟତା', number: '1078' },
      { label: 'ଆମ୍ବୁଲାନ୍ସ', number: '108' },
      { label: 'ଅଗ୍ନିଶମ', number: '101' },
    ],
  },
};

export const AlertsPage: React.FC<AlertsPageProps> = ({
  bundle,
  settings,
  notificationLogs,
  t,
  onToggleNotifications,
  onClearNotifications,
}) => {
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  const appAdvisories = bundle.alerts.filter((a) => a.origin === 'app_advisory');
  const officialRefs = bundle.alerts.filter((a) => a.origin === 'official_reference');
  const guide = PREPAREDNESS_GUIDES[settings.language];

  const handleEnableBrowserAlerts = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifStatus('Browser notifications are not supported in this browser.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      onToggleNotifications(true);
      setNotifStatus('Browser weather notifications enabled.');
      new Notification('WeatherGuard AI Alerts Active', {
        body: `Monitoring live Open-Meteo thresholds for ${bundle.location.name}.`,
      });
    } else {
      onToggleNotifications(false);
      setNotifStatus('Notification permission was not granted by the browser.');
    }
  };

  const handleSendTestAlert = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const topAlert = appAdvisories[0];
      new Notification(`WeatherGuard AI · ${bundle.location.name}`, {
        body: topAlert
          ? `${topAlert.severity}: ${topAlert.title}`
          : `Current temp ${Math.round(bundle.current.temperature)}°C. All thresholds nominal.`,
      });
      setNotifStatus('Test desktop alert dispatched.');
    } else {
      setNotifStatus('Enable browser notifications first to dispatch desktop alerts.');
    }
  };

  const handleDownloadGuide = () => {
    const content = [
      'WEATHERGUARD AI — EMERGENCY PREPAREDNESS & WEATHER SAFETY GUIDE',
      `Location: ${bundle.location.name}, ${bundle.location.country} (${bundle.location.latitude.toFixed(2)}, ${bundle.location.longitude.toFixed(2)})`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '1. BEFORE SEVERE WEATHER / CYCLONE / HEAVY RAIN',
      ...guide.before.map((s, i) => `  ${i + 1}. ${s}`),
      '',
      '2. DURING CYCLONE / FLOOD / THUNDERSTORM',
      ...guide.during.map((s, i) => `  ${i + 1}. ${s}`),
      '',
      '3. HEATWAVE PRECAUTIONS',
      ...guide.heatwave.map((s, i) => `  ${i + 1}. ${s}`),
      '',
      '4. EMERGENCY CONTACT DIRECTORY',
      ...guide.helplines.map((h) => `  - ${h.label}: ${h.number}`),
      '',
      '5. OFFICIAL GOVERNMENT RESOURCES',
      '  - IMD Mausam: https://mausam.imd.gov.in/',
      '  - IMD Bhubaneswar (Odisha): https://mausam.imd.gov.in/bhubaneswar/',
      '  - IMD RSMC Tropical Cyclone: https://rsmcnewdelhi.imd.gov.in/',
      '  - OSDMA Odisha: https://www.osdma.org/',
      '  - NDMA Sachet CAP Alerts: https://sachet.ndma.gov.in/',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WeatherGuard_Emergency_Guide_${bundle.location.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.alerts.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {bundle.location.name} · {t.alerts.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadGuide}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>{t.alerts.downloadGuide}</span>
          </button>

          <button
            onClick={handleEnableBrowserAlerts}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              settings.notificationsEnabled
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>{t.alerts.enableBrowserAlerts}</span>
          </button>

          <button
            onClick={handleSendTestAlert}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
          >
            <span>{t.alerts.testNotification}</span>
          </button>
        </div>
      </header>

      {notifStatus && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
          {notifStatus}
        </div>
      )}

      {/* Clear Distinction Notice */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-100/70 px-4 py-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        {t.alerts.distinctionNote}
      </div>

      {/* Section 1: Application-Generated Advisories */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.alerts.appAdvisoriesHeading}
          </h2>
        </div>

        {appAdvisories.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{t.alerts.noActiveAppAdvisories}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {appAdvisories.map((alert) => {
              const isSevere = alert.severity === 'Extreme' || alert.severity === 'Severe';
              return (
                <article
                  key={alert.id}
                  className={`rounded-2xl border p-5 backdrop-blur-md ${
                    isSevere
                      ? 'border-rose-300 bg-rose-50/75 dark:border-rose-800/70 dark:bg-rose-950/30'
                      : 'border-amber-300 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 shrink-0 ${
                          isSevere ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          isSevere ? 'text-rose-700 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {alert.severity} · App-Generated Advisory
                      </span>
                    </div>
                    {alert.triggerMetric && (
                      <span className="font-mono text-[11px] text-slate-600 tabular-nums dark:text-slate-300">
                        {alert.triggerMetric}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {alert.description}
                  </p>

                  <ul className="mt-3 space-y-1.5 border-t border-slate-200/70 pt-3 text-xs text-slate-700 dark:border-slate-700/70 dark:text-slate-300">
                    {alert.safetyInstructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-[10px] text-slate-500">0{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{alert.sourceName}</span>
                    <span className="font-mono tabular-nums">
                      {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Official Government Warnings & Portals */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.alerts.officialSourcesHeading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {officialRefs.map((ref) => (
            <article
              key={ref.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/85 p-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-sky-700 dark:text-sky-400">
                  <span className="font-semibold">Official Government Source</span>
                  {ref.regionFocus && <span className="text-slate-500 dark:text-slate-400">{ref.regionFocus}</span>}
                </div>
                <h3 className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white">
                  {ref.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {ref.description}
                </p>
                <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {ref.safetyInstructions.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{ref.sourceName}</span>
                {ref.officialUrl && (
                  <a
                    href={ref.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-700 dark:bg-sky-600 dark:hover:bg-sky-700 whitespace-nowrap"
                  >
                    <span>{t.alerts.openPortal}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 3: Emergency Preparedness Checklists & Heatwave Precautions */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/75">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.alerts.odishaPreparednessHeading}
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Before Severe Weather / Cyclone
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {guide.before.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">0{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              During Storm / Flood / Rain
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {guide.during.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">0{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sun className="h-3.5 w-3.5 text-orange-500" />
              <span>Heatwave Precautions</span>
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {guide.heatwave.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">0{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Contact Directory */}
        <div className="mt-6 border-t border-slate-200/80 pt-5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <PhoneCall className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Emergency Contact Directory (India &amp; Odisha)</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {guide.helplines.map((h) => (
              <div
                key={h.number + h.label}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className="font-mono text-lg font-bold text-sky-700 tabular-nums dark:text-sky-400">
                  {h.number}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Notification History Center */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 dark:border-slate-800 dark:bg-slate-900/75">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Alert Notification Center ({notificationLogs.length})
          </h2>
          {notificationLogs.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Clear Log
            </button>
          )}
        </div>
        {notificationLogs.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            No triggered alert notifications logged during this session yet.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-slate-200/70 dark:divide-slate-800">
            {notificationLogs.slice(0, 8).map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-4 py-2.5 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {n.severity} · {n.title}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{n.body}</div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
