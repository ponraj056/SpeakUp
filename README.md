# 🎤 SpeakUp - English Speaking Practice Platform

A production-ready, browser-based English speaking practice PWA built with **Next.js 14**, **Fastify**, **PostgreSQL**, and **Claude AI**.

## 🏗 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js   │────▶│   Fastify    │────▶│  PostgreSQL   │
│  Frontend   │     │   Backend    │     │   (Prisma)    │
│  (Port 3000)│     │  (Port 4000) │     │  (Port 5432)  │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │    Redis     │
                    │  (Port 6379) │
                    └──────────────┘
```

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query, Framer Motion, Recharts, Web Speech API

**Backend:** Fastify, TypeScript, Prisma ORM, JWT auth (Argon2id), Zod validation, Claude AI, Stripe billing

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env   # Edit with your keys
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npm run db:seed
```

### 3. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/health

### Docker Compose (Alternative)

```bash
docker-compose up -d
```

## 📋 Demo Accounts

| Role    | Email                | Password     |
|---------|---------------------|-------------|
| Admin   | admin@speakup.app   | Admin@123   |
| Learner | learner@speakup.app | Learner@123 |

## 🎯 Core Features

| Feature | Description |
|---------|------------|
| 🎤 Pronunciation Lab | Record speech, get phoneme-level feedback with waveform visualization |
| 💬 AI Conversation | 10 real-world scenarios with Claude AI, 3 difficulty tiers |
| 📚 Daily Lessons | Grammar, pronunciation, vocabulary, speaking skills lessons |
| 🧠 Quiz Engine | SM-2 spaced repetition with IRT difficulty adjustment |
| 📖 Vocabulary Notebook | SRS flashcard review, auto-populated from AI sessions |
| 📝 Phrasebook | 500+ phrases by situation, formality, and CEFR level |
| 📊 Progress Dashboard | Skill radar chart, XP tracking, activity heatmap |
| 💳 Stripe Billing | Freemium model, Pro subscription ($8.99/mo) |
| 👤 Auth System | Argon2id, JWT rotation, account lockout, 2FA ready |
| 🛡 Admin Panel | KPI dashboard, user management, lesson CMS |

## 🔌 API Endpoints

Base URL: `http://localhost:4000/v1`

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login (returns JWT tokens)
- `POST /auth/refresh` — Rotate access token
- `DELETE /auth/logout` — Revoke tokens
- `GET /auth/me` — Get profile
- `PATCH /auth/me` — Update profile

### Lessons
- `GET /lessons` — List with filters
- `GET /lessons/:slug` — Detail view
- `POST /lessons/:id/complete` — Mark complete

### AI
- `GET /ai/scenarios` — List scenarios
- `POST /ai/chat` — Conversation turn
- `POST /ai/grammar` — Grammar check
- `POST /ai/sessions/:id/end` — End & get feedback

### Quiz
- `GET /quiz/due` — SRS-due questions
- `POST /quiz/answer` — Submit answer

### Vocabulary
- `GET /vocabulary` — Word list
- `POST /vocabulary` — Add word
- `GET /vocabulary/review` — Due reviews

### Billing
- `POST /billing/subscribe` — Start checkout
- `DELETE /billing/cancel` — Cancel sub
- `GET /billing/status` — Sub status

### Admin
- `GET /admin/metrics` — Platform KPIs
- `GET /admin/users` — User list
- `PATCH /admin/lessons/:id` — Manage lessons

## 🗄 Database

16 tables with full relations, indexes, and enums. See `backend/prisma/schema.prisma`.

Key tables: `users`, `lessons`, `user_lesson_progress`, `quiz_questions`, `user_quiz_attempts`, `ai_sessions`, `pronunciation_attempts`, `user_vocabulary`, `phrases`, `subscriptions`, `audit_logs`, `achievements`

## 🔐 Security

- Passwords: Argon2id (64MB memory, 3 iterations)
- JWT: 15min access + 30-day rotating refresh tokens
- Redis token denylist for instant revocation
- Account lockout after 5 failed attempts
- Zod validation on all inputs
- Role-based access control (Learner/Teacher/Editor/Admin)

## 📁 Project Structure

```
SPEAK WITH AI/
├── backend/
│   ├── src/
│   │   ├── config/         # env, database, redis
│   │   ├── plugins/        # auth, error handler
│   │   ├── shared/         # errors, response, schemas
│   │   ├── modules/
│   │   │   ├── auth/       # register, login, profile
│   │   │   ├── lessons/    # CRUD, progress, XP
│   │   │   ├── ai/         # Claude chat, grammar, feedback
│   │   │   ├── quiz/       # SM-2, IRT, due questions
│   │   │   ├── vocabulary/ # SRS, flashcards
│   │   │   ├── phrases/    # phrasebook, phrase-of-day
│   │   │   ├── billing/    # Stripe checkout, webhooks
│   │   │   └── admin/      # metrics, user mgmt
│   │   └── server.ts       # Fastify entry point
│   └── prisma/
│       ├── schema.prisma   # 16-table schema
│       └── seed.ts         # Demo data
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page
│       │   ├── login/              # Auth pages
│       │   ├── register/
│       │   └── dashboard/
│       │       ├── page.tsx        # Dashboard home
│       │       ├── lessons/        # Lesson browser
│       │       ├── conversation/   # AI chat
│       │       ├── pronunciation/  # Pronunciation lab
│       │       ├── quiz/           # Quiz engine
│       │       ├── vocabulary/     # Word notebook
│       │       ├── phrases/        # Phrasebook
│       │       ├── progress/       # Analytics
│       │       ├── billing/        # Subscription
│       │       └── settings/       # Account settings
│       ├── lib/                    # api client, utils
│       ├── stores/                 # Zustand auth store
│       └── components/             # Shared components
└── docker-compose.yml
```

## 📄 License

MIT
