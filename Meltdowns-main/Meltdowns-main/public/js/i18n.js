/**
 * ============================================================================
 * SensoryShield AI - Arabic & English Localization System (i18n)
 * ============================================================================
 */

const translations = {
  ar: {
    appTitle: 'درع الحواس الذكي™',
    appSubtitle: 'محاكي الوقاية من نوبات الانهيار والتحسس الحسي (التوحد و SPD)',
    tabSplit: '◫ عرض مزدوج',
    tabPatient: '⌚ جهاز المريض',
    tabGuardian: '🛡️ لوحة ولي الأمر',
    connConnecting: 'جارٍ الاتصال...',
    connConnected: 'متصل بالخادم المباشر',
    connDisconnected: 'انقطع الاتصال',
    bannerTitle: '🚨 تنبيه حرج: تم اكتشاف مؤشرات نوبة انهيار حسي وشيكة!',
    bannerDesc: 'تجاوز معدل ضربات القلب والضوضاء المحيطة حدود الأمان. تم تفعيل الضوضاء البيضاء المهدئة تلقائياً.',
    bannerDismiss: 'إقرار / فهمت',
    
    // Patient Panel
    patientTitle: 'محاكي جهاز المريض القابل للارتداء',
    riskNormal: 'مخاطر طبيعية',
    riskElevated: 'حمل حسي مرتفع',
    riskDanger: 'خطر نوبة وشيكة',
    heartLabel: '❤️ معدل نبضات القلب (المؤشرات الحيوية)',
    heartUnit: 'نبضة/دقيقة',
    heartMin: '60 نبضة/د (وقت الراحة)',
    heartThreshold: '⚠️ حد الخطر: > 110 نبضة/د',
    heartMax: '160 نبضة/د (الحد الأقصى)',
    noiseLabel: '🔊 مستوى الضوضاء المحيطة (البيئة الخارجية)',
    noiseUnit: 'ديسيبل',
    noiseMin: '30 ديسيبل (مكتبة هادئة)',
    noiseThreshold: '⚠️ حد الخطر: > 80 ديسيبل',
    noiseMax: '120 ديسيبل (ضوضاء صاخبة)',
    
    // Presets
    presetsLabel: '⚡ سيناريوهات محاكاة سريعة بنقرة واحدة',
    presetCalmTitle: '🌿 غرفة دراسة هادئة',
    presetCalmSub: '72 نبضة · 42 ديسيبل (طبيعي)',
    presetClassroomTitle: '📚 كافيتريا نشطة',
    presetClassroomSub: '96 نبضة · 74 ديسيبل (مرتفع)',
    presetMeltdownTitle: '🚨 مشغّل نوبة التحسس',
    presetMeltdownSub: '128 نبضة · 88 ديسيبل (حرج)',
    presetExerciseTitle: '🏃 رياضة في مكان هادئ',
    presetExerciseSub: '135 نبضة · 42 ديسيبل (آمن)',
    
    // Auto Emit
    autoEmitLabel: '📡 البث التلقائي للبيانات (كل ثانيتين):',
    sendNowBtn: 'إرسال الآن ➔',
    
    // Audio Intervention
    audioTitle: 'التدخل الصوتي المهدئ',
    audioIdle: 'في وضع الاستعداد',
    audioActive: 'الصوت المهدئ يعمل الآن 🔊',
    audioMsgDefault: 'يتم تشغيل الضوضاء الوردية/البيضاء المهدئة تلقائياً عند تجاوز عتبة التحسس (النبض > 110 والضوضاء > 80) لمنع الانهيار الحسي.',
    audioMsgPlaying: 'تم تجاوز عتبة التحميل الحسي. الضوضاء البيضاء المهدئة تعمل الآن لتخفيف التوتر.',
    playAudioBtn: '▶ تشغيل الصوت',
    stopAudioBtn: '⏹ إيقاف الصوت',
    
    // Guardian Dashboard
    guardianTitle: 'لوحة ولي الأمر والمراقبة الفورية عن بُعد',
    patientHeartRateLabel: 'معدل نبضات المريض',
    ambientNoiseLabel: 'الضوضاء المحيطة',
    sensoryRiskLabel: 'مؤشر خطر الحمل الحسي',
    statusConditionLabel: 'حالة المريض',
    conditionSafe: '🌿 آمن ومستقر',
    conditionElevated: '⚠️ حمل حسي مرتفع',
    conditionDanger: '🚨 نوبة انهيار حسي وشيكة',
    locationHeader: 'الموقع الحي للبيئة المحيطة بالمريض',
    locationText: '<strong>أكاديمية غرين وود</strong> — القاعة 204 (الجناح الشرقي)',
    addressText: '742 إيفرجرين تراس، سبرينغفيلد',
    coordsText: 'إحداثيات GPS: 44.0462° شمالاً، 123.0220° غرباً',
    logHeader: 'سجل التنبيهات والبث المباشر',
    clearLogs: 'مسح السجل',
    logInitial: 'تم تشغيل شاشة مراقبة ولي الأمر. بانتظار بث بيانات المريض...',
    
    // Modal
    modalTitle: '🚨 تنبيه طوارئ: خطر انهيار حسي وشيك',
    modalSubtitle: 'تم تجاوز معايير التحميل الحسي على جهاز المريض',
    modalPatientLabel: 'المريض:',
    modalVitalsLabel: 'القياسات عند الإشعار:',
    modalRiskLabel: 'مؤشر الخطر المحسوب:',
    modalInterventionLabel: 'حالة التدخل:',
    modalInterventionVal: 'تم تفعيل الضوضاء البيضاء المهدئة',
    modalLocationLabel: 'الموقع:',
    modalTip: '💡 <strong>الإجراء المطلوب:</strong> توجيه المريض إلى غرفة حسية هادئة والتحدث بنبرة صوت منخفضة وجمل قصيرة.',
    modalDismiss: 'تم الاطلاع والإقرار',
    modalCallAide: '📞 استدعاء المشرف / المساعد بالمدرسة',
    modalAideDispatched: '✓ تم إشعار المساعد (في الطريق)',
    
    // Logs messages
    logConnected: 'تم الاتصال بخادم درع الحواس بنجاح.',
    logDisconnected: 'انقطع الاتصال بالخادم. جارٍ إعادة المحاولة...',
    logWhiteNoiseTriggered: '🚨 تم تشغيل الضوضاء البيضاء تلقائياً! (السبب: تجاوز عتبة الانهيار الحسي)',
    logEmergencyAlert: 'تنبيه طوارئ لولي الأمر: نوبة تحسس وشيكة في',
    logStreamStarted: 'تم تفعيل البث التلقائي كل ثانيتين.',
    logStreamPaused: 'تم إيقاف البث التلقائي مؤقتاً.',
    logManualEmit: 'تم إرسال قياس يدوي:',
    logPresetApplied: 'تم تطبيق السيناريو:',
    logManualAudioStart: 'تم تشغيل الصوت المهدئ يدوياً.',
    logManualAudioStop: 'تم إيقاف الصوت المهدئ.',
    logAideDispatched: 'قام ولي الأمر باستدعاء المساعد المدرسي إلى موقع المريض.'
  },

  en: {
    appTitle: 'SensoryShield™ AI',
    appSubtitle: 'Autism & SPD Meltdown Prevention Simulator',
    tabSplit: '◫ Split Dual-View',
    tabPatient: '⌚ Patient Wearable',
    tabGuardian: '🛡️ Guardian Dashboard',
    connConnecting: 'Connecting...',
    connConnected: 'Live Connected',
    connDisconnected: 'Disconnected',
    bannerTitle: 'CRITICAL: Sensory Overload Meltdown Detected!',
    bannerDesc: 'Heart Rate and Ambient Noise thresholds exceeded. Automated White Noise active.',
    bannerDismiss: 'Acknowledge',
    
    // Patient Panel
    patientTitle: 'Patient Wearable Simulator',
    riskNormal: 'NORMAL RISK',
    riskElevated: 'ELEVATED SENSORY',
    riskDanger: 'MELTDOWN RISK',
    heartLabel: '❤️ Heart Rate (Biometrics)',
    heartUnit: 'BPM',
    heartMin: '60 BPM (Resting)',
    heartThreshold: '⚠️ Threshold: > 110 BPM',
    heartMax: '160 BPM (Max)',
    noiseLabel: '🔊 Ambient Noise Level (Environment)',
    noiseUnit: 'dB',
    noiseMin: '30 dB (Quiet Library)',
    noiseThreshold: '⚠️ Threshold: > 80 dB',
    noiseMax: '120 dB (Siren/Rock)',
    
    // Presets
    presetsLabel: '⚡ One-Click Simulation Presets',
    presetCalmTitle: '🌿 Calm Study Room',
    presetCalmSub: '72 bpm · 42 dB (Normal)',
    presetClassroomTitle: '📚 Active Cafeteria',
    presetClassroomSub: '96 bpm · 74 dB (Elevated)',
    presetMeltdownTitle: '🚨 Meltdown Trigger',
    presetMeltdownSub: '128 bpm · 88 dB (Danger)',
    presetExerciseTitle: '🏃 Quiet Exercise',
    presetExerciseSub: '135 bpm · 42 dB (Safe)',
    
    // Auto Emit
    autoEmitLabel: '📡 Auto-Emit Telemetry (every 2s):',
    sendNowBtn: 'Send Now ➔',
    
    // Audio Intervention
    audioTitle: 'Calming Audio Intervention',
    audioIdle: 'IDLE (STANDBY)',
    audioActive: 'SOOTHING AUDIO ACTIVE',
    audioMsgDefault: 'Automated soothing pink/white noise triggers automatically when meltdown condition occurs (HR > 110 & Noise > 80).',
    audioMsgPlaying: 'Meltdown threshold detected. Relaxing white noise is playing to prevent sensory overload.',
    playAudioBtn: '▶ Play Noise',
    stopAudioBtn: '⏹ Stop',
    
    // Guardian Dashboard
    guardianTitle: 'Guardian Real-Time Safety Monitor',
    patientHeartRateLabel: 'PATIENT HEART RATE',
    ambientNoiseLabel: 'AMBIENT NOISE',
    sensoryRiskLabel: 'SENSORY OVERLOAD RISK SCORE',
    statusConditionLabel: 'STATUS CONDITION',
    conditionSafe: '🌿 Safe & Regulated',
    conditionElevated: '⚠️ Elevated Sensory Load',
    conditionDanger: '🚨 Sensory Meltdown Imminent',
    locationHeader: 'Patient Live Location & Environment',
    locationText: '<strong>Greenwood Academy</strong> — Classroom 204 (East Wing)',
    addressText: '742 Evergreen Terrace, Springfield, OR',
    coordsText: 'GPS: 44.0462° N, 123.0220° W',
    logHeader: 'Live Telemetry & Alert Feed',
    clearLogs: 'Clear',
    logInitial: 'Guardian safety monitor initialized. Listening for patient telemetry...',
    
    // Modal
    modalTitle: '🚨 EMERGENCY ALERT: Meltdown Imminent',
    modalSubtitle: 'Sensory overload criteria triggered on patient device',
    modalPatientLabel: 'Patient:',
    modalVitalsLabel: 'Vitals at Trigger:',
    modalRiskLabel: 'Computed Risk Score:',
    modalInterventionLabel: 'Intervention Status:',
    modalInterventionVal: 'White Noise Activated',
    modalLocationLabel: 'Location:',
    modalTip: '💡 <strong>Action Required:</strong> Guide patient to a quiet low-sensory environment and speak in calm, short sentences.',
    modalDismiss: 'Acknowledge',
    modalCallAide: '📞 Contact School Aide',
    modalAideDispatched: '✓ Aide Notified (Dispatched)',
    
    // Logs messages
    logConnected: 'Connected to SensoryShield backend server.',
    logDisconnected: 'Lost connection to server. Retrying...',
    logWhiteNoiseTriggered: '🚨 White noise triggered automatically! (Reason: Meltdown threshold exceeded)',
    logEmergencyAlert: 'EMERGENCY GUARDIAN ALERT: Meltdown imminent at',
    logStreamStarted: 'Started 2-second automatic telemetry stream.',
    logStreamPaused: 'Paused automatic telemetry stream.',
    logManualEmit: 'Emitted manual telemetry:',
    logPresetApplied: 'Applied preset:',
    logManualAudioStart: 'Manual white noise playback started.',
    logManualAudioStop: 'White noise stopped.',
    logAideDispatched: 'Guardian dispatched School Aide to sensory location.'
  }
};

let currentLang = localStorage.getItem('sensory_lang') || 'ar'; // Default to Arabic for user convenience!

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('sensory_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = translations[lang];

  // Update elements by data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.tagName === 'INPUT' && el.type === 'button') {
        el.value = t[key];
      } else {
        el.innerHTML = t[key];
      }
    }
  });

  // Update lang switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Trigger language change event for dynamic components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, t } }));
}

function t(key) {
  return translations[currentLang][key] || key;
}

window.i18n = {
  t,
  setLanguage,
  getLang: () => currentLang,
  translations
};
