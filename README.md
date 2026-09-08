# AGRIVAULT — AI-Powered Post-Harvest Intelligence

> **TAGLINE**: *"SEE → SCORE → TRACK → PREDICT → ACT → VERIFY"*

AgriVault is a full-stack, software-first AI platform for agricultural post-harvest management, starting with **ONIONS** as the primary use case. It provides objective quality assessment at procurement using representative sampling and controlled single-layer computer vision inspection, followed by continuous post-harvest deterioration risk monitoring, explainable recommendations, value-at-risk calculations, and model improvement feedback loops.

---

## 🌟 Primary Hackathon Demo Flow (`ON-2026-00125`)

Open the application and execute the complete end-to-end hackathon workflow:

1. **Enterprise Dashboard (`/dashboard`)**:
   - Inspect inventory stats, high-risk alerts, and potential value at risk.
   - Click the **Critical Risk Intervention** banner for Main Demo Batch `ON-2026-00125`.
2. **Representative Sampling & AI Inspection (`/batches/ON-2026-00125/inspect`)**:
   - Review representative sampling locations (Top, Middle, Left, Right, Lower depth zones).
   - Capture single-layer snapshot with browser camera or test image.
   - Observe individual onion bounding boxes with semantic colors (Green = Acceptable, Yellow = Lower Grade, Red = Reject).
   - Click any bounding box to view confidence (e.g. 94%), defect type (Rot/Sprouting/Bruising), and severity.
3. **Human Operator Removal & Rescan Verification**:
   - Review **"REMOVE FLAGGED ONIONS"** operator checklist.
   - Mark rejected onions as physically removed by operator.
   - Click **"RESCAN SAMPLE"** to capture second photo.
   - Observe BEFORE vs AFTER reject count comparison and receive **"SORTING VERIFIED"** badge.
4. **Verifiable Digital Batch Passport (`/batches/ON-2026-00125/passport`)**:
   - View complete digital identity, QR code scan link, initial grade, and visual lifecycle timeline.
5. **Storage Monitoring & ESP32 Telemetry (`/batches/ON-2026-00125/storage`)**:
   - Observe temperature, humidity, and risk progression charts.
   - Use the **Judge Telemetry Simulator** to adjust humidity/temperature sliders and trigger live risk recalculation.
6. **Explainable Deterioration Risk & Value at Risk (`/batches/ON-2026-00125/storage`)**:
   - View 0-100 Risk Score breakdown (Humidity exposure, Visible rot trend, Storage duration).
   - Inspect Potential Value at Risk calculation (₹12,000).
   - Approve or Override AI action recommendation (`PRIORITIZE DISPATCH`).
7. **What-If Scenario Simulator**:
   - Test humidity and temperature sliders to project risk reduction scenarios.
8. **Batch Outcome Feedback Loop (`/batches/ON-2026-00125/outcome`)**:
   - Log final actual dispatch yield and model evaluation matching prediction.

---

## 🏗️ Technical Architecture & Technical Honesty

- **Representative Sampling**: A piled cart cannot be inspected visually from a single photo. AgriVault requires representative sampling drawn across 5 depth zones.
- **Single-Layer Computer Vision**: Sampled onions must be laid flat in a single layer for individual RGB computer vision detection.
- **Visible External Defects**: Assesses external visible defects (rot, sprouting, bruising). RGB cameras do not detect internal rot.
- **Human-in-the-Loop**: AI acts as the eyes; the human operator acts as the hands. UI highlights defective onions for operator removal.
- **Modular Replaceable AI Service**:
  - `aiMode: "DEMO_AI_MODE"` (Default offline simulator with explicit badge)
  - `aiMode: "REAL_YOLO"` (Connects seamlessly to live Python FastAPI microservice when `AI_SERVICE_URL` is set).

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Canvas API, HTML5 camera API.
- **Backend & REST APIs**: Next.js Server Route Handlers, Zod-style validation.
- **Database & ORM**: Prisma ORM with SQLite (`dev.db`) for zero-dependency local execution (compatible with PostgreSQL).
- **AI Microservice**: Python FastAPI, OpenCV, YOLOv8 payload contract (`ai_service/main.py`).

---

## 🚀 Quick Setup & Local Execution

### 1. Install Dependencies & Initialize Database
```bash
# Clone or navigate to directory
cd /Users/sahajbhatia/.gemini/antigravity/scratch/agrivault

# Install Node dependencies
npm install

# Push database schema & seed 8-10 realistic batches
npm run db:push
node prisma/seed.js
```

### 2. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐍 Standalone Python FastAPI YOLO Microservice (Optional)

AgriVault includes a complete Python FastAPI YOLO microservice in `ai_service/`.

```bash
cd ai_service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
To connect Next.js to the live FastAPI service, add to `.env`:
```env
AI_SERVICE_URL="http://localhost:8000"
```

---

## 🔌 ESP32 Telemetry REST API Contract

Physical ESP32 microcontrollers can stream storage telemetry directly:

```http
POST /api/devices/telemetry
Content-Type: application/json

{
  "deviceId": "ESP32-WH-01",
  "batchId": "ON-2026-00125",
  "temperature": 26.5,
  "humidity": 82.0,
  "apiKey": "agri_esp32_secret_key_88921"
}
```

---

## 📜 License
AgriVault Post-Harvest Intelligence Platform — Enterprise Agricultural SaaS.
