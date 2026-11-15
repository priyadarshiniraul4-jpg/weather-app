import type { LanguageCode } from '../types/weather';

export interface TranslationSchema {
  appName: string;
  tagline: string;
  nav: {
    home: string;
    forecast: string;
    map: string;
    analytics: string;
    flood: string;
    agriculture: string;
    travel: string;
    assistant: string;
    alerts: string;
    about: string;
    settings: string;
  };
  topbar: {
    searchPlaceholder: string;
    useGps: string;
    refresh: string;
    locating: string;
    voiceSearch: string;
    listening: string;
  };
  metrics: {
    feelsLike: string;
    humidity: string;
    wind: string;
    gusts: string;
    pressure: string;
    uvIndex: string;
    visibility: string;
    precipitation: string;
    cloudCover: string;
    sunrise: string;
    sunset: string;
    airQuality: string;
  };
  home: {
    hourlyTitle: string;
    aiBriefTitle: string;
    riskTitle: string;
    confidenceLabel: string;
    cycloneWatchLabel: string;
    activityLabel: string;
    travelLabel: string;
    preparednessLabel: string;
    odishaWatchTitle: string;
    odishaWatchSubtitle: string;
    featuredCitiesTitle: string;
    recentTitle: string;
    viewAllForecast: string;
    askAssistant: string;
    activeAdvisories: string;
    noSevereAlerts: string;
  };
  forecast: {
    title: string;
    subtitle: string;
    hourly24Title: string;
    daily7Title: string;
    tempLabel: string;
    rainProbLabel: string;
    precipSumLabel: string;
    windMaxLabel: string;
    uvMaxLabel: string;
  };
  map: {
    title: string;
    subtitle: string;
    radarLayer: string;
    odishaStations: string;
    clickHint: string;
    inspectHere: string;
    setAsActive: string;
  };
  analytics: {
    title: string;
    subtitle: string;
    monthlyTempTitle: string;
    monthlyRainTitle: string;
    yearlyTitle: string;
    warmestMonth: string;
    wettestMonth: string;
    annualAvgTemp: string;
    annualRain: string;
  };
  flood: {
    title: string;
    subtitle: string;
    dischargeTitle: string;
    basinsTitle: string;
    safetyTitle: string;
    currentDischarge: string;
    rain24h: string;
    rain7d: string;
    riskStatus: string;
  };
  agriculture: {
    title: string;
    subtitle: string;
    irrigationTitle: string;
    soilMetricsTitle: string;
    cropAdvisoriesTitle: string;
    soilTemp: string;
    topMoisture: string;
    rootMoisture: string;
    et0Label: string;
  };
  travel: {
    title: string;
    subtitle: string;
    sourceLabel: string;
    destinationLabel: string;
    planRoute: string;
    routeMapTitle: string;
    waypointsTitle: string;
    safeWindowsTitle: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    groundedNotice: string;
    inputPlaceholder: string;
    send: string;
    clearChat: string;
    speakBrief: string;
    stopSpeaking: string;
    voiceInput: string;
    voiceNavHint: string;
    suggestedPrompts: string[];
  };
  alerts: {
    title: string;
    subtitle: string;
    appAdvisoriesHeading: string;
    officialSourcesHeading: string;
    distinctionNote: string;
    odishaPreparednessHeading: string;
    downloadGuide: string;
    enableBrowserAlerts: string;
    testNotification: string;
    openPortal: string;
    noActiveAppAdvisories: string;
  };
  about: {
    title: string;
    subtitle: string;
    missionHeading: string;
    architectureHeading: string;
    apiDocsHeading: string;
    testEndpoint: string;
  };
  settings: {
    title: string;
    subtitle: string;
    appearance: string;
    lightMode: string;
    darkMode: string;
    highContrast: string;
    language: string;
    units: string;
    temperatureUnit: string;
    windUnit: string;
    pressureUnit: string;
    locationPrefs: string;
    autoGps: string;
    autoRefresh: string;
    savedLocations: string;
    saveCurrent: string;
    setDefault: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  en: {
    appName: 'WeatherGuard AI',
    tagline: 'Know the Weather. Prepare Before It Happens.',
    nav: {
      home: 'Home',
      forecast: 'Forecast',
      map: 'Weather Map',
      analytics: 'Climate Analytics',
      flood: 'Flood Monitor',
      agriculture: 'Smart Agriculture',
      travel: 'Travel Planner',
      assistant: 'AI & Voice',
      alerts: 'Emergency Center',
      about: 'About & API',
      settings: 'Settings',
    },
    topbar: {
      searchPlaceholder: 'Search city, state, or country...',
      useGps: 'Locate Me',
      refresh: 'Refresh',
      locating: 'Locating...',
      voiceSearch: 'Voice search',
      listening: 'Listening...',
    },
    metrics: {
      feelsLike: 'Feels Like',
      humidity: 'Humidity',
      wind: 'Wind',
      gusts: 'Gusts',
      pressure: 'Pressure',
      uvIndex: 'UV Index',
      visibility: 'Visibility',
      precipitation: 'Precipitation',
      cloudCover: 'Cloud Cover',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      airQuality: 'Air Quality (US AQI)',
    },
    home: {
      hourlyTitle: 'Next 24 Hours Telemetry',
      aiBriefTitle: 'AI Weather & Safety Brief',
      riskTitle: 'AI Disaster Risk Intelligence',
      confidenceLabel: 'Forecast Confidence',
      cycloneWatchLabel: 'Cyclone & Pressure Watch',
      activityLabel: 'Activity Guidance',
      travelLabel: 'Travel & Commute',
      preparednessLabel: 'Preparedness',
      odishaWatchTitle: 'Odisha Coastal & State Network',
      odishaWatchSubtitle: 'Live Bay of Bengal & inland station readings via Open-Meteo',
      featuredCitiesTitle: 'India & Odisha Quick Switch',
      recentTitle: 'Recently Viewed',
      viewAllForecast: 'Full 7-Day Forecast',
      askAssistant: 'Ask AI & Voice',
      activeAdvisories: 'Active Weather Advisories',
      noSevereAlerts: 'No severe local threshold advisories triggered right now.',
    },
    forecast: {
      title: 'Hourly & 7-Day Forecast',
      subtitle: 'High-resolution Open-Meteo atmospheric projections',
      hourly24Title: '24-Hour Temperature & Rain Probability',
      daily7Title: '7-Day Extended Outlook',
      tempLabel: 'Temperature',
      rainProbLabel: 'Rain Chance',
      precipSumLabel: 'Rainfall',
      windMaxLabel: 'Max Wind',
      uvMaxLabel: 'Max UV',
    },
    map: {
      title: 'Interactive Weather & Risk Map',
      subtitle: 'OpenStreetMap geography with live precipitation radar and Odisha cyclone stations',
      radarLayer: 'Live Rain Radar',
      odishaStations: 'Odisha Stations',
      clickHint: 'Click anywhere on the map to fetch live Open-Meteo weather for those coordinates.',
      inspectHere: 'Selected Coordinates',
      setAsActive: 'Load on Dashboard',
    },
    analytics: {
      title: 'Historical Weather & Climate Analytics',
      subtitle: 'Trailing 12-month statistics and multi-year climate trends from Open-Meteo ERA5 archive',
      monthlyTempTitle: 'Monthly Mean Temperature Trend (Last 12 Months)',
      monthlyRainTitle: 'Monthly Cumulative Rainfall & Peak Wind',
      yearlyTitle: 'Multi-Year Climate Comparison',
      warmestMonth: 'Warmest Month',
      wettestMonth: 'Wettest Month',
      annualAvgTemp: '12-Month Mean Temp',
      annualRain: '12-Month Total Rainfall',
    },
    flood: {
      title: 'Flood & Heavy Rainfall Monitoring',
      subtitle: 'Live GloFAS hydrological river discharge, rainfall intensity, and Odisha river basin risk',
      dischargeTitle: '7-Day River Discharge Projection (m³/s)',
      basinsTitle: 'Odisha Major River Basins & Delta Watch',
      safetyTitle: 'Flood & Waterlogging Safety Guidance',
      currentDischarge: 'River Discharge',
      rain24h: '24h Forecast Rain',
      rain7d: '7-Day Cumulative Rain',
      riskStatus: 'Basin Flood Status',
    },
    agriculture: {
      title: 'Smart Agriculture & Crop Advisory',
      subtitle: 'Live soil moisture, root-zone temperature, FAO ET₀ evapotranspiration, and irrigation planner',
      irrigationTitle: 'Irrigation Water Balance Recommendation',
      soilMetricsTitle: 'Live Soil & Evapotranspiration Telemetry',
      cropAdvisoriesTitle: 'Regional Crop-Weather Advisories',
      soilTemp: 'Surface Soil Temp',
      topMoisture: 'Topsoil Moisture (0–1 cm)',
      rootMoisture: 'Root-Zone Moisture (3–9 cm)',
      et0Label: 'Today FAO ET₀ Demand',
    },
    travel: {
      title: 'Smart Travel Weather Planner',
      subtitle: 'Check live weather hazards along driving corridors between any two cities',
      sourceLabel: 'Origin City',
      destinationLabel: 'Destination City',
      planRoute: 'Analyze Travel Route',
      routeMapTitle: 'Interactive Corridor Weather Map',
      waypointsTitle: 'Corridor Waypoint Conditions',
      safeWindowsTitle: '24-Hour Safer Departure Windows',
    },
    assistant: {
      title: 'AI Weather & Voice Assistant',
      subtitle: 'Natural-language chat, voice search, and spoken weather reports in English, Hindi & Odia',
      groundedNotice: 'AI responses reference only real fetched forecast telemetry and never invent weather data.',
      inputPlaceholder: 'Ask by text or microphone about rain, flood risk, crops, travel, or voice navigation...',
      send: 'Send',
      clearChat: 'Clear Chat',
      speakBrief: 'Play Voice Report',
      stopSpeaking: 'Stop Audio',
      voiceInput: 'Speak Query',
      voiceNavHint: 'Try saying: "Open flood monitor", "Show travel planner", or "What is the rain risk today?"',
      suggestedPrompts: [
        'Is it safe to travel or commute over the next 24 hours?',
        'Suggest indoor or outdoor activities based on today’s weather.',
        'Summarize the 7-day temperature and rainfall trend.',
        'What rain, flood, or cyclone risks should Odisha prepare for today?',
      ],
    },
    alerts: {
      title: 'Emergency Preparedness & Alert Center',
      subtitle: 'Live threshold advisories, official IMD/OSDMA portals, emergency contacts, and downloadable guide',
      appAdvisoriesHeading: 'Application-Generated Advisories (Open-Meteo Live Telemetry)',
      officialSourcesHeading: 'Official Government Weather & Cyclone Warnings',
      distinctionNote:
        'Application advisories are computed automatically from live Open-Meteo metrics. Always rely on official government meteorological agencies (IMD / OSDMA / NDMA) for statutory warnings and evacuation orders.',
      odishaPreparednessHeading: 'Cyclone, Flood, Heavy-Rain & Heatwave Preparedness',
      downloadGuide: 'Download Safety Guide',
      enableBrowserAlerts: 'Browser Notifications',
      testNotification: 'Send Test Alert',
      openPortal: 'Open Official Portal',
      noActiveAppAdvisories: 'All monitored Open-Meteo thresholds (heavy rain, gale wind, heatwave, storm) are currently within normal bounds.',
    },
    about: {
      title: 'About WeatherGuard AI',
      subtitle: 'Intelligent forecasting, disaster resilience, agriculture telemetry, and grounded AI',
      missionHeading: 'Mission & Social Impact',
      architectureHeading: 'System Architecture',
      apiDocsHeading: 'REST API Endpoints & Live Status Monitor',
      testEndpoint: 'Test Endpoint',
    },
    settings: {
      title: 'Settings, Accessibility & Preferences',
      subtitle: 'Customize theme, high-contrast mode, language, units, auto-refresh, and saved locations',
      appearance: 'Theme & Accessibility',
      lightMode: 'Light Theme',
      darkMode: 'Dark Theme',
      highContrast: 'High-Contrast Accessibility Mode',
      language: 'Display Language',
      units: 'Measurement Units',
      temperatureUnit: 'Temperature',
      windUnit: 'Wind Speed',
      pressureUnit: 'Atmospheric Pressure',
      locationPrefs: 'Location, Auto-Refresh & Notifications',
      autoGps: 'Auto-detect GPS location on startup',
      autoRefresh: 'Automatic Data Refresh',
      savedLocations: 'Favorite Locations',
      saveCurrent: 'Save Active City',
      setDefault: 'Set Default',
    },
  },
  hi: {
    appName: 'WeatherGuard AI',
    tagline: 'मौसम को जानें। आने से पहले तैयार रहें।',
    nav: {
      home: 'होम',
      forecast: 'पूर्वानुमान',
      map: 'मौसम मानचित्र',
      analytics: 'जलवायु विश्लेषण',
      flood: 'बाढ़ निगरानी',
      agriculture: 'स्मार्ट कृषि',
      travel: 'यात्रा योजनाकार',
      assistant: 'AI व वॉइस',
      alerts: 'आपातकाल केंद्र',
      about: 'परिचय व API',
      settings: 'सेटिंग्स',
    },
    topbar: {
      searchPlaceholder: 'शहर, राज्य या देश खोजें...',
      useGps: 'मेरी लोकेशन',
      refresh: 'रिफ्रेश',
      locating: 'खोज रहे हैं...',
      voiceSearch: 'वॉइस खोज',
      listening: 'सुन रहे हैं...',
    },
    metrics: {
      feelsLike: 'अनुभव तापमान',
      humidity: 'नमी',
      wind: 'हवा की गति',
      gusts: 'हवा के झोंके',
      pressure: 'वायुदाब',
      uvIndex: 'यूवी इंडेक्स',
      visibility: 'दृश्यता',
      precipitation: 'वर्षा',
      cloudCover: 'बादल',
      sunrise: 'सूर्योदय',
      sunset: 'सूर्यास्त',
      airQuality: 'वायु गुणवत्ता (US AQI)',
    },
    home: {
      hourlyTitle: 'अगले 24 घंटे का मौसम डेटा',
      aiBriefTitle: 'AI मौसम एवं सुरक्षा सारांश',
      riskTitle: 'AI आपदा जोखिम विश्लेषण',
      confidenceLabel: 'पूर्वानुमान विश्वसनीयता',
      cycloneWatchLabel: 'चक्रवात व वायुदाब निगरानी',
      activityLabel: 'गतिविधि सुझाव',
      travelLabel: 'यात्रा सलाह',
      preparednessLabel: 'तैयारी निर्देश',
      odishaWatchTitle: 'ओडिशा तटीय एवं राज्य नेटवर्क',
      odishaWatchSubtitle: 'ओपन-मेटियो द्वारा बंगाल की खाड़ी और ओडिशा के लाइव स्टेशन',
      featuredCitiesTitle: 'भारत और ओडिशा प्रमुख शहर',
      recentTitle: 'हाल में देखे गए शहर',
      viewAllForecast: '7-दिन का पूर्वानुमान',
      askAssistant: 'AI व वॉइस सहायक',
      activeAdvisories: 'सक्रिय मौसम सलाह',
      noSevereAlerts: 'अभी कोई गंभीर स्थानीय मौसम चेतावनी सक्रिय नहीं है।',
    },
    forecast: {
      title: 'प्रति घंटा और 7-दिन का पूर्वानुमान',
      subtitle: 'ओपन-मेटियो लाइव वायुमंडलीय डेटा',
      hourly24Title: '24-घंटे तापमान और बारिश की संभावना',
      daily7Title: '7-दिन का विस्तृत पूर्वानुमान',
      tempLabel: 'तापमान',
      rainProbLabel: 'बारिश संभावना',
      precipSumLabel: 'कुल वर्षा',
      windMaxLabel: 'अधिकतम हवा',
      uvMaxLabel: 'अधिकतम यूवी',
    },
    map: {
      title: 'इंटरैक्टिव मौसम व जोखिम मानचित्र',
      subtitle: 'लाइव बारिश रडार और ओडिशा चक्रवात निगरानी केंद्रों के साथ OpenStreetMap',
      radarLayer: 'लाइव बारिश रडार',
      odishaStations: 'ओडिशा स्टेशन',
      clickHint: 'उस स्थान का लाइव मौसम देखने के लिए मानचित्र पर कहीं भी क्लिक करें।',
      inspectHere: 'चयनित निर्देशांक',
      setAsActive: 'डैशबोर्ड पर लोड करें',
    },
    analytics: {
      title: 'ऐतिहासिक मौसम और जलवायु विश्लेषण',
      subtitle: 'Open-Meteo ERA5 ऐतिहासिक डेटा से पिछले 12 महीनों और बहु-वर्षीय रुझान',
      monthlyTempTitle: 'मासिक औसत तापमान रुझान (पिछले 12 महीने)',
      monthlyRainTitle: 'मासिक कुल वर्षा और अधिकतम हवा',
      yearlyTitle: 'बहु-वर्षीय जलवायु तुलना',
      warmestMonth: 'सबसे गर्म महीना',
      wettestMonth: 'सबसे अधिक वर्षा वाला महीना',
      annualAvgTemp: '12-माह औसत तापमान',
      annualRain: '12-माह कुल वर्षा',
    },
    flood: {
      title: 'बाढ़ और भारी वर्षा निगरानी',
      subtitle: 'GloFAS नदी जल प्रवाह, वर्षा तीव्रता और ओडिशा नदी बेसिन जोखिम',
      dischargeTitle: '7-दिन नदी जल प्रवाह पूर्वानुमान (m³/s)',
      basinsTitle: 'ओडिशा के प्रमुख नदी बेसिन',
      safetyTitle: 'बाढ़ एवं जलभराव सुरक्षा निर्देश',
      currentDischarge: 'नदी जल प्रवाह',
      rain24h: '24 घंटे संभावित वर्षा',
      rain7d: '7-दिन कुल वर्षा',
      riskStatus: 'बेसिन बाढ़ स्थिति',
    },
    agriculture: {
      title: 'स्मार्ट कृषि एवं फसल सलाह',
      subtitle: 'मृदा नमी, मिट्टी तापमान, FAO ET₀ वाष्पीकरण और सिंचाई योजनाकार',
      irrigationTitle: 'सिंचाई जल संतुलन सुझाव',
      soilMetricsTitle: 'लाइव मृदा व वाष्पीकरण डेटा',
      cropAdvisoriesTitle: 'क्षेत्रीय फसल-मौसम सलाह',
      soilTemp: 'सतही मिट्टी तापमान',
      topMoisture: 'ऊपरी मिट्टी नमी (0–1 cm)',
      rootMoisture: 'जड़ क्षेत्र नमी (3–9 cm)',
      et0Label: 'आज की FAO ET₀ मांग',
    },
    travel: {
      title: 'स्मार्ट यात्रा मौसम योजनाकार',
      subtitle: 'दो शहरों के बीच सड़क मार्ग पर मौसम खतरों और सुरक्षित यात्रा समय की जांच करें',
      sourceLabel: 'प्रारंभिक शहर',
      destinationLabel: 'गंतव्य शहर',
      planRoute: 'यात्रा मार्ग जांचें',
      routeMapTitle: 'इंटरैक्टिव यात्रा मौसम मानचित्र',
      waypointsTitle: 'मार्ग बिंदुओं पर लाइव मौसम',
      safeWindowsTitle: 'अगले 24 घंटे के सुरक्षित यात्रा समय',
    },
    assistant: {
      title: 'AI मौसम व वॉइस सहायक',
      subtitle: 'हिन्दी, अंग्रेज़ी और उड़िया में बोलकर मौसम खोजें और रिपोर्ट सुनें',
      groundedNotice: 'AI केवल वास्तविक पूर्वानुमान डेटा का उपयोग करता है और कभी काल्पनिक मौसम नहीं बनाता।',
      inputPlaceholder: 'बारिश, बाढ़, फसल, यात्रा या नेविगेशन के बारे में पूछें या माइक दबाएँ...',
      send: 'भेजें',
      clearChat: 'चैट साफ़ करें',
      speakBrief: 'वॉइस रिपोर्ट सुनें',
      stopSpeaking: 'ऑडियो रोकें',
      voiceInput: 'बोलकर पूछें',
      voiceNavHint: 'बोलें: "बाढ़ निगरानी खोलें", "यात्रा योजनाकार दिखाएँ" या "आज बारिश कैसी रहेगी?"',
      suggestedPrompts: [
        'क्या अगले 24 घंटों में यात्रा करना सुरक्षित है?',
        'आज के मौसम के अनुसार सुरक्षित गतिविधियाँ सुझाएँ।',
        'इस सप्ताह के तापमान और बारिश का सारांश बताएँ।',
        'आज बारिश, गर्मी या तेज़ हवा से जुड़े कौन से जोखिम हैं?',
      ],
    },
    alerts: {
      title: 'आपातकालीन तैयारी और चेतावनी केंद्र',
      subtitle: 'लाइव सलाह, आधिकारिक IMD/OSDMA पोर्टल, हेल्पलाइन और डाउनलोड करने योग्य गाइड',
      appAdvisoriesHeading: 'ऐप-जनित मौसम सलाह (ओपन-मेटियो लाइव टेलीमेट्री)',
      officialSourcesHeading: 'आधिकारिक सरकारी मौसम और चक्रवात चेतावनियाँ',
      distinctionNote:
        'ऐप की सलाह लाइव ओपन-मेटियो सीमाओं पर आधारित है। आधिकारिक आपदा और निकासी आदेशों के लिए हमेशा IMD / OSDMA / NDMA पोर्टल देखें।',
      odishaPreparednessHeading: 'चक्रवात, बाढ़, भारी बारिश और लू से सुरक्षा मार्गदर्शिका',
      downloadGuide: 'सुरक्षा गाइड डाउनलोड करें',
      enableBrowserAlerts: 'ब्राउज़र सूचनाएँ',
      testNotification: 'परीक्षण अलर्ट भेजें',
      openPortal: 'आधिकारिक पोर्टल खोलें',
      noActiveAppAdvisories: 'वर्तमान में सभी स्थानीय मौसम मानक सामान्य सीमा के भीतर हैं।',
    },
    about: {
      title: 'WeatherGuard AI के बारे में',
      subtitle: 'स्मार्ट मौसम पूर्वानुमान, आपदा सुरक्षा, कृषि डेटा और AI मार्गदर्शन',
      missionHeading: 'उद्देश्य और सामाजिक प्रभाव',
      architectureHeading: 'सिस्टम आर्किटेक्चर',
      apiDocsHeading: 'REST API दस्तावेज़ और लाइव स्थिति जांच',
      testEndpoint: 'API जांचें',
    },
    settings: {
      title: 'सेटिंग्स, सुगम्यता और प्राथमिकताएँ',
      subtitle: 'थीम, उच्च-कंट्रास्ट मोड, भाषा, इकाइयाँ, ऑटो-रिफ्रेश और शहर प्रबंधित करें',
      appearance: 'थीम व सुगम्यता विकल्प',
      lightMode: 'लाइट थीम',
      darkMode: 'डार्क थीम',
      highContrast: 'हाई-कंट्रास्ट सुगम्यता मोड',
      language: 'प्रदर्शन भाषा',
      units: 'मापन इकाइयाँ',
      temperatureUnit: 'तापमान',
      windUnit: 'हवा की गति',
      pressureUnit: 'वायुदाब',
      locationPrefs: 'लोकेशन, ऑटो-रिफ्रेश और सूचनाएँ',
      autoGps: 'शुरुआत में GPS लोकेशन स्वतः पहचानें',
      autoRefresh: 'स्वचालित डेटा रिफ्रेश',
      savedLocations: 'पसंदीदा शहर',
      saveCurrent: 'वर्तमान शहर सहेजें',
      setDefault: 'डिफ़ॉल्ट सेट करें',
    },
  },
  or: {
    appName: 'WeatherGuard AI',
    tagline: 'ପାଗ ବିଷୟରେ ଜାଣନ୍ତୁ। ବିପଦ ପୂର୍ବରୁ ପ୍ରସ୍ତୁତ ରୁହନ୍ତୁ।',
    nav: {
      home: 'ହୋମ୍',
      forecast: 'ପୂର୍ବାନୁମାନ',
      map: 'ପାଣିପାଗ ମାନଚିତ୍ର',
      analytics: 'ଜଳବାୟୁ ବିଶ୍ଳେଷଣ',
      flood: 'ବନ୍ୟା ନିରୀକ୍ଷଣ',
      agriculture: 'ସ୍ମାର୍ଟ କୃଷି',
      travel: 'ଯାତ୍ରା ଯୋଜନା',
      assistant: 'AI ଓ ଭଏସ୍',
      alerts: 'ଜରୁରୀକାଳୀନ କେନ୍ଦ୍ର',
      about: 'ବିବରଣୀ ଓ API',
      settings: 'ସେଟିଂସ୍',
    },
    topbar: {
      searchPlaceholder: 'ସହର, ରାଜ୍ୟ କିମ୍ବା ଦେଶ ଖୋଜନ୍ତୁ...',
      useGps: 'ମୋ ଅବସ୍ଥାନ',
      refresh: 'ରିଫ୍ରେସ୍',
      locating: 'ଖୋଜାଯାଉଛି...',
      voiceSearch: 'ଭଏସ୍ ସର୍ଚ୍ଚ',
      listening: 'ଶୁଣୁଛି...',
    },
    metrics: {
      feelsLike: 'ଅନୁଭୂତ ତାପମାତ୍ରା',
      humidity: 'ଆର୍ଦ୍ରତା',
      wind: 'ପବନ ବେଗ',
      gusts: 'ପବନ ଝଟକା',
      pressure: 'ବାୟୁଚାପ',
      uvIndex: 'UV ସୂଚକାଙ୍କ',
      visibility: 'ଦୃଶ୍ୟମାନତା',
      precipitation: 'ବର୍ଷା',
      cloudCover: 'ମେଘ ଆଚ୍ଛାଦନ',
      sunrise: 'ସୂର୍ଯ୍ୟୋଦୟ',
      sunset: 'ସୂର୍ଯ୍ୟାସ୍ତ',
      airQuality: 'ବାୟୁ ଗୁଣବତ୍ତା (US AQI)',
    },
    home: {
      hourlyTitle: 'ଆସନ୍ତା ୨୪ ଘଣ୍ଟାର ପାଣିପାଗ ତଥ୍ୟ',
      aiBriefTitle: 'AI ପାଣିପାଗ ଓ ସୁରକ୍ଷା ସାରାଂଶ',
      riskTitle: 'AI ବିପର୍ଯ୍ୟୟ ବିପଦ ବିଶ୍ଳେଷଣ',
      confidenceLabel: 'ପୂର୍ବାନୁମାନ ବିଶ୍ୱସନୀୟତା',
      cycloneWatchLabel: 'ବାତ୍ୟା ଓ ବାୟୁଚାପ ନଜର',
      activityLabel: 'କାର୍ଯ୍ୟକଳାପ ପରାମର୍ଶ',
      travelLabel: 'ଯାତ୍ରା ସୂଚନା',
      preparednessLabel: 'ପ୍ରସ୍ତୁତି ନିର୍ଦ୍ଦେଶ',
      odishaWatchTitle: 'ଓଡ଼ିଶା ଉପକୂଳ ଓ ରାଜ୍ୟ ନେଟୱାର୍କ',
      odishaWatchSubtitle: 'Open-Meteo ମାଧ୍ୟମରେ ବଙ୍ଗୋପସାଗର ଓ ଓଡ଼ିଶାର ଲାଇଭ୍ ଷ୍ଟେସନ୍ ତଥ୍ୟ',
      featuredCitiesTitle: 'ଭାରତ ଓ ଓଡ଼ିଶାର ପ୍ରମୁଖ ସହର',
      recentTitle: 'ସମ୍ପ୍ରତି ଦେଖାଯାଇଥିବା ସହର',
      viewAllForecast: '୭-ଦିନିଆ ପୂର୍ବାନୁମାନ',
      askAssistant: 'AI ଓ ଭଏସ୍ ସହାୟକ',
      activeAdvisories: 'ସକ୍ରିୟ ପାଣିପାଗ ପରାମର୍ଶ',
      noSevereAlerts: 'ବର୍ତ୍ତମାନ କୌଣସି ଗୁରୁତର ସ୍ଥାନୀୟ ସତର୍କ ସୂଚନା ନାହିଁ।',
    },
    forecast: {
      title: 'ଘଣ୍ଟାୱାରୀ ଓ ୭-ଦିନିଆ ପୂର୍ବାନୁମାନ',
      subtitle: 'Open-Meteo ଲାଇଭ୍ ବାୟୁମଣ୍ଡଳୀୟ ତଥ୍ୟ',
      hourly24Title: '୨୪-ଘଣ୍ଟା ତାପମାତ୍ରା ଓ ବର୍ଷା ସମ୍ଭାବନା',
      daily7Title: '୭-ଦିନିଆ ବିସ୍ତୃତ ପୂର୍ବାନୁମାନ',
      tempLabel: 'ତାପମାତ୍ରା',
      rainProbLabel: 'ବର୍ଷା ସମ୍ଭାବନା',
      precipSumLabel: 'ମୋଟ ବର୍ଷା',
      windMaxLabel: 'ସର୍ବାଧିକ ପବନ',
      uvMaxLabel: 'ସର୍ବାଧିକ UV',
    },
    map: {
      title: 'ଇଣ୍ଟରାକ୍ଟିଭ୍ ପାଣିପାଗ ଓ ବିପଦ ମାନଚିତ୍ର',
      subtitle: 'ଲାଇଭ୍ ବର୍ଷା ରାଡାର୍ ଓ ଓଡ଼ିଶା ବାତ୍ୟା ନିରୀକ୍ଷଣ କେନ୍ଦ୍ର ସହ OpenStreetMap',
      radarLayer: 'ଲାଇଭ୍ ବର୍ଷା ରାଡାର୍',
      odishaStations: 'ଓଡ଼ିଶା ଷ୍ଟେସନ୍',
      clickHint: 'ସେହି ସ୍ଥାନର ଲାଇଭ୍ ପାଣିପାଗ ଦେଖିବା ପାଇଁ ମାନଚିତ୍ରରେ କ୍ଲିକ୍ କରନ୍ତୁ।',
      inspectHere: 'ଚୟନିତ ସ୍ଥାନ',
      setAsActive: 'ଡ୍ୟାସବୋର୍ଡରେ ଦେଖନ୍ତୁ',
    },
    analytics: {
      title: 'ଐତିହାସିକ ପାଣିପାଗ ଓ ଜଳବାୟୁ ବିଶ୍ଳେଷଣ',
      subtitle: 'Open-Meteo ERA5 ତଥ୍ୟରୁ ଗତ ୧୨ ମାସ ଓ ବହୁ-ବର୍ଷୀୟ ଜଳବାୟୁ ଧାରା',
      monthlyTempTitle: 'ମାସିକ ହାରାହାରି ତାପମାତ୍ରା ଧାରା (ଗତ ୧୨ ମାସ)',
      monthlyRainTitle: 'ମାସିକ ମୋଟ ବର୍ଷା ଓ ସର୍ବାଧିକ ପବନ',
      yearlyTitle: 'ବହୁ-ବର୍ଷୀୟ ଜଳବାୟୁ ତୁଳନା',
      warmestMonth: 'ସବୁଠାରୁ ଉତ୍ତପ୍ତ ମାସ',
      wettestMonth: 'ସର୍ବାଧିକ ବର୍ଷା ମାସ',
      annualAvgTemp: '୧୨-ମାସ ହାରାହାରି ତାପମାତ୍ରା',
      annualRain: '୧୨-ମାସ ମୋଟ ବର୍ଷା',
    },
    flood: {
      title: 'ବନ୍ୟା ଓ ପ୍ରବଳ ବର୍ଷା ନିରୀକ୍ଷଣ',
      subtitle: 'GloFAS ନଦୀ ଜଳ ପ୍ରବାହ, ବର୍ଷା ତୀବ୍ରତା ଓ ଓଡ଼ିଶା ନଦୀ ଅବବାହିକା ସୂଚନା',
      dischargeTitle: '୭-ଦିନିଆ ନଦୀ ଜଳ ପ୍ରବାହ ପୂର୍ବାନୁମାନ (m³/s)',
      basinsTitle: 'ଓଡ଼ିଶାର ପ୍ରମୁଖ ନଦୀ ଅବବାହିକା',
      safetyTitle: 'ବନ୍ୟା ଓ ଜଳବନ୍ଦୀ ସୁରକ୍ଷା ପରାମର୍ଶ',
      currentDischarge: 'ନଦୀ ଜଳ ପ୍ରବାହ',
      rain24h: '୨୪ ଘଣ୍ଟା ବର୍ଷା ସମ୍ଭାବନା',
      rain7d: '୭-ଦିନ ମୋଟ ବର୍ଷା',
      riskStatus: 'ଅବବାହିକା ବନ୍ୟା ସ୍ଥିତି',
    },
    agriculture: {
      title: 'ସ୍ମାର୍ଟ କୃଷି ଓ ଫସଲ ପରାମର୍ଶ',
      subtitle: 'ମୃତ୍ତିକା ଆର୍ଦ୍ରତା, ମାଟି ତାପମାତ୍ରା, FAO ET₀ ଓ ଜଳସେଚନ ଯୋଜନା',
      irrigationTitle: 'ଜଳସେଚନ ଜଳ ସନ୍ତୁଳନ ପରାମର୍ଶ',
      soilMetricsTitle: 'ଲାଇଭ୍ ମୃତ୍ତିକା ଓ ବାଷ୍ପୀଭବନ ତଥ୍ୟ',
      cropAdvisoriesTitle: 'ଆଞ୍ଚଳିକ ଫସଲ-ପାଣିପାଗ ପରାମର୍ଶ',
      soilTemp: 'ଉପରିସ୍ଥ ମାଟି ତାପମାତ୍ରା',
      topMoisture: 'ଉପର ମାଟି ଆର୍ଦ୍ରତା (0–1 cm)',
      rootMoisture: 'ମୂଳ ସ୍ତର ଆର୍ଦ୍ରତା (3–9 cm)',
      et0Label: 'ଆଜିର FAO ET₀ ଆବଶ୍ୟକତା',
    },
    travel: {
      title: 'ସ୍ମାର୍ଟ ଯାତ୍ରା ପାଣିପାଗ ଯୋଜନାକାର',
      subtitle: 'ଦୁଇ ସହର ମଧ୍ୟରେ ଯାତ୍ରା ପଥର ପାଣିପାଗ ବିପଦ ଓ ନିରାପଦ ସମୟ ଜାଣନ୍ତୁ',
      sourceLabel: 'ଯାତ୍ରା ଆରମ୍ଭ ସହର',
      destinationLabel: 'ଗନ୍ତବ୍ୟ ସହର',
      planRoute: 'ଯାତ୍ରା ପଥ ବିଶ୍ଳେଷଣ କରନ୍ତୁ',
      routeMapTitle: 'ଇଣ୍ଟରାକ୍ଟିଭ୍ ଯାତ୍ରା ପଥ ମାନଚିତ୍ର',
      waypointsTitle: 'ଯାତ୍ରା ପଥର ବିଭିନ୍ନ ସ୍ଥାନରେ ପାଣିପାଗ',
      safeWindowsTitle: 'ଆସନ୍ତା ୨୪ ଘଣ୍ଟାର ନିରାପଦ ଯାତ୍ରା ସମୟ',
    },
    assistant: {
      title: 'AI ପାଣିପାଗ ଓ ଭଏସ୍ ସହାୟକ',
      subtitle: 'ଓଡ଼ିଆ, ହିନ୍ଦୀ ଓ ଇଂରାଜୀରେ କଥାବାର୍ତ୍ତା ଓ ଭଏସ୍ ପାଣିପାଗ ରିପୋର୍ଟ',
      groundedNotice: 'AI କେବଳ ପ୍ରକୃତ ପୂର୍ବାନୁମାନ ତଥ୍ୟ ବ୍ୟବହାର କରେ ଏବଂ କେବେ ମିଥ୍ୟା ତଥ୍ୟ ତିଆରି କରେ ନାହିଁ।',
      inputPlaceholder: 'ବର୍ଷା, ବନ୍ୟା, ଚାଷ, ଯାତ୍ରା କିମ୍ବା ନେଭିଗେସନ୍ ବିଷୟରେ ପଚାରନ୍ତୁ କିମ୍ବା ମାଇକ୍ ବ୍ୟବହାର କରନ୍ତୁ...',
      send: 'ପଠାନ୍ତୁ',
      clearChat: 'ଚାଟ୍ ସଫା କରନ୍ତୁ',
      speakBrief: 'ଭଏସ୍ ରିପୋର୍ଟ ଶୁଣନ୍ତୁ',
      stopSpeaking: 'ଅଡିଓ ବନ୍ଦ କରନ୍ତୁ',
      voiceInput: 'କହିକି ପଚାରନ୍ତୁ',
      voiceNavHint: 'କୁହନ୍ତୁ: "Open flood monitor", "Show travel planner" କିମ୍ବା "ଆଜିର ପାଗ କେମିତି ରହିବ?"',
      suggestedPrompts: [
        'ଆସନ୍ତା ୨୪ ଘଣ୍ଟାରେ ଯାତ୍ରା କରିବା ସୁରକ୍ଷିତ କି?',
        'ଆଜିର ପାଗ ଅନୁଯାୟୀ ଉପଯୁକ୍ତ କାର୍ଯ୍ୟକଳାପ ପରାମର୍ଶ ଦିଅନ୍ତୁ।',
        'ଆଗାମୀ ୭ ଦିନର ତାପମାତ୍ରା ଓ ବର୍ଷାର ସାରାଂଶ କୁହନ୍ତୁ।',
        'ଆଜି ବର୍ଷା, ବନ୍ୟା କିମ୍ବା ବାତ୍ୟା ନେଇ କୌଣସି ବିପଦ ଅଛି କି?',
      ],
    },
    alerts: {
      title: 'ଜରୁରୀକାଳୀନ ପ୍ରସ୍ତୁତି ଓ ସତର୍କ କେନ୍ଦ୍ର',
      subtitle: 'ଲାଇଭ୍ ତଥ୍ୟ ପରାମର୍ଶ, IMD/OSDMA ସରକାରୀ ପୋର୍ଟାଲ୍, ହେଲ୍ପଲାଇନ୍ ଓ ଡାଉନଲୋଡ୍ ଗାଇଡ୍',
      appAdvisoriesHeading: 'ଆପ୍-ଆଧାରିତ ପରାମର୍ଶ (Open-Meteo ଲାଇଭ୍ ତଥ୍ୟ)',
      officialSourcesHeading: 'ସରକାରୀ ପାଣିପାଗ ଓ ବାତ୍ୟା ସତର୍କ ସୂଚନା (IMD / OSDMA)',
      distinctionNote:
        'ଆପ୍ ପରାମର୍ଶଗୁଡ଼ିକ ଲାଇଭ୍ Open-Meteo ତଥ୍ୟରୁ ଗଣନା କରାଯାଏ। ସରକାରୀ ସତର୍କତା ପାଇଁ ସର୍ବଦା IMD, OSDMA ଓ NDMA ପୋର୍ଟାଲ୍ ଯାଞ୍ଚ କରନ୍ତୁ।',
      odishaPreparednessHeading: 'ବାତ୍ୟା, ବନ୍ୟା, ପ୍ରବଳ ବର୍ଷା ଓ ଗ୍ରୀଷ୍ମ ପ୍ରବାହ ପ୍ରସ୍ତୁତି',
      downloadGuide: 'ସୁରକ୍ଷା ଗାଇଡ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
      enableBrowserAlerts: 'ବ୍ରାଉଜର୍ ସୂଚନା',
      testNotification: 'ଟେଷ୍ଟ ଆଲର୍ଟ ପଠାନ୍ତୁ',
      openPortal: 'ସରକାରୀ ପୋର୍ଟାଲ୍ ଖୋଲନ୍ତୁ',
      noActiveAppAdvisories: 'ବର୍ତ୍ତମାନ ସମସ୍ତ ସ୍ଥାନୀୟ ପାଣିପାଗ ସୂଚକ ସ୍ୱାଭାବିକ ସୀମା ମଧ୍ୟରେ ଅଛି।',
    },
    about: {
      title: 'WeatherGuard AI ବିଷୟରେ',
      subtitle: 'ବୁଦ୍ଧିମାନ ପାଣିପାଗ ପୂର୍ବାନୁମାନ, ବିପର୍ଯ୍ୟୟ ସୁରକ୍ଷା, କୃଷି ତଥ୍ୟ ଓ AI ମାର୍ଗଦର୍ଶନ',
      missionHeading: 'ଲକ୍ଷ୍ୟ ଓ ସାମାଜିକ ପ୍ରଭାବ',
      architectureHeading: 'ସିଷ୍ଟମ୍ ଆର୍କିଟେକଚର୍',
      apiDocsHeading: 'REST API ଡକ୍ୟୁମେଣ୍ଟେସନ୍ ଓ ଲାଇଭ୍ ସ୍ଥିତି',
      testEndpoint: 'API ପରୀକ୍ଷା କରନ୍ତୁ',
    },
    settings: {
      title: 'ସେଟିଂସ୍, ସୁଗମତା ଓ ପସନ୍ଦ',
      subtitle: 'ଥିମ୍, ହାଇ-କଣ୍ଟ୍ରାଷ୍ଟ ମୋଡ୍, ଭାଷା, ମାପକ ଏକକ, ଅଟୋ-ରିଫ୍ରେସ୍ ଓ ସଞ୍ଚିତ ସହର',
      appearance: 'ଥିମ୍ ଓ ସୁଗମତା',
      lightMode: 'ଲାଇଟ୍ ଥିମ୍',
      darkMode: 'ଡାର୍କ ଥିମ୍',
      highContrast: 'ହାଇ-କଣ୍ଟ୍ରାଷ୍ଟ ସୁଗମତା ମୋଡ୍',
      language: 'ଭାଷା ଚୟନ',
      units: 'ମାପକ ଏକକ',
      temperatureUnit: 'ତାପମାତ୍ରା',
      windUnit: 'ପବନ ବେଗ',
      pressureUnit: 'ବାୟୁଚାପ',
      locationPrefs: 'ଅବସ୍ଥାନ, ଅଟୋ-ରିଫ୍ରେସ୍ ଓ ସୂଚନା',
      autoGps: 'ଆରମ୍ଭରେ GPS ଅବସ୍ଥାନ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଚିହ୍ନଟ କରନ୍ତୁ',
      autoRefresh: 'ସ୍ୱୟଂଚାଳିତ ତଥ୍ୟ ରିଫ୍ରେସ୍',
      savedLocations: 'ପ୍ରିୟ ସହରଗୁଡ଼ିକ',
      saveCurrent: 'ବର୍ତ୍ତମାନର ସହର ସଞ୍ଚୟ କରନ୍ତୁ',
      setDefault: 'ଡିଫଲ୍ଟ ସେଟ୍ କରନ୍ତୁ',
    },
  },
};
