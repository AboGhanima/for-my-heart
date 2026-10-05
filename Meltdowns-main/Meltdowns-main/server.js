/**
 * ============================================================================
 * Smart Healthcare & Sensory Overload Prevention App - Backend Server
 * ============================================================================
 * Proof of Concept (PoC) & Real-Time Telemetry Simulator for Autism & SPD.
 * 
 * Tech Stack:
 * - Node.js (ES Modules)
 * - Express.js
 * - Socket.io (WebSockets)
 * - CORS
 * ============================================================================
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App & HTTP Server
const app = express();
const server = http.createServer(app);

// Configure Socket.io with permissive CORS for simulator & mobile clients
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Socket Room Constants
const ROOMS = {
  PATIENTS: 'patient-app',
  GUARDIANS: 'guardian-app'
};

// In-memory telemetry cache & active alert registry
const state = {
  activePatients: new Map(),
  connectedGuardians: new Set(),
  recentAlerts: [],
  latestTelemetry: {
    heartRate: 72,
    noiseLevel: 45,
    riskScore: 15,
    riskLevel: 'NORMAL',
    timestamp: new Date().toISOString()
  }
};

// Simulated contextual location data for the patient
const DUMMY_LOCATION = {
  facilityName: 'Greenwood Inclusive Academy',
  room: 'Classroom 204 - East Wing',
  address: '742 Evergreen Terrace, Springfield, OR',
  coordinates: {
    latitude: 44.0462,
    longitude: -123.0220
  },
  sensorZone: 'Acoustic Fluctuation Zone (Auditorium Corridor)'
};

/**
 * Evaluates real-time biometric and environmental telemetry to compute sensory risk.
 * 
 * Meltdown Trigger Criteria:
 * - If heartRate > 110 BPM AND noiseLevel > 80 dB -> riskScore > 85% (DANGER)
 * - Otherwise computes proportional sensory load score (0 - 84%).
 * 
 * @param {number} heartRate - Patient Heart Rate in Beats Per Minute (BPM)
 * @param {number} noiseLevel - Ambient Noise Level in Decibels (dB)
 * @returns {Object} Comprehensive sensory risk evaluation
 */
export function evaluateSensoryRisk(heartRate, noiseLevel) {
  const hr = Number(heartRate) || 70;
  const noise = Number(noiseLevel) || 40;

  const isMeltdownTrigger = hr > 110 && noise > 80;

  let riskScore = 0;

  if (isMeltdownTrigger) {
    // Scaled smoothly between 86% and 99% for critical conditions
    const hrFactor = Math.min(1, (hr - 110) / 50);     // 110 -> 160+ bpm
    const noiseFactor = Math.min(1, (noise - 80) / 40); // 80 -> 120+ dB
    const bonus = Math.round((hrFactor * 0.6 + noiseFactor * 0.4) * 13);
    riskScore = Math.min(99, 86 + bonus);
  } else {
    // Proportional weighted calculation for non-meltdown states (0 - 84%)
    const hrRatio = Math.max(0, Math.min(1, (hr - 60) / 100)); // 60-160
    const noiseRatio = Math.max(0, Math.min(1, (noise - 30) / 90)); // 30-120
    const rawScore = Math.round((hrRatio * 0.55 + noiseRatio * 0.45) * 100);
    // Cap strictly below 85% when dual threshold is not met
    riskScore = Math.min(84, Math.max(5, rawScore));
  }

  // Categorize risk severity
  let riskLevel = 'NORMAL';
  if (riskScore >= 85) {
    riskLevel = 'DANGER'; // Meltdown Imminent / Critical Alert
  } else if (riskScore >= 60) {
    riskLevel = 'ELEVATED'; // Moderate Sensory Load / Warning
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

// ============================================================================
// Real-Time Socket.io Connection & Event Handling
// ============================================================================
io.on('connection', (socket) => {
  console.log(`[Socket.io] New client connected: ${socket.id}`);

  /**
   * Role Registration Handler
   * Allows clients to explicitly declare their role ('patient' / 'simulator' OR 'guardian')
   */
  socket.on('register_role', (data = {}) => {
    const role = (data.role || 'simulator').toLowerCase();

    if (role === 'guardian' || role === 'guardian-app') {
      socket.join(ROOMS.GUARDIANS);
      state.connectedGuardians.add(socket.id);
      console.log(`[Socket.io] Client ${socket.id} joined GUARDIAN room.`);

      // Send initial snapshot to guardian
      socket.emit('guardian_init_state', {
        latestTelemetry: state.latestTelemetry,
        location: DUMMY_LOCATION,
        recentAlerts: state.recentAlerts.slice(-5),
        connectedGuardiansCount: state.connectedGuardians.size
      });
    } else {
      // Default to patient/simulator role
      socket.join(ROOMS.PATIENTS);
      state.activePatients.set(socket.id, {
        socketId: socket.id,
        registeredAt: new Date().toISOString(),
        patientName: data.patientName || 'Alex (Wearable User)'
      });
      console.log(`[Socket.io] Client ${socket.id} joined PATIENT/SIMULATOR room.`);
    }

    // Acknowledge registration
    socket.emit('registration_success', {
      socketId: socket.id,
      assignedRole: role,
      serverTime: new Date().toISOString()
    });
  });

  /**
   * Real-Time Telemetry / Sensor Data Receiver
   * Expected Payload: { heartRate: number, noiseLevel: number, timestamp?: string, patientName?: string }
   */
  socket.on('sensor_data', (payload = {}) => {
    const { heartRate, noiseLevel, timestamp, patientName } = payload;

    // Validate and process sensory data
    const evaluation = evaluateSensoryRisk(heartRate, noiseLevel);
    const telemetryPacket = {
      ...evaluation,
      patientName: patientName || 'Alex (Sensory Wearable)',
      clientTimestamp: timestamp || new Date().toISOString(),
      location: DUMMY_LOCATION
    };

    // Update server state cache
    state.latestTelemetry = telemetryPacket;

    // 1. Send live telemetry update to ALL connected clients (Patients & Guardians)
    io.emit('telemetry_update', telemetryPacket);

    // 2. Check for Meltdown Condition (Heart Rate > 110 AND Noise Level > 80 -> Risk > 85%)
    if (evaluation.isMeltdownTrigger) {
      console.warn(`\n🚨 [MELTDOWN ALERT DETECTED]`);
      console.warn(`   Heart Rate: ${evaluation.heartRate} BPM | Ambient Noise: ${evaluation.noiseLevel} dB`);
      console.warn(`   Sensory Risk Score: ${evaluation.riskScore}% (${evaluation.riskLevel})`);
      console.warn(`   Triggering White Noise & Broadcasting Emergency Alert...\n`);

      // A. Emit White Noise Intervention to Simulator/Patient
      const interventionPayload = {
        action: 'PLAY_WHITE_NOISE',
        soundType: 'PINK_WHITE_NOISE_SOOTHING',
        volume: 0.8,
        fadeDurationMs: 1500,
        message: 'Sensory overload threshold reached. Relaxing white noise activated.',
        timestamp: new Date().toISOString()
      };

      // Emit to patient room and directly back to sender socket
      io.to(ROOMS.PATIENTS).emit('trigger_white_noise', interventionPayload);
      socket.emit('trigger_white_noise', interventionPayload);

      // B. Create and Broadcast Emergency Alert to Guardian Clients
      const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const emergencyAlertPayload = {
        alertId,
        type: 'SENSORY_OVERLOAD_MELTDOWN',
        severity: 'CRITICAL',
        riskScore: evaluation.riskScore,
        riskLevel: evaluation.riskLevel,
        patientName: telemetryPacket.patientName,
        vitalSigns: {
          heartRate: evaluation.heartRate,
          noiseLevel: evaluation.noiseLevel
        },
        location: DUMMY_LOCATION,
        interventionStatus: 'Automated White Noise Active',
        recommendedAction: 'Approach calmly. Guide patient to quiet sensory room.',
        timestamp: new Date().toISOString()
      };

      // Cache alert in history
      state.recentAlerts.push(emergencyAlertPayload);
      if (state.recentAlerts.length > 20) state.recentAlerts.shift();

      // Emit alert to Guardians
      io.to(ROOMS.GUARDIANS).emit('emergency_alert', emergencyAlertPayload);
      // Also broadcast general alert event
      io.emit('meltdown_status', {
        isActive: true,
        riskScore: evaluation.riskScore,
        alert: emergencyAlertPayload
      });
    } else {
      // Normal or moderate condition broadcast
      io.emit('meltdown_status', {
        isActive: false,
        riskScore: evaluation.riskScore
      });
    }
  });

  /**
   * Manual Guardian Intervention (e.g., Guardian sends soothing prompt or marks safe)
   */
  socket.on('guardian_action', (data = {}) => {
    console.log(`[Guardian Action] Received action: ${data.action} from ${socket.id}`);
    io.to(ROOMS.PATIENTS).emit('remote_guardian_intervention', {
      action: data.action,
      note: data.note || 'Guardian acknowledges alert and is providing support.',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Stop White Noise / Reset Audio
   */
  socket.on('stop_white_noise', () => {
    io.to(ROOMS.PATIENTS).emit('stop_white_noise_command', {
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Handle Disconnections
   */
  socket.on('disconnect', () => {
    state.activePatients.delete(socket.id);
    state.connectedGuardians.delete(socket.id);
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ============================================================================
// REST API Endpoints (Health Check & Telemetry Status)
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    serverTime: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
    guardianClients: state.connectedGuardians.size
  });
});

/**
 * Telemetry snapshot endpoint
 */
app.get('/api/telemetry/latest', (req, res) => {
  res.json({
    latestTelemetry: state.latestTelemetry,
    location: DUMMY_LOCATION,
    recentAlerts: state.recentAlerts.slice(-10)
  });
});

/**
 * Manual trigger endpoint for testing integrations via cURL / Postman
 */
app.post('/api/telemetry/simulate', (req, res) => {
  const { heartRate = 120, noiseLevel = 85, patientName = 'Alex' } = req.body;
  const evaluation = evaluateSensoryRisk(heartRate, noiseLevel);

  const telemetryPacket = {
    ...evaluation,
    patientName,
    clientTimestamp: new Date().toISOString(),
    location: DUMMY_LOCATION
  };

  io.emit('telemetry_update', telemetryPacket);

  if (evaluation.isMeltdownTrigger) {
    io.to(ROOMS.PATIENTS).emit('trigger_white_noise', {
      action: 'PLAY_WHITE_NOISE',
      soundType: 'PINK_WHITE_NOISE_SOOTHING',
      volume: 0.8,
      timestamp: new Date().toISOString()
    });

    io.to(ROOMS.GUARDIANS).emit('emergency_alert', {
      alertId: `ALERT-REST-${Date.now()}`,
      type: 'SENSORY_OVERLOAD_MELTDOWN',
      severity: 'CRITICAL',
      riskScore: evaluation.riskScore,
      riskLevel: evaluation.riskLevel,
      patientName,
      vitalSigns: { heartRate: evaluation.heartRate, noiseLevel: evaluation.noiseLevel },
      location: DUMMY_LOCATION,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    telemetryPacket
  });
});

// ============================================================================
// Start Server
// ============================================================================
server.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🧠 Sensory Overload Prevention PoC Server running`);
  console.log(`🌐 Local Web Simulator: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Endpoint:  ws://localhost:${PORT}`);
  console.log(`📡 Health Check:        http://localhost:${PORT}/api/health`);
  console.log('================================================================');
});
