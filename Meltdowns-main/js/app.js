/**
 * ============================================================================
 * SensoryShield AI - Frontend Application & Real-Time Simulator Controller
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Element References
  const connectionStatusBadge = document.getElementById('connectionStatusBadge');
  const connectionStatusText = document.getElementById('connectionStatusText');

  // Language Switcher Buttons
  const langArBtn = document.getElementById('langArBtn');
  const langEnBtn = document.getElementById('langEnBtn');

  // Sliders & Values
  const heartRateSlider = document.getElementById('heartRateSlider');
  const noiseLevelSlider = document.getElementById('noiseLevelSlider');
  const heartRateValDisplay = document.getElementById('heartRateValDisplay');
  const noiseLevelValDisplay = document.getElementById('noiseLevelValDisplay');

  // Risk Badges & Statuses
  const simulatorRiskBadge = document.getElementById('simulatorRiskBadge');
  const simulatorRiskText = document.getElementById('simulatorRiskText');
  const guardianRiskBadge = document.getElementById('guardianRiskBadge');
  const guardianRiskText = document.getElementById('guardianRiskText');
  const guardianRiskScoreDisplay = document.getElementById('guardianRiskScoreDisplay');
  const guardianRiskProgress = document.getElementById('guardianRiskProgress');
  const guardianConditionLabel = document.getElementById('guardianConditionLabel');

  // Guardian Vitals
  const guardianHeartRateVal = document.getElementById('guardianHeartRateVal');
  const guardianNoiseVal = document.getElementById('guardianNoiseVal');
  const guardianLocationText = document.getElementById('guardianLocationText');
  const guardianAddressText = document.getElementById('guardianAddressText');
  const guardianCoordsText = document.getElementById('guardianCoordsText');

  // Stream & Presets
  const autoEmitToggle = document.getElementById('autoEmitToggle');
  const sendOnceBtn = document.getElementById('sendOnceBtn');
  const presetCalm = document.getElementById('presetCalm');
  const presetClassroom = document.getElementById('presetClassroom');
  const presetMeltdown = document.getElementById('presetMeltdown');
  const presetQuietExercise = document.getElementById('presetQuietExercise');

  // Calming Audio Elements
  const audioInterventionCard = document.getElementById('audioInterventionCard');
  const audioStatusPill = document.getElementById('audioStatusPill');
  const audioMsgText = document.getElementById('audioMsgText');
  const manualPlaySoundBtn = document.getElementById('manualPlaySoundBtn');
  const manualStopSoundBtn = document.getElementById('manualStopSoundBtn');
  const soundVolumeSlider = document.getElementById('soundVolumeSlider');

  // Alert Banner & Modal
  const meltdownAlertBanner = document.getElementById('meltdownAlertBanner');
  const dismissBannerBtn = document.getElementById('dismissBannerBtn');
  const emergencyAlertModal = document.getElementById('emergencyAlertModal');
  const modalDismissBtn = document.getElementById('modalDismissBtn');
  const modalCallAideBtn = document.getElementById('modalCallAideBtn');
  const modalPatientName = document.getElementById('modalPatientName');
  const modalVitalsText = document.getElementById('modalVitalsText');
  const modalRiskScoreText = document.getElementById('modalRiskScoreText');
  const modalInterventionText = document.getElementById('modalInterventionText');
  const modalLocationText = document.getElementById('modalLocationText');

  // Telemetry Log Feed
  const telemetryLogList = document.getElementById('telemetryLogList');
  const clearLogsBtn = document.getElementById('clearLogsBtn');

  // View Tabs
  const tabSplit = document.getElementById('tabSplit');
  const tabPatient = document.getElementById('tabPatient');
  const tabGuardian = document.getElementById('tabGuardian');
  const mainDashboardGrid = document.getElementById('mainDashboardGrid');
  const patientPanel = document.getElementById('patientPanel');
  const guardianPanel = document.getElementById('guardianPanel');

  // Current State
  let lastTelemetry = null;

  // Initialize Language
  const initialLang = localStorage.getItem('sensory_lang') || 'ar';
  window.i18n.setLanguage(initialLang);

  // Language Switcher Handlers
  langArBtn?.addEventListener('click', () => {
    window.i18n.setLanguage('ar');
    refreshDynamicTexts();
  });

  langEnBtn?.addEventListener('click', () => {
    window.i18n.setLanguage('en');
    refreshDynamicTexts();
  });

  window.addEventListener('languageChanged', () => {
    refreshDynamicTexts();
  });

  function refreshDynamicTexts() {
    predictClientRisk();
    if (lastTelemetry) {
      updateTelemetryUI(lastTelemetry);
    }
  }

  // ==========================================================================
  // Socket.io Connection & Hybrid Standalone Simulator Architecture
  // ==========================================================================
  let socket = null;
  let autoEmitInterval = null;
  let isStandalone = false;

  function switchToStandaloneMode() {
    if (isStandalone) return;
    isStandalone = true;
    updateConnectionUI(true, window.i18n.t('connStandalone') || 'وضع المحاكاة المباشر (نشط)');
    appendLog(window.i18n.t('connStandalone') || 'وضع المحاكاة المباشر (نشط)', 'info');
    startAutoEmit();
  }

  try {
    if (typeof io !== 'undefined') {
      socket = io({
        timeout: 3000,
        reconnectionAttempts: 2
      });
    } else {
      switchToStandaloneMode();
    }
  } catch (err) {
    console.warn('Socket.io not found, running in standalone simulator mode:', err);
    switchToStandaloneMode();
  }

  // Graceful fallback to standalone simulator if no server responds within 2 seconds
  setTimeout(() => {
    if (!socket || !socket.connected) {
      switchToStandaloneMode();
    }
  }, 2000);

  if (socket) {
    socket.on('connect', () => {
      isStandalone = false;
      console.log('Connected to server with Socket ID:', socket.id);
      updateConnectionUI(true, window.i18n.t('connConnected'));
      
      // Register client role (both patient simulator and guardian monitoring capabilities)
      socket.emit('register_role', {
        role: 'guardian',
        patientName: 'Alex (Wearable User)'
      });

      appendLog(window.i18n.t('logConnected'), 'info');
      startAutoEmit();
    });

    socket.on('connect_error', () => {
      switchToStandaloneMode();
    });

    socket.on('disconnect', () => {
      switchToStandaloneMode();
    });

    /**
     * Listener: trigger_white_noise
     * Triggered by server when Heart Rate > 110 AND Noise Level > 80 (Risk > 85%)
     */
    socket.on('trigger_white_noise', (payload) => {
      console.log('⚡ [INTERVENTION EVENT] trigger_white_noise received:', payload);
      
      // Activate Calming Pink/White Noise via Web Audio API & HTML5 Audio
      window.calmingAudioEngine.play({
        volume: parseFloat(soundVolumeSlider.value) || 0.75,
        fadeDurationMs: payload.fadeDurationMs || 1500
      });

      // Update Audio Card Visuals
      audioInterventionCard.classList.add('playing');
      audioStatusPill.textContent = window.i18n.t('audioActive');
      audioStatusPill.classList.add('active');
      audioMsgText.textContent = window.i18n.t('audioMsgPlaying');

      // Display Alert Banner
      meltdownAlertBanner.classList.add('active');

      appendLog(window.i18n.t('logWhiteNoiseTriggered'), 'alert-log');
    });

    /**
     * Listener: emergency_alert (Emitted to guardian role)
     */
    socket.on('emergency_alert', (alert) => {
      console.log('🚨 [GUARDIAN ALERT] emergency_alert received:', alert);

      // Populate Modal details
      const isArabic = window.i18n.getLang() === 'ar';
      modalPatientName.textContent = isArabic ? 'أليكس (مستخدم الجهاز)' : (alert.patientName || 'Alex');
      
      const hrUnit = isArabic ? 'نبضة/د' : 'BPM';
      const noiseUnit = isArabic ? 'ديسيبل ضوضاء' : 'dB Noise';
      modalVitalsText.textContent = `${alert.vitalSigns.heartRate} ${hrUnit} | ${alert.vitalSigns.noiseLevel} ${noiseUnit}`;
      
      const riskStatusStr = isArabic ? '(خطر حرج)' : `(${alert.riskLevel})`;
      modalRiskScoreText.textContent = `${alert.riskScore}% ${riskStatusStr}`;
      modalInterventionText.textContent = window.i18n.t('modalInterventionVal');
      
      const locationFacility = isArabic ? 'أكاديمية غرين وود (القاعة 204)' : `${alert.location.facilityName} (${alert.location.room})`;
      modalLocationText.textContent = locationFacility;

      // Open Modal
      emergencyAlertModal.classList.add('active');

      // Add log
      const room = isArabic ? 'القاعة 204' : alert.location.room;
      appendLog(`${window.i18n.t('logEmergencyAlert')} ${room} (${window.i18n.t('sensoryRiskLabel')}: ${alert.riskScore}%)`, 'alert-log');
    });

    /**
     * Listener: telemetry_update (Continuous live stream)
     */
    socket.on('telemetry_update', (telemetry) => {
      lastTelemetry = telemetry;
      updateTelemetryUI(telemetry);
    });

    /**
     * Listener: Initial guardian state snapshot
     */
    socket.on('guardian_init_state', (initState) => {
      if (initState.latestTelemetry) {
        lastTelemetry = initState.latestTelemetry;
        updateTelemetryUI(initState.latestTelemetry);
      }
      if (initState.location) {
        updateLocationUI(initState.location);
      }
    });

    /**
     * Listener: remote stop command
     */
    socket.on('stop_white_noise_command', () => {
      window.calmingAudioEngine.stop();
    });
  }

  // Hook Audio Engine state change
  window.calmingAudioEngine.onStateChange = (isPlaying) => {
    if (isPlaying) {
      audioInterventionCard.classList.add('playing');
      audioStatusPill.textContent = window.i18n.t('audioActive');
      audioStatusPill.classList.add('active');
      manualPlaySoundBtn.disabled = true;
      manualStopSoundBtn.disabled = false;
    } else {
      audioInterventionCard.classList.remove('playing');
      audioStatusPill.textContent = window.i18n.t('audioIdle');
      audioStatusPill.classList.remove('active');
      manualPlaySoundBtn.disabled = false;
      manualStopSoundBtn.disabled = true;
    }
  };

  // ==========================================================================
  // Slider Controls & Real-Time Sync
  // ==========================================================================
  heartRateSlider.addEventListener('input', (e) => {
    const hr = e.target.value;
    const unit = window.i18n.getLang() === 'ar' ? 'نبضة/د' : 'BPM';
    heartRateValDisplay.textContent = `${hr} ${unit}`;
    predictClientRisk();
    emitCurrentTelemetry();
  });

  noiseLevelSlider.addEventListener('input', (e) => {
    const noise = e.target.value;
    const unit = window.i18n.getLang() === 'ar' ? 'ديسيبل' : 'dB';
    noiseLevelValDisplay.textContent = `${noise} ${unit}`;
    predictClientRisk();
    emitCurrentTelemetry();
  });

  function predictClientRisk() {
    const hr = parseInt(heartRateSlider.value, 10);
    const noise = parseInt(noiseLevelSlider.value, 10);

    const hrUnit = window.i18n.getLang() === 'ar' ? 'نبضة/د' : 'BPM';
    const noiseUnit = window.i18n.getLang() === 'ar' ? 'ديسيبل' : 'dB';
    heartRateValDisplay.textContent = `${hr} ${hrUnit}`;
    noiseLevelValDisplay.textContent = `${noise} ${noiseUnit}`;

    // Visual helper on the simulator side
    if (hr > 110 && noise > 80) {
      simulatorRiskBadge.className = 'badge badge-danger';
      simulatorRiskText.textContent = window.i18n.t('riskDanger');
    } else if (hr > 100 || noise > 75) {
      simulatorRiskBadge.className = 'badge badge-elevated';
      simulatorRiskText.textContent = window.i18n.t('riskElevated');
    } else {
      simulatorRiskBadge.className = 'badge badge-normal';
      simulatorRiskText.textContent = window.i18n.t('riskNormal');
    }
  }

  // ==========================================================================
  // Sensory Risk Evaluation Algorithm (Offline / Standalone Engine)
  // ==========================================================================
  function evaluateSensoryRiskLocal(heartRate, noiseLevel) {
    const hr = Number(heartRate) || 70;
    const noise = Number(noiseLevel) || 40;
    const isMeltdownTrigger = hr > 110 && noise > 80;

    let riskScore = 0;
    if (isMeltdownTrigger) {
      const hrFactor = Math.min(1, (hr - 110) / 50);
      const noiseFactor = Math.min(1, (noise - 80) / 40);
      const bonus = Math.round((hrFactor * 0.6 + noiseFactor * 0.4) * 13);
      riskScore = Math.min(99, 86 + bonus);
    } else {
      const hrRatio = Math.max(0, Math.min(1, (hr - 60) / 100));
      const noiseRatio = Math.max(0, Math.min(1, (noise - 30) / 90));
      const rawScore = Math.round((hrRatio * 0.55 + noiseRatio * 0.45) * 100);
      riskScore = Math.min(84, Math.max(5, rawScore));
    }

    let riskLevel = 'NORMAL';
    if (riskScore >= 85) {
      riskLevel = 'DANGER';
    } else if (riskScore >= 60) {
      riskLevel = 'ELEVATED';
    }

    return {
      heartRate: hr,
      noiseLevel: noise,
      riskScore,
      riskLevel,
      isMeltdownTrigger,
      timestamp: new Date().toISOString()
    };
  }

  function processLocalTelemetry(heartRate, noiseLevel) {
    const evaluation = evaluateSensoryRiskLocal(heartRate, noiseLevel);
    const telemetryPacket = {
      ...evaluation,
      patientName: 'Alex (Wearable User)',
      location: {
        facilityName: 'Greenwood Inclusive Academy',
        room: 'Classroom 204 - East Wing',
        address: '742 Evergreen Terrace, Springfield, OR',
        coordinates: {
          latitude: 44.0462,
          longitude: -123.0220
        }
      }
    };

    lastTelemetry = telemetryPacket;
    updateTelemetryUI(telemetryPacket);

    if (evaluation.isMeltdownTrigger) {
      window.calmingAudioEngine.play({
        volume: parseFloat(soundVolumeSlider.value) || 0.75,
        fadeDurationMs: 1500
      });

      audioInterventionCard.classList.add('playing');
      audioStatusPill.textContent = window.i18n.t('audioActive');
      audioStatusPill.classList.add('active');
      audioMsgText.textContent = window.i18n.t('audioMsgPlaying');
      meltdownAlertBanner.classList.add('active');

      const isArabic = window.i18n.getLang() === 'ar';
      modalPatientName.textContent = isArabic ? 'أليكس (مستخدم الجهاز)' : 'Alex (Wearable User)';
      const hrUnit = isArabic ? 'نبضة/د' : 'BPM';
      const noiseUnit = isArabic ? 'ديسيبل ضوضاء' : 'dB Noise';
      modalVitalsText.textContent = `${evaluation.heartRate} ${hrUnit} | ${evaluation.noiseLevel} ${noiseUnit}`;
      const riskStatusStr = isArabic ? '(خطر حرج)' : `(${evaluation.riskLevel})`;
      modalRiskScoreText.textContent = `${evaluation.riskScore}% ${riskStatusStr}`;
      modalInterventionText.textContent = window.i18n.t('modalInterventionVal');
      modalLocationText.textContent = isArabic ? 'أكاديمية غرين وود (القاعة 204)' : 'Greenwood Academy (Room 204)';

      emergencyAlertModal.classList.add('active');
      appendLog(`${window.i18n.t('logEmergencyAlert')} (${window.i18n.t('sensoryRiskLabel')}: ${evaluation.riskScore}%)`, 'alert-log');
    }
  }

  // ==========================================================================
  // Telemetry Emission Functions (Connected & Standalone Hybrid)
  // ==========================================================================
  function emitCurrentTelemetry() {
    const heartRate = parseInt(heartRateSlider.value, 10);
    const noiseLevel = parseInt(noiseLevelSlider.value, 10);

    const payload = {
      heartRate,
      noiseLevel,
      patientName: 'Alex (Wearable User)',
      timestamp: new Date().toISOString()
    };

    if (socket && socket.connected) {
      socket.emit('sensor_data', payload);
    } else {
      processLocalTelemetry(heartRate, noiseLevel);
    }
  }

  function startAutoEmit() {
    if (autoEmitInterval) clearInterval(autoEmitInterval);
    if (autoEmitToggle.checked) {
      emitCurrentTelemetry(); // emit immediately
      autoEmitInterval = setInterval(emitCurrentTelemetry, 2000);
      console.log('[Telemetry Stream] Auto-emit active (2000ms)');
    }
  }

  function stopAutoEmit() {
    if (autoEmitInterval) {
      clearInterval(autoEmitInterval);
      autoEmitInterval = null;
      console.log('[Telemetry Stream] Auto-emit paused');
    }
  }

  autoEmitToggle.addEventListener('change', () => {
    if (autoEmitToggle.checked) {
      startAutoEmit();
      appendLog(window.i18n.t('logStreamStarted'), 'info');
    } else {
      stopAutoEmit();
      appendLog(window.i18n.t('logStreamPaused'), 'info');
    }
  });

  sendOnceBtn.addEventListener('click', () => {
    emitCurrentTelemetry();
    appendLog(`${window.i18n.t('logManualEmit')} ${heartRateSlider.value} BPM, ${noiseLevelSlider.value} dB.`, 'info');
  });

  // ==========================================================================
  // Presets
  // ==========================================================================
  function applyPreset(hr, noise, name) {
    heartRateSlider.value = hr;
    noiseLevelSlider.value = noise;
    predictClientRisk();
    emitCurrentTelemetry();
    appendLog(`${window.i18n.t('logPresetApplied')} "${name}" (${hr} BPM, ${noise} dB).`, 'info');
  }

  presetCalm.addEventListener('click', () => applyPreset(72, 42, window.i18n.t('presetCalmTitle')));
  presetClassroom.addEventListener('click', () => applyPreset(96, 74, window.i18n.t('presetClassroomTitle')));
  presetMeltdown.addEventListener('click', () => applyPreset(128, 88, window.i18n.t('presetMeltdownTitle')));
  presetQuietExercise.addEventListener('click', () => applyPreset(135, 42, window.i18n.t('presetExerciseTitle')));

  // ==========================================================================
  // Audio Controls & Volume
  // ==========================================================================
  manualPlaySoundBtn.addEventListener('click', () => {
    window.calmingAudioEngine.play({
      volume: parseFloat(soundVolumeSlider.value) || 0.75
    });
    appendLog(window.i18n.t('logManualAudioStart'), 'info');
  });

  manualStopSoundBtn.addEventListener('click', () => {
    window.calmingAudioEngine.stop();
    meltdownAlertBanner.classList.remove('active');
    appendLog(window.i18n.t('logManualAudioStop'), 'info');
  });

  soundVolumeSlider.addEventListener('input', (e) => {
    window.calmingAudioEngine.setVolume(parseFloat(e.target.value));
  });

  // ==========================================================================
  // Alert Dismissals & Modals
  // ==========================================================================
  dismissBannerBtn.addEventListener('click', () => {
    meltdownAlertBanner.classList.remove('active');
  });

  modalDismissBtn.addEventListener('click', () => {
    emergencyAlertModal.classList.remove('active');
  });

  modalCallAideBtn.addEventListener('click', () => {
    modalCallAideBtn.textContent = window.i18n.t('modalAideDispatched');
    modalCallAideBtn.style.background = '#10b981';
    setTimeout(() => {
      emergencyAlertModal.classList.remove('active');
      modalCallAideBtn.textContent = window.i18n.t('modalCallAide');
      modalCallAideBtn.style.background = '#ef4444';
    }, 1800);
    appendLog(window.i18n.t('logAideDispatched'), 'info');
  });

  // ==========================================================================
  // UI Updating Functions
  // ==========================================================================
  function updateConnectionUI(connected, text) {
    if (connected) {
      connectionStatusBadge.className = 'connection-pill';
      connectionStatusText.textContent = text;
    } else {
      connectionStatusBadge.className = 'connection-pill disconnected';
      connectionStatusText.textContent = text;
    }
  }

  function updateTelemetryUI(telemetry) {
    const { heartRate, noiseLevel, riskScore, riskLevel } = telemetry;

    // Update Guardian Vitals Numbers
    guardianHeartRateVal.textContent = heartRate;
    guardianNoiseVal.textContent = noiseLevel;
    guardianRiskScoreDisplay.textContent = `${riskScore}%`;
    guardianRiskProgress.style.width = `${Math.min(100, Math.max(5, riskScore))}%`;

    // Update Guardian Badges & Labels
    if (riskLevel === 'DANGER' || riskScore >= 85) {
      guardianRiskBadge.className = 'badge badge-danger';
      guardianRiskText.textContent = window.i18n.t('riskDanger');
      guardianConditionLabel.textContent = window.i18n.t('conditionDanger');
      guardianConditionLabel.style.color = '#ef4444';
      simulatorRiskBadge.className = 'badge badge-danger';
      simulatorRiskText.textContent = window.i18n.t('riskDanger');
    } else if (riskLevel === 'ELEVATED' || riskScore >= 60) {
      guardianRiskBadge.className = 'badge badge-elevated';
      guardianRiskText.textContent = window.i18n.t('riskElevated');
      guardianConditionLabel.textContent = window.i18n.t('conditionElevated');
      guardianConditionLabel.style.color = '#f59e0b';
      simulatorRiskBadge.className = 'badge badge-elevated';
      simulatorRiskText.textContent = window.i18n.t('riskElevated');
    } else {
      guardianRiskBadge.className = 'badge badge-normal';
      guardianRiskText.textContent = window.i18n.t('riskNormal');
      guardianConditionLabel.textContent = window.i18n.t('conditionSafe');
      guardianConditionLabel.style.color = '#10b981';
      simulatorRiskBadge.className = 'badge badge-normal';
      simulatorRiskText.textContent = window.i18n.t('riskNormal');
    }

    if (telemetry.location) {
      updateLocationUI(telemetry.location);
    }
  }

  function updateLocationUI(location) {
    const isArabic = window.i18n.getLang() === 'ar';
    if (isArabic) {
      guardianLocationText.innerHTML = window.i18n.t('locationText');
      guardianAddressText.textContent = window.i18n.t('addressText');
      if (location.coordinates) {
        guardianCoordsText.textContent = `إحداثيات GPS: ${location.coordinates.latitude.toFixed(4)}° شمالاً، ${Math.abs(location.coordinates.longitude).toFixed(4)}° غرباً`;
      }
    } else {
      guardianLocationText.innerHTML = `<strong>${location.facilityName}</strong> — ${location.room}`;
      guardianAddressText.textContent = location.address;
      if (location.coordinates) {
        guardianCoordsText.textContent = `GPS: ${location.coordinates.latitude.toFixed(4)}° N, ${Math.abs(location.coordinates.longitude).toFixed(4)}° W`;
      }
    }
  }

  function appendLog(message, type = 'normal') {
    const item = document.createElement('div');
    item.className = `log-item ${type === 'alert-log' ? 'alert-log' : ''}`;
    
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    item.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-msg">${message}</span>
    `;

    telemetryLogList.prepend(item);

    // Keep log max size 40 items
    while (telemetryLogList.children.length > 40) {
      telemetryLogList.removeChild(telemetryLogList.lastChild);
    }
  }

  clearLogsBtn.addEventListener('click', () => {
    telemetryLogList.innerHTML = `
      <div class="log-item">
        <span class="log-time">${new Date().toTimeString().split(' ')[0]}</span>
        <span class="log-msg">${window.i18n.t('clearLogs')}</span>
      </div>
    `;
  });

  // ==========================================================================
  // Tab Switching (Split vs Patient vs Guardian)
  // ==========================================================================
  const tabs = [tabSplit, tabPatient, tabGuardian];

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const view = tab.dataset.view;
      if (view === 'split') {
        mainDashboardGrid.className = 'dashboard-grid';
        patientPanel.style.display = 'block';
        guardianPanel.style.display = 'block';
      } else if (view === 'patient') {
        mainDashboardGrid.className = 'dashboard-grid single-patient';
        patientPanel.style.display = 'block';
        guardianPanel.style.display = 'none';
      } else if (view === 'guardian') {
        mainDashboardGrid.className = 'dashboard-grid single-guardian';
        patientPanel.style.display = 'none';
        guardianPanel.style.display = 'block';
      }
    });
  });

  // Run initial client prediction and telemetry update
  predictClientRisk();
  emitCurrentTelemetry();
});
