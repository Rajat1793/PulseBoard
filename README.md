# PulseBoard — Live Polls for Feedback

A full-stack polling and feedback platform built with the MERN stack (MongoDB, Express, React, Node.js).  
Create polls, share a public link, collect feedback in real-time, and publish results — all in one place.

---

## Features

| Feature | Details |
|---|---|
| **Auth** | Email/password with JWT; protected routes, optional auth for respondents |
| **Security** | `helmet` headers, global + auth rate limiting (express-rate-limit), account lockout after 5 failed logins (15 min lock) |
| **Poll Builder** | Multi-question polls, single-choice options, mandatory/optional toggle, expiry date/time picker, anonymous vs authenticated response mode |
| **Public Sharing** | Unique share link (`/p/:shareId`) — anyone can vote without an account |
| **Live Analytics** | Real-time Socket.io WebSocket push — response count and percentages update instantly for the poll creator |
| **Result Publishing** | One-click publish; the share link then shows final breakdown instead of the voting form |
| **Duplicate Prevention** | Authenticated users blocked from voting twice (MongoDB partial unique index) |
| **Responsive UI** | Tailwind CSS with a custom violet primary palette; works on mobile and desktop |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 18 |
| **Build tool** | Vite | 5 |
| **Styling** | Tailwind CSS | 3 |
| **Icons** | lucide-react | latest |
| **HTTP client** | Axios | latest |
| **Realtime (client)** | socket.io-client | 4 |
| **Toast notifications** | react-hot-toast | latest |
| **Backend** | Node.js + Express.js | 18+ / 4 |
| **Database** | MongoDB + Mongoose | 7 / 8 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | — |
| **Security** | helmet, express-rate-limit | — |
| **Realtime (server)** | Socket.io | 4 |
| **Input validation** | express-validator | — |

---

## Project Structure

```
pulse-board/
├── backend/
│   ├── .env                    # Environment variables (see below)
│   ├── package.json
│   └── src/
│       ├── index.js            # Express entry point + Socket.io init + helmet + rate limit
│       ├── config/
│       │   └── db.js           # Mongoose connection
│       ├── middleware/
│       │   ├── auth.js         # protect() — JWT required | optionalAuth() — JWT optional
│       │   └── errorHandler.js # Global error handler
│       ├── models/
│       │   ├── User.js         # name, email, password (hashed), loginAttempts, lockUntil
│       │   ├── Poll.js         # title, description, questions[], shareId, isPublished, expiresAt, requireAuth
│       │   └── Response.js     # poll ref, respondent ref (optional), answers[]
│       ├── routes/
│       │   ├── auth.js         # /api/auth/* — register, login, me, Google OIDC
│       │   ├── polls.js        # /api/polls/* — CRUD, publish, analytics, public share
│       │   └── responses.js    # /api/responses/* — submit vote, fetch published results
│       └── socket/
│           └── index.js        # Socket.io rooms (poll-{id}), analytics-update, new-response events
└── frontend/
    ├── vite.config.js          # Dev proxy: /api + /socket.io → http://localhost:5001
    ├── package.json
    └── src/
        ├── App.jsx             # React Router — all routes
        ├── index.css           # Tailwind directives + custom component classes
        ├── main.jsx            # React root
        ├── components/
        │   ├── Navbar.jsx           # Public top nav
        │   ├── ProtectedRoute.jsx   # Auth guard — redirects to /login
        │   └── LoadingSpinner.jsx
        ├── context/
        │   ├── AuthContext.jsx      # Login/logout, JWT stored in localStorage as pb_token
        │   └── SocketContext.jsx    # Socket.io connection provider
        ├── pages/
        │   ├── Landing.jsx          # Marketing homepage
│       │   ├── Login.jsx            # Email/password login
│       │   ├── Register.jsx         # Registration form
        │   ├── Dashboard.jsx        # Creator's poll list with status badges
        │   ├── CreatePoll.jsx       # Poll builder (add/remove questions and options)
        │   ├── Analytics.jsx        # Live analytics with Socket.io + Publish button
        │   ├── PublicPoll.jsx       # Public voting form (radio buttons, countdown timer)
        │   └── PublishedResults.jsx # Public results breakdown (winner highlighted)
        └── utils/
            └── api.js              # Axios instance — base /api, attaches Bearer token automatically
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Docker Desktop (for MongoDB) **or** MongoDB Atlas (cloud)

### 1. Clone & install

```bash
git clone <repo-url>
cd pulse-board

# Backend
cd backend && npm install

# Frontend (new terminal)
cd ../frontend && npm install
```

### 2. Start MongoDB via Docker

```bash
docker run -d \
  --name pulseboard-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=pulseboard \
  -v pulseboard-mongo-data:/data/db \
  mongo:7
```

> On subsequent runs, just `docker start pulseboard-mongo`.

### 3. Configure environment

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/pulseboard
JWT_SECRET=change_this_to_a_long_random_string_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

> **Note:** macOS AirPlay Receiver permanently occupies port 5000. The backend runs on **5001**.

### 4. Run

```bash
# Terminal 1 — backend (auto-restarts with nodemon)
cd backend && npm run dev

# Terminal 2 — frontend (Vite dev server)
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## Security

| Layer | Implementation |
|---|---|
| Security headers | `helmet()` applied globally — sets CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc. |
| Global rate limit | 100 requests / 15 min per IP |
| Auth rate limit | **10 requests / 15 min per IP** on `/api/auth/register` and `/api/auth/login` |
| Account lockout | 5 consecutive wrong passwords → account locked 15 min; auto-unlocks on success |
| Password hashing | bcrypt with cost factor 12 |
| JWT | HS256, signed with `JWT_SECRET`, 7-day expiry |
| Input validation | express-validator on all auth + poll creation endpoints |
| JSON body limit | `10kb` — prevents large-payload DoS |
| CORS | Restricted to `CLIENT_URL` only |
| Duplicate votes | MongoDB partial unique index `{ poll, respondent }` prevents authenticated double-voting |

---

## API Reference

### Auth — `/api/auth`

| Method | Path | Rate limit | Auth | Description |
|---|---|---|---|---|
| POST | `/register` | 10/15min | — | Create account |
| POST | `/login` | 10/15min | — | Login, returns JWT |
| GET | `/me` | global | Required | Current user |

### Polls — `/api/polls`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Required | Create poll |
| GET | `/` | Required | List creator's polls |
| GET | `/public/:shareId` | — | Public poll details |
| GET | `/:id` | Required | Poll detail (creator) |
| PUT | `/:id` | Required | Update poll |
| DELETE | `/:id` | Required | Delete poll |
| POST | `/:id/publish` | Required | Publish results |
| GET | `/:id/analytics` | Required | Full analytics |

### Responses — `/api/responses`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/:shareId` | Optional | Submit a response |
| GET | `/results/:shareId` | — | Published results (public) |

---

## WebSocket Events (Socket.io)

Rooms are named `poll-{pollId}`. The poll creator's Analytics page joins the room on mount.

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-poll` | Client → Server | `{ pollId }` | Join analytics room |
| `leave-poll` | Client → Server | `{ pollId }` | Leave analytics room |
| `analytics-update` | Server → Client | full analytics object | Sent to room after every new response |
| `new-response` | Server → Client | `{ pollId, totalResponses }` | Lightweight notification |
| `poll-published` | Server → Client | `{ pollId }` | Triggers respondent redirect to results |

---

## Poll Status Logic

A poll's computed `status` field (Mongoose virtual):

```
isPublished === true  →  "published"
Date.now() > expiresAt  →  "expired"
otherwise  →  "active"
```

---

## Free Hosting Options

See the [Hosting section](#-free-hosting-guide) below.

---

## License

MIT

---

## Free Hosting Guide

### Architecture to deploy

```
Frontend (React/Vite) ──▶ Vercel / Netlify
Backend (Express API)  ──▶ Render / Railway
Database (MongoDB)     ──▶ MongoDB Atlas (free M0 tier)
```

### Option A — Recommended (Render + Vercel + Atlas)

| Service | What | Free limits |
|---|---|---|
| **MongoDB Atlas** | Managed MongoDB | 512 MB storage, shared cluster, never expires |
| **Render** | Backend (Express) | 750 hrs/month (always free), spins down after 15 min idle |
| **Vercel** | Frontend (React/Vite) | Unlimited deploys, global CDN, custom domains |

**Steps:**

1. **MongoDB Atlas** — [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)  
   - Create a free M0 cluster → get connection string → set it as `MONGODB_URI` in Render.

2. **Render (backend)**  
   - New → Web Service → connect GitHub repo  
   - Root directory: `backend`  
   - Build command: `npm install`  
   - Start command: `node src/index.js`  
   - Set env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL), `PORT=10000`  
   - Your API URL will be `https://your-app.onrender.com`

3. **Vercel (frontend)**  
   - New project → connect GitHub repo  
   - Root directory: `frontend`  
   - Framework preset: Vite  
   - Add env var: `VITE_API_URL=https://your-app.onrender.com`  
   - In `frontend/vite.config.js`, replace the proxy with the real Render URL for production  
   - Or add a `vercel.json` rewrites file to proxy `/api` → Render (avoids CORS)

> **Socket.io on Render**: Works on the free plan — Render supports WebSocket connections.

---

### Option B — Railway (backend + frontend on one platform)

| Service | Free limits |
|---|---|
| **Railway** | $5 credit/month (roughly 500 hrs), supports Node.js + MongoDB plugin |

- Simpler than Render+Vercel — deploy both services from one dashboard
- Add MongoDB service from the Railway plugin marketplace (no Atlas needed)
- Set env vars in the Railway dashboard

---

### Option C — Fly.io (backend as Docker container)

- Free allowance: 3 shared-CPU VMs, 256 MB RAM each
- Good for containerized deployments (`fly launch` auto-detects Node.js)
- Pair with Atlas for MongoDB

---

### Environment variables needed for production

```env
# backend (Render / Railway / Fly.io)
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pulseboard
JWT_SECRET=<long random string — use: openssl rand -hex 32>
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend.vercel.app
```

---

### Quick comparison

| | Render | Railway | Fly.io | Vercel (frontend only) |
|---|---|---|---|---|
| Free tier | ✅ 750 hrs | ✅ $5 credit | ✅ 3 VMs | ✅ Unlimited |
| Sleep on idle | Yes (15 min) | No | No | N/A |
| WebSockets | ✅ | ✅ | ✅ | ❌ (serverless) |
| MongoDB | Via Atlas | Built-in plugin | Via Atlas | N/A |
| Custom domains | ✅ | ✅ | ✅ | ✅ |
| Easiest setup | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

> **Recommended path for a hackathon:** MongoDB Atlas (free) + Render (backend) + Vercel (frontend) — all three have zero credit-card requirements and deploy from GitHub in under 10 minutes.


---

## Features

- **Authentication & Access Control** — JWT-based auth + Google OAuth (Passport.js), protected routes, optional auth for respondents
- **Poll Creation** — Multi-question polls with single-choice options, mandatory/optional questions, expiry times
- **Response Collection** — Anonymous or authenticated responses, expiry enforcement, duplicate prevention
- **Live Analytics** — Real-time response stats pushed via Socket.io WebSockets; recharts bar charts
- **Result Publishing** — One-click publish; respondents see the final breakdown at the same share URL
- **Bento UI Design System** — Warm terracotta/orange palette (`#ff5f1f`), Plus Jakarta Sans, rounded bento cards, sidebar navigation for creator pages

---

## Design System

The frontend design is ported from the **papaya-pulse** reference project:

| Token | Value | Usage |
|---|---|---|
| `primary` | `#ab3600` | Text accents, icon fills |
| `primary-container` | `#ff5f1f` | Buttons, highlights |
| `surface` | `#fff8f6` | Page background |
| `surface-container` | `#ffe9e3` | Sidebar, highlights strip |
| `on-surface` | `#271813` | Main body text |
| `on-surface-variant` | `#5b4138` | Muted / secondary text |
| `error` | `#ba1a1a` | Validation errors |

Font: **Plus Jakarta Sans** (Google Fonts, variable weight 200–800)

Key CSS class: `.bento-card` — `rounded-3xl bg-white border border-black/5 shadow-[0_4px_20px_-2px_rgba(61,44,39,0.04)] hover:-translate-y-1 transition-all`

### Layout Architecture

| Route type | Layout component | Navigation |
|---|---|---|
| `/`, `/login`, `/register`, `/p/*` | `PublicLayout` | Fixed top `<Navbar />` |
| `/dashboard`, `/create`, `/poll/*` | `AuthLayout` (ProtectedRoute) | Fixed left `<Sidebar />` (w-64) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS v3 |
| UI libraries | lucide-react, recharts, motion, clsx, tailwind-merge |
| Backend | Node.js 18+, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs, Passport.js (Google OAuth 2.0) |
| Realtime | Socket.io |

---

## Project Structure

```
pulse-board/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── db.js          # MongoDB connection
│       │   └── passport.js    # Google OAuth strategy
│       ├── middleware/
│       │   ├── auth.js        # JWT verification middleware
│       │   └── errorHandler.js
│       ├── models/
│       │   ├── Poll.js        # Poll schema (questions, options, expiry)
│       │   ├── Response.js    # Response schema
│       │   └── User.js        # User schema
│       ├── routes/
│       │   ├── auth.js        # /api/auth/*
│       │   ├── polls.js       # /api/polls/*
│       │   └── responses.js   # /api/responses/*
│       ├── socket/
│       │   └── index.js       # Socket.io room & event setup
│       └── index.js           # Express entry point
└── frontend/
    └── src/
        ├── components/
        │   ├── BentoCard.jsx      # Reusable bento card wrapper
        │   ├── Sidebar.jsx        # Authenticated left sidebar
        │   ├── Navbar.jsx         # Public top navbar
        │   ├── PollCard.jsx       # Dashboard poll grid card
        │   ├── ProtectedRoute.jsx # Auth guard
        │   └── LoadingSpinner.jsx
        ├── context/
        │   ├── AuthContext.jsx    # JWT auth state + login/logout
        │   └── SocketContext.jsx  # Socket.io connection context
        ├── lib/
        │   └── utils.js           # cn() — clsx + tailwind-merge helper
        ├── pages/
        │   ├── Landing.jsx        # Marketing homepage
        │   ├── Login.jsx          # Login form + Google OAuth
        │   ├── Register.jsx       # Registration form
        │   ├── Dashboard.jsx      # Creator dashboard with bento grid
        │   ├── CreatePoll.jsx     # Poll builder (3-step + live preview)
        │   ├── Analytics.jsx      # Real-time analytics (recharts)
        │   ├── PublicPoll.jsx     # Public voting page
        │   ├── PublishedResults.jsx # Published results view
        │   └── OAuthCallback.jsx  # Google OAuth token handler
        ├── utils/
        │   └── api.js             # Axios instance with base URL + auth header
        ├── App.jsx                # React Router layout + routes
        ├── index.css              # Tailwind directives + global styles
        └── main.jsx               # React root
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Google OAuth credentials (optional — for social login)

### 1. Backend

```bash
cd backend
cp .env.example .env    # fill in your values
npm install
npm run dev             # starts on http://localhost:5000
```

**`backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulseboard
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Required | Get current user |
| GET | `/api/auth/google` | — | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | — | Google OAuth callback |

### Polls

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/polls` | Required | Create poll |
| GET | `/api/polls` | Required | List creator's polls |
| GET | `/api/polls/:id` | Required | Get poll (creator view) |
| PUT | `/api/polls/:id` | Required | Update poll |
| DELETE | `/api/polls/:id` | Required | Delete poll |
| POST | `/api/polls/:id/publish` | Required | Publish results |
| GET | `/api/polls/:id/analytics` | Required | Get analytics |
| GET | `/api/polls/public/:shareId` | — | Get public poll |

### Responses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/responses/:shareId` | Optional | Submit response |

---

## WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `join-poll` | Client → Server | Join poll analytics room |
| `leave-poll` | Client → Server | Leave poll room |
| `analytics-update` | Server → Client | Updated stats after new response |
| `new-response` | Server → Client | New submission notification |

---

## License

MIT
