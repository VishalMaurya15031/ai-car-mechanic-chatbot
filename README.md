# 🚗 Instant Mechanic — AI Car Mechanic Chatbot



> **Instant Mechanic AI** is a full-stack, multimodal conversational platform where vehicle owners can diagnose car mechanical issues, analyze dashboard warning lights, check engine acoustics, receive formal repair diagnosis reports, and book certified mechanics.

---

## 🌟 Key Features

1. **Multimodal Diagnostic Chat Interface (React + Vite):**
   - Text chat with formatted diagnostic steps, OBD-II fault lookups, and safety alerts.
   - **Photo Upload:** Inspect dashboard warning symbols, tire wear, fluid leaks, and brake scoring.
   - **Engine Acoustic Recording (Live Microphone):** Record engine knocks or belt squeals directly in browser for acoustic analysis.
   - **Video Upload:** Capture running engine behavior, exhaust smoke, or vibration.
   - **Conversation & Diagnosis History Drawer:** Seamlessly switch between past sessions.

2. **Automotive Master Technician Behavior:**
   - Strict automotive domain guardrail (politely rejects recipes, coding, politics, or general non-car queries).
   - Follow-up questioning before jumping to conclusions (Make/Model/Year, cranking status, sound conditions).
   - Structured **Diagnosis Report Card** with severity rating (Low, Medium, High, Critical), probable causes, recommended fixes, and estimated repair costs.

3. **Cost-Optimized Hybrid Architecture (AI Minimization Strategy):**
   - **Zero-AI Rule Engine:** Handles greetings, persona intros, out-of-scope rejections, OBD-II code lookups, and safety warnings through local regex/rules without consuming AI tokens.
   - **Gemini Multimodal AI:** Invoked strictly when complex technical reasoning, multimodal image/audio analysis, or detailed follow-up diagnosis is needed.
   - **Local Heuristic Fallback:** If Gemini API key is not configured, the platform falls back to an intelligent local mechanic engine without crashing.

4. **Mechanic Booking Flow & Real-Time Tracking:**
   - 1-click **"Book Mechanic"** modal pre-filled with diagnosed symptoms.
   - Doorstep mechanic visit, workshop drop-off, or emergency towing options.
   - Live booking status tracking (`GET /api/booking/{id}/`) with status timeline (*Confirmed &rarr; Assigned &rarr; In Progress &rarr; Completed*).

---

## 📡 Minimum Required REST APIs

All 5 required endpoints (plus history helpers) are implemented:

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/chat/` | Send message/media & receive technician diagnosis | ✅ Active |
| `POST` | `/api/upload/` | Upload image, engine audio recording, or video | ✅ Active |
| `POST` | `/api/diagnosis/` | Synthesize conversation into official Diagnosis Report | ✅ Active |
| `POST` | `/api/booking/` | Schedule a doorstep or workshop mechanic visit | ✅ Active |
| `GET` | `/api/booking/{id}/` | Retrieve status & details of a specific booking | ✅ Active |
| `GET` | `/api/conversations/` | List past diagnostic sessions | ✅ Active |
| `GET` | `/api/conversations/{id}/` | Retrieve full message history | ✅ Active |
| `GET` | `/api/health/` | Backend health check & Gemini status | ✅ Active |

👉 See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full request/response schemas.

---

## 🚀 Quick Start (Local Setup)

### 1. Backend Setup (Django + DRF)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables (Optional: Add your Gemini API key)
# Create .env from template:
cp .env.example .env

# 5. Run database migrations
python manage.py makemigrations api
python manage.py migrate

# 6. Run backend automated API tests
python test_api.py

# 7. Start Django development server
python manage.py runserver
```
Backend API will be running at `http://127.0.0.1:8000/api/`

---

### 2. Frontend Setup (React + Vite)

Open a new terminal:    https://frontend-henna-sigma-yihycpcyzq.vercel.app/

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start React development server
npm run dev
```
Frontend Web App will be running at `

---

## 🌐 Deployment Instructions

### 1. Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) & click **Add New Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Add Environment Variable:
   
6. Click **Deploy**. Vercel will provide your **Live Frontend URL https://frontend-henna-sigma-yihycpcyzq.vercel.app/**.

### 2. Backend Deployment (AWS App Runner / Render / Railway)
1. **Render / Railway / AWS App Runner:**
   - Create a new Web Service and link the GitHub repository.
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt && python manage.py migrate`
   - Start Command: `gunicorn mechanic_backend.wsgi:application --bind 0.0.0.0:$PORT`
   - Environment Variables:
     - `DEBUG` = `False`
     - `DJANGO_SECRET_KEY` = `MY-production-secret-key`
     - `GEMINI_API_KEY` = `MY-gemini-api-key`
2. Test the live health check at `<https://ai-car-mechanic-chatbot-v1dl.onrender.com/`.

---

## 🧪 Automated Testing

To run the complete automated test suite verifying all 5 required API endpoints, rule filtering, and bookings:

```bash
cd backend
.\venv\Scripts\python test_api.py
```
