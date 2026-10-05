# 🧠 SensoryShield™ AI - درع الحواس الذكي للوقاية من نوبات الانهيار الحسي (PoC)

نظام ومحاكي متكامل للرعاية الصحية الذكية والوقاية من نوبات التحسس والانهيار الحسي (Sensory Meltdowns) مصمم خصيصاً للمصابين بـ **طيف التوحد (ASD)** و **اضطرابات المعالجة الحسية (SPD)**.

يقوم النظام بقراءة المؤشرات الحيوية الآنية (معدل نبضات القلب) والبيانات البيئية المحيطة (مستوى الضوضاء ديسيبل)، ثم يعالجها في خادم Node.js عبر بروتوكول WebSockets لحظياً للتنبؤ بنوبات التحسس قبل حدوثها، وعند اكتشاف الخطر يقوم تلقائياً بتشغيل **صوت مهدئ (ضوضاء وردية/بيضاء)** وإرسال **تنبيه طوارئ فوري مع بيانات الموقع** إلى لوحة تحكم أولياء الأمور والمشرفين.

---

## 🌐 مميزات النظام باللغة العربية (Arabic Features)
1. **دعم كامل للغة العربية (RTL)** مع إمكانية التبديل الفوري بين العربية والإنجليزية (AR / EN).
2. **محاكاة تفاعلية فورية**: أشرطة تمرير تفاعلية لنبضات القلب (60-160) والضوضاء (30-120).
3. **محرك كشف النوبات الحسي**: إذا تجاوز النبض `110 BPM` والضوضاء `80 dB`، يرتفع مؤشر الخطر إلى `> 85%` وتبدأ إجراءات التدخل الفوري.
4. **توليد صوت مهدئ بدون ملفات خارجية**: عبر Web Audio API يولد ذبذبات وردية مهدئة بتردد 432Hz لتهدئة الجهاز العصبي.
5. **لوحة تحكم ولي الأمر**: إشعارات طوارئ منبثقة، إحداثيات GPS، وزر استدعاء المساعد المدرسي.

---

## 🚀 Key Features (English)

1. **Real-Time WebSockets via Socket.io**:
   - Continuous bidirectional streaming of biometrics and ambient noise.
   - Dual-role communication supporting **Patient Wearables / Simulators** and **Guardian Dashboards**.
2. **Predictive Meltdown Detection Engine**:
   - **Trigger Condition**: When `heartRate > 110 BPM` **AND** `noiseLevel > 80 dB`, the risk engine calculates a critical `riskScore > 85%` (Severity: `DANGER`).
   - Smooth weighted scoring prevents false positives (e.g. high heart rate from physical exercise in quiet rooms, or high noise with a calm heart rate).
3. **Automated Calming White/Pink Noise Intervention**:
   - Receives `trigger_white_noise` event from the server.
   - Built-in Web Audio API Pink Noise Synthesizer with 432Hz grounding frequency and low-pass filter (100% offline reliability with zero broken audio links).
   - Standard HTML5 `<audio>` element bridge.
4. **Guardian Emergency Broadcast**:
   - Receives `emergency_alert` event with dummy location coordinates, room details, and vital signs snapshot.
   - Interactive pop-up alert modal and quick aide dispatch.
5. **Interactive UI Simulator**:
   - Sliders for Heart Rate (60 – 160 BPM) and Ambient Noise (30 – 120 dB).
   - Auto-emit toggle streaming telemetry every 2 seconds.
   - One-click presets (Calm Room, Active Cafeteria, Meltdown Trigger, Quiet Exercise).
   - Multi-view layout (Split Dual-View, Patient-only, Guardian-only).

---

## 🛠️ Tech Stack

- **Backend**: Node.js (ES Modules, `"type": "module"`), Express.js
- **Real-Time Communication**: Socket.io
- **Frontend / Simulator**: HTML5, Vanilla CSS (Glassmorphism Dark Theme), Web Audio API, Vanilla JavaScript

---

## 📦 Project Structure

```text
├── package.json              # ES Module configuration & dependencies
├── server.js                 # Express + Socket.io server with meltdown detection logic
├── public/                   # Static Frontend Simulator
│   ├── index.html            # Simulator & Guardian Dashboard Interface
│   ├── css/
│   │   └── style.css         # Modern glassmorphic dark design system
│   └── js/
│       ├── audio-synthesizer.js # Web Audio API calming noise generator
│       └── app.js            # Real-time WebSocket controller & UI logic
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
node server.js
```
*Or run in watch mode:*
```bash
npm run dev
```

### 3. Open the Simulator in your Browser
Navigate to:
```text
http://localhost:3000
```

---

## 🔌 WebSocket Events Reference

| Event Name | Direction | Payload Structure | Description |
| :--- | :--- | :--- | :--- |
| `register_role` | Client ➔ Server | `{ role: 'patient' \| 'guardian', patientName: string }` | Registers role and joins target room |
| `sensor_data` | Client ➔ Server | `{ heartRate: number, noiseLevel: number, timestamp: string }` | Live sensor packet from wearable |
| `telemetry_update`| Server ➔ All | `{ heartRate, noiseLevel, riskScore, riskLevel, location }` | Broadcasts processed risk metrics |
| `trigger_white_noise` | Server ➔ Patient | `{ action: 'PLAY_WHITE_NOISE', volume: number, message: string }` | Automated intervention command |
| `emergency_alert` | Server ➔ Guardian | `{ alertId, severity, riskScore, vitalSigns, location, timestamp }` | Emergency alert with GPS/facility details |

---

## 🌐 REST API Endpoints

- `GET /api/health`: Server uptime, connection count, and health status.
- `GET /api/telemetry/latest`: Latest telemetry cache and alert history.
- `POST /api/telemetry/simulate`: Trigger manual sensory evaluation via HTTP POST.
