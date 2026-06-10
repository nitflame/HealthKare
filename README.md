# HealthKare Kerala 🏥

**Digital Health Record Management System for Migrant Workers in Kerala**

A full-stack web app that helps health workers and administrators manage health records for migrant workers, aligned with UN Sustainable Development Goals (SDG 3, 8, 10, 16).

---

## Features

- **Role-based access** — Admin and Worker roles with protected routes
- **Health records** — Create, view, edit, delete medical records linked to workers
- **AI Risk Predictor** — Claude AI analyzes symptoms/diagnosis and predicts risk level
- **AI Symptom Summarizer** — Plain-language health summaries for worker dashboards
- **AI Health Insights** — Population-level insights for admin analytics
- **AI Smart Search** — Natural language search across all records
- **Multi-language** — English, Malayalam, Hindi, Bengali
- **Analytics dashboard** — Charts for risk distribution and monthly trends
- **Emergency contact** — Quick access to 108 helpline

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS 4, React Router, Recharts |
| Backend | Node.js, Express 5, MongoDB Atlas, Mongoose |
| Auth | JWT (7-day tokens), bcryptjs |
| AI | Anthropic Claude API (claude-haiku) |
| i18n | i18next, react-i18next |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Anthropic API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, ANTHROPIC_API_KEY, ALLOWED_ORIGINS
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 64+ char string for JWT signing |
| `PORT` | Server port (default: 5000) |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs for CORS |
| `ANTHROPIC_API_KEY` | Your Anthropic API key for AI features |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Set `VITE_API_URL` in Vercel environment variables
4. Deploy from `frontend/` directory

### Backend → Render

1. Create a new Web Service on Render
2. Set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables in Render dashboard

---

## AI Features

All AI features use Claude (claude-haiku) via the Anthropic API.

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Risk predictor | `POST /api/ai/analyze-record` | Predicts risk level from symptoms |
| Symptom summary | (same endpoint) | Generates plain-language health summary |
| Health insights | `POST /api/ai/insights` | Population-level analysis for admins |
| Smart search | `POST /api/ai/search` | Natural language record search |

---

## API Reference

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `PUT /api/auth/update/:id` — Update profile (auth required)

### Records
- `GET /api/records` — Get records (admin: all, worker: own)
- `GET /api/records/stats` — Stats + risk breakdown (admin)
- `POST /api/records` — Create record (admin)
- `PUT /api/records/:id` — Update record (admin)
- `DELETE /api/records/:id` — Delete record (admin)

### AI
- `POST /api/ai/analyze-record` — Analyze single record (admin)
- `POST /api/ai/insights` — Population health insights (admin)
- `POST /api/ai/search` — Natural language search (admin)

---

## Security

- JWT tokens with 7-day expiry
- bcryptjs with cost factor 12
- CORS restricted to allowed origins
- Rate limiting: 20 req/15min on auth, 200 req/15min on API
- Auth required on profile update route
- Authorization check: users can only update their own profile

---

## Project Structure

```
healthkare/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Record.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── records.js
│   │   └── ai.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

*Built for the Government of Kerala's migrant worker health initiative.*
