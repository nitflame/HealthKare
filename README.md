# HealthKare Kerala 🏥

**Digital Health Record Management System for Migrant Workers in Kerala**

A full-stack healthcare record management platform designed as a demonstration project to explore digital health accessibility for migrant workers in Kerala. The project aligns with the United Nations Sustainable Development Goals (SDG 3: Good Health & Well-Being, SDG 8: Decent Work & Economic Growth, SDG 10: Reduced Inequalities, and SDG 16: Peace, Justice & Strong Institutions).

> **Disclaimer:** This is a demonstration and educational project created for learning, prototyping, and showcasing full-stack development, AI integration, and healthcare data management concepts. It is **not intended for real-world medical use or storage of sensitive patient information.**

![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black)
![Render](https://img.shields.io/badge/Backend-Render-purple)

---

## 🌐 Live Deployment

### Frontend

https://health-kare.vercel.app/

### Backend API

https://healthkare-r75y.onrender.com

### Health Check

https://healthkare-r75y.onrender.com/api/health

---

## ✨ Features

* **Role-Based Access Control** — Admin and Worker roles with protected routes
* **Health Record Management** — Create, view, update, and delete worker medical records
* **AI Risk Predictor** — Uses Claude AI to assess potential health risks from symptoms and diagnoses
* **AI Symptom Summarizer** — Generates simple, worker-friendly health summaries
* **AI Health Insights** — Provides population-level analytics and trends for administrators
* **AI Smart Search** — Natural language search across health records
* **Multi-Language Support** — English, Malayalam, Hindi, and Bengali
* **Analytics Dashboard** — Risk distribution charts and monthly trend analysis
* **Emergency Assistance** — Quick access to healthcare emergency services

---

## 🛠 Tech Stack

| Layer                | Technology                                            |
| -------------------- | ----------------------------------------------------- |
| Frontend             | React 18, Vite, TailwindCSS 4, React Router, Recharts |
| Backend              | Node.js, Express 5, MongoDB Atlas, Mongoose           |
| Authentication       | JWT (7-day tokens), bcryptjs                          |
| AI Integration       | Anthropic Claude API (claude-haiku)                   |
| Internationalization | i18next, react-i18next                                |
| Deployment           | Vercel, Render                                        |

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* MongoDB Atlas account
* Anthropic API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env

# Configure:
# MONGO_URI
# JWT_SECRET
# ANTHROPIC_API_KEY
# ALLOWED_ORIGINS

npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env

# Configure:
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable            | Description                            |
| ------------------- | -------------------------------------- |
| `MONGO_URI`         | MongoDB Atlas connection string        |
| `JWT_SECRET`        | Secret key used for JWT token signing  |
| `PORT`              | Server port (default: 5000)            |
| `ALLOWED_ORIGINS`   | Comma-separated frontend URLs for CORS |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key               |

### Frontend (`frontend/.env`)

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |

---

## 🌍 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Import repository into Vercel
3. Set `VITE_API_URL` in Environment Variables
4. Set Root Directory to `frontend`
5. Deploy

### Backend → Render

1. Create a Web Service on Render
2. Connect GitHub repository
3. Set Root Directory to `backend`
4. Build Command:

```bash
npm install
```

5. Start Command:

```bash
npm start
```

6. Add required environment variables
7. Deploy

---

## 🤖 AI Features

All AI-powered features use Anthropic Claude (claude-haiku).

| Feature         | Endpoint                      | Description                               |
| --------------- | ----------------------------- | ----------------------------------------- |
| Risk Predictor  | `POST /api/ai/analyze-record` | Predicts health risk level from symptoms  |
| Symptom Summary | `POST /api/ai/analyze-record` | Generates plain-language health summaries |
| Health Insights | `POST /api/ai/insights`       | Population-level healthcare analytics     |
| Smart Search    | `POST /api/ai/search`         | Natural language record search            |

---

## 📚 API Reference

### Authentication

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/api/auth/signup`     | Register a new user |
| POST   | `/api/auth/login`      | User login          |
| PUT    | `/api/auth/update/:id` | Update user profile |

### Records

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| GET    | `/api/records`       | Fetch records                 |
| GET    | `/api/records/stats` | Analytics and risk statistics |
| POST   | `/api/records`       | Create health record          |
| PUT    | `/api/records/:id`   | Update health record          |
| DELETE | `/api/records/:id`   | Delete health record          |

### AI

| Method | Endpoint                 | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/api/ai/analyze-record` | Analyze a single health record  |
| POST   | `/api/ai/insights`       | Generate health insights        |
| POST   | `/api/ai/search`         | Perform natural language search |

---

## 🔒 Security Features

* JWT authentication with 7-day token expiry
* Password hashing using bcryptjs
* Protected routes with authorization middleware
* CORS restrictions using allowed origins
* API rate limiting
* User ownership validation for profile updates
* Environment variable-based secret management

---

## 📁 Project Structure

```text
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
│
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
│
├── .gitignore
└── README.md
```

---

## 🎯 Project Goals

* Improve accessibility of digital health records for migrant workers
* Demonstrate secure full-stack healthcare application development
* Explore AI-assisted healthcare insights and analytics
* Support multilingual access to healthcare information
* Showcase modern web development practices using React, Express, MongoDB, and AI integrations

---



## 👨‍💻 Author

Developed as a full-stack demonstration project focused on healthcare accessibility, AI integration, and modern web application architecture.
