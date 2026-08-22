# CampusFlow 🎓

> **Unified Platform for College Students** — Academics, Projects, Messaging, Placement Prep & Career Growth.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Rotation-emerald.svg)](https://jwt.io/)

---

## 📌 Project Overview

**CampusFlow** is a modern, full-stack MERN platform built to unify every phase of a student's collegiate journey. It replaces disconnected tools with a single, cohesive workspace for course management, team project tracking, real-time collaboration, placement preparation, and dynamic resume building.

---

## 🏗️ Architecture & Monorepo Structure

```
campusflow/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, TanStack Query, Axios)
│   ├── public/                 # Static assets (Favicon, SVG logos)
│   ├── src/
│   │   ├── components/         # Reusable UI & Layouts (Navbar, Footer, ErrorBoundary, ProtectedRoute)
│   │   ├── context/            # Global AuthContext & session restore provider
│   │   ├── pages/              # Route pages (LandingPage, LoginPage, RegisterPage, DashboardPage, NotFoundPage)
│   │   ├── services/           # Axios API client with silent refresh queue & endpoint callers
│   │   ├── tests/              # Frontend smoke, auth, and guard tests
│   │   ├── App.jsx             # Root routing & AuthProvider wrapper
│   │   ├── index.css           # Tailwind base styles & glassmorphism tokens
│   │   └── main.jsx            # React 18 DOM mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, Mongoose, Zod, JWT)
│   ├── src/
│   │   ├── config/             # Environment variables (env.js) & MongoDB connection (db.js)
│   │   ├── controllers/        # Request handlers (authController, healthController)
│   │   ├── middleware/         # Error handling, 404, JWT authentication, role authorization, validation
│   │   ├── models/             # Mongoose schemas (User with bcrypt hashing & token rotation)
│   │   ├── routes/             # Express API routes (/api/auth, /api/health)
│   │   ├── utils/              # Standardized API response, ApiError class, cookie helpers
│   │   ├── validators/         # Zod schemas (registerSchema, loginSchema, refreshTokenSchema)
│   │   ├── app.js              # Express app setup & middleware pipeline (Helmet, CORS, Morgan, CookieParser)
│   │   └── server.js           # Server bootstrap & graceful lifecycle manager
│   ├── tests/                  # Backend Supertest integration test suite with MongoMemoryServer
│   └── package.json
│
├── docs/                       # Architecture & Setup guides
│   ├── architecture.md
│   └── setup.md
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Automated testing and build CI pipeline
│
├── docker-compose.yml          # Local MongoDB container definition
├── package.json                # Root monorepo workspace configuration
├── .env.example                # Sample environment configurations
└── README.md
```

---

## 🚀 Development Progress & Roadmap

| Level | Feature Scope | Status |
|---|---|---|
| **Level 0** | **Monorepo Foundation, Express Server, Vite Client, Health API & CI** | **Completed** ✅ |
| **Level 1** | **Authentication & RBAC (JWT, HTTP-only Cookies, Token Rotation, bcrypt, Zod)** | **Completed** ✅ |
| Level 2 | User Profiles & Profile Management | *Upcoming* |
| Level 3 | Academic & Course Management | *Upcoming* |
| Level 4 | Assignments, Submissions & Kanban Tasks | *Upcoming* |
| Level 5 | Project Collaboration & Real-Time Chat (Socket.IO) | *Upcoming* |
| Level 6 | Placement Preparation & Practice Sheets | *Upcoming* |
| Level 7 | Dynamic ATS Resume Builder | *Upcoming* |
| Level 8 | Analytics, Admin Dashboard & Production Hardening | *Upcoming* |

---

## 🔐 Level 1 Authentication & Authorization Subsystem

### 1. Token Strategy & Security Decisions
- **Access Tokens**: Short-lived (15 minutes) in-memory Bearer JWTs signed with `JWT_SECRET` containing `{ id, role, email, name, jti }`.
- **Refresh Tokens**: Long-lived (7 days) signed with `JWT_REFRESH_SECRET`, stored inside an `httpOnly`, `secure`, `sameSite: 'lax'` cookie and indexed in the MongoDB `User.refreshTokens` array.
- **Token Rotation & Replay Protection**: Each `/api/auth/refresh` invocation revokes the old refresh token, replaces it with a new rotated pair, and invalidates any reused or stolen refresh tokens.
- **Password Security**: Salted & hashed using `bcryptjs` (salt rounds: 12). Passwords are never stored in plaintext and are excluded from default database queries (`select: false`).
- **Validation**: Strict input validation using **Zod** verifying email syntax, name length, and password complexity (uppercase, lowercase, number, special symbol).
- **Role-Based Access Control (RBAC)**: Support for `student`, `faculty`, and `admin` roles, enforced at both API route and React component levels.

### 2. Available Authentication APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user with name, email, password, role & profile |
| `POST` | `/api/auth/login` | Public | Sign in with email & password; sets HTTP-only refresh cookie |
| `POST` | `/api/auth/refresh` | Public (Cookie/Body) | Rotate refresh token and issue new access token |
| `POST` | `/api/auth/logout` | Public (Cookie/Body) | Invalidate refresh token in database and clear auth cookies |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user profile |
| `GET` | `/api/health` | Public | System status, database state, and uptime diagnostic |

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: `v20+` or `v22+` (Node 26+ compatible)
- **npm**: `v10+`
- **MongoDB**: Local MongoDB instance or Docker

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kubervaidya24-max/CAMPUSFLOW.git
cd CAMPUSFLOW
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` templates to both server and client:
```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

### 3. Start Local MongoDB (Optional Docker)
```bash
docker compose up -d mongodb
```

### 4. Run Both Client & Server Concurrently
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Quality

```bash
# Run all tests (Server + Client: 25 tests)
npm run test

# Run backend tests only (Supertest integration suite)
npm run test:server

# Run frontend tests only (React Testing Library suite)
npm run test:client

# Run linting across monorepo (0 errors, 0 warnings)
npm run lint

# Production client build test
npm run build
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
