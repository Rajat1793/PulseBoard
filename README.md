# PulseBoard — Live Polls for Feedback

A full-stack polling and feedback platform built with the **PERN stack** (PostgreSQL, Express, React, Node.js).  
Create polls, share a public link, collect real-time feedback, and publish results — all in one place.

---

## Features

| Feature | Details |
|---|---|
| **Auth** | Email/password with JWT; protected routes, optional auth for respondents |
| **Security** | `helmet` headers, global + auth rate limiting, account lockout after 5 failed logins (15 min lock) |
| **Poll Builder** | Multi-question polls, single-choice options, mandatory/optional toggle, expiry date/time picker, anonymous vs authenticated response mode |
| **Public Sharing** | Unique share link (`/p/:shareId`) — anyone can vote without an account |
| **Live Analytics** | Real-time Socket.io WebSocket push — response count and percentages update instantly for the poll creator |
| **Result Publishing** | One-click publish; the share link shows final results instead of the voting form |
| **Responsive UI** | Tailwind CSS with a muted papaya-orange palette; works on mobile and desktop |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 18 |
| **Build tool** | Vite | 5 |
| **Styling** | Tailwind CSS | 3 |
| **HTTP client** | Axios | latest |
| **Realtime (client)** | socket.io-client | 4 |
| **Backend** | Node.js + Express.js | 18+ / 4 |
| **Database** | PostgreSQL + Sequelize ORM | 16 / 6 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | — |
| **Security** | helmet, express-rate-limit | — |
| **Realtime (server)** | Socket.io | 4 |

---

## Project Structure

```
pulse-board/
├── DATABASE.md                 # ER diagram + schema reference
├── backend/
│   ├── .env                    # Environment variables (see below)
│   ├── package.json
│   └── src/
│       ├── index.js            # Express entry, Socket.io, helmet, rate limit, sequelize.sync()
│       ├── config/
│       │   └── db.js           # Sequelize instance (PostgreSQL + SSL for production)
│       ├── middleware/
│       │   ├── auth.js         # protect() — JWT required | optionalAuth() — JWT optional
│       │   └── errorHandler.js # Global error handler
│       ├── models/
│       │   ├── User.js         # UUID PK, name, email, password (bcrypt), loginAttempts, lockUntil
│       │   ├── Poll.js         # UUID PK, title, description, creatorId, shareId, questions (JSONB), expiresAt, isPublished
│       │   └── Response.js     # UUID PK, pollId, respondentId (nullable), isAnonymous, answers (JSONB)
│       ├── routes/
│       │   ├── auth.js         # /api/auth/* — register, login, me
│       │   ├── polls.js        # /api/polls/* — CRUD, publish, analytics, public share
│       │   └── responses.js    # /api/responses/* — submit vote, fetch published results
│       └── socket/
│           └── index.js        # Socket.io rooms (poll-{id}), analytics-update, new-response events
└── frontend/
    ├── vite.config.js          # Dev proxy: /api + /socket.io → http://localhost:5001
    ├── package.json
    └── src/
        ├── App.jsx             # React Router — all routes
        ├── index.css           # Tailwind directives + design tokens (papaya palette)
        ├── main.jsx            # React root
        ├── components/
        │   ├── Navbar.jsx           # Public top nav
        │   ├── Sidebar.jsx          # Authenticated left sidebar
        │   ├── BentoCard.jsx        # Reusable bento card wrapper
        │   ├── PollCard.jsx         # Dashboard poll grid card
        │   ├── ProtectedRoute.jsx   # Auth guard — redirects to /login
        │   └── LoadingSpinner.jsx
        ├── context/
        │   ├── AuthContext.jsx      # Login/logout, JWT stored in localStorage as pb_token
        │   ├── SocketContext.jsx    # Socket.io connection provider
        │   └── ThemeContext.jsx     # Light/dark mode toggle
        ├── pages/
        │   ├── Landing.jsx          # Marketing homepage
        │   ├── Login.jsx            # Email/password login
        │   ├── Register.jsx         # Registration form
        │   ├── Dashboard.jsx        # Creator's poll list with status badges
        │   ├── CreatePoll.jsx       # Poll builder (add/remove questions and options)
        │   ├── Analytics.jsx        # Live analytics with Socket.io + Publish button
        │   ├── PublicPoll.jsx       # Public voting form (radio buttons, countdown timer)
        │   └── PublishedResults.jsx # Public results breakdown (winner highlighted)
        ├── lib/
        │   └── utils.js             # cn() — clsx + tailwind-merge helper
        └── utils/
            └── api.js               # Axios instance — base /api, attaches Bearer token
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Docker Desktop (for local PostgreSQL)

### 1. Clone & install

```bash
git clone <repo-url>
cd pulse-board

# Backend
cd backend && npm install

# Frontend (new terminal)
cd ../frontend && npm install
```

### 2. Start PostgreSQL via Docker

```bash
docker run -d \
  --name pulseboard-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pulseboard \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:16-alpine
```

> On subsequent runs, just `docker start pulseboard-postgres`.  
> Tables are auto-created by `sequelize.sync()` on first boot.

### 3. Configure environment

Create `backend/.env`:

```env
PORT=5001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pulseboard
JWT_SECRET=change_this_to_a_long_random_string_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note:** macOS AirPlay Receiver occupies port 5000 — the backend runs on **5001**.

### 4. Run

```bash
# Terminal 1 — backend (nodemon auto-restart)
cd backend && npm run dev

# Terminal 2 — frontend (Vite dev server)
cd frontend && npm run dev
```

Open **http://localhost:5173**

A demo account is seeded automatically on first run:
- Email: `demo@pulseboard.dev`
- Password: `demo123`

---

## Poll Status Logic

Computed via a Sequelize getter on the `Poll` model (included in `toJSON()`):

```
isPublished === true  →  "published"
Date.now() > expiresAt  →  "expired"
otherwise  →  "active"
```

---

## Database Schema

See [DATABASE.md](./DATABASE.md) for the full ER diagram, JSONB structures, and index reference.

---

## License

MIT
