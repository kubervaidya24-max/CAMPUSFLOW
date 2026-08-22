# CampusFlow 🎓

> **Unified Platform for College Students** — Academics, Projects, Messaging, Placement Prep & Career Growth.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Rotation-emerald.svg)](https://jwt.io/)
[![RBAC](https://img.shields.io/badge/RBAC-Student%20%7C%20Faculty%20%7C%20Admin-blueviolet.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)

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
│   │   ├── pages/              # Route pages (LandingPage, LoginPage, RegisterPage, DashboardPage, ProfilePage, EditProfilePage, NotFoundPage)
│   │   ├── services/           # Axios API client with silent refresh queue, authService, userService
│   │   ├── tests/              # Frontend smoke, auth, guard, and profile tests (10 tests)
│   │   ├── App.jsx             # Root routing & AuthProvider wrapper
│   │   ├── index.css           # Tailwind base styles & glassmorphism tokens
│   │   └── main.jsx            # React 18 DOM mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, Mongoose, Zod, JWT)
│   ├── src/
│   │   ├── config/             # Environment variables (env.js) & MongoDB connection (db.js)
│   │   ├── controllers/        # Request handlers (authController, userController, healthController)
│   │   ├── middleware/         # Error handling, 404, JWT authentication, role authorization, validation
│   │   ├── models/             # Mongoose schemas (User with student & faculty profiles, bcrypt hashing, token rotation)
│   │   ├── routes/             # Express API routes (/api/auth, /api/users, /api/health)
│   │   ├── utils/              # Standardized API response, ApiError class, cookie helpers
│   │   ├── validators/         # Zod schemas (authValidators, userValidators)
│   │   ├── app.js              # Express app setup & middleware pipeline (Helmet, CORS, Morgan, CookieParser)
│   │   └── server.js           # Server bootstrap & graceful lifecycle manager
│   ├── tests/                  # Backend Supertest integration test suite with MongoMemoryServer (27 tests)
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
| **Level 2** | **User Profiles & Role-Based Access Control (Student & Faculty Profiles, Whitelisting)** | **Completed** ✅ |
| Level 3 | Academic & Course Management | *Upcoming* |
| Level 4 | Assignments, Submissions & Kanban Tasks | *Upcoming* |
| Level 5 | Project Collaboration & Real-Time Chat (Socket.IO) | *Upcoming* |
| Level 6 | Placement Preparation & Practice Sheets | *Upcoming* |
| Level 7 | Dynamic ATS Resume Builder | *Upcoming* |
| Level 8 | Analytics, Admin Dashboard & Production Hardening | *Upcoming* |

---

## 👤 Level 2 Profile & RBAC Subsystem

### 1. Student & Faculty Profile Data Model
- **Student Profile**: Name, avatar / preset, department, semester (1-12), graduation year, college roll ID, bio, technical skills tags, academic interests tags, social portfolio links (GitHub, LinkedIn, Website).
- **Faculty Profile**: Name, avatar, department, designation (e.g. Professor, Associate Professor), office location / cabin, subjects taught tags, research bio.
- **Admin Role**: Minimal privileges foundation; access to all user profiles and system diagnostic checks.

### 2. Available User & Profile APIs

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Protected (`Bearer`) | Retrieve current user's comprehensive profile |
| `PATCH` | `/api/users/me` | Protected (`Bearer`) | Update current user's profile with strict field whitelisting |
| `GET` | `/api/users/:id` | Protected (`Bearer`) | Retrieve public profile of any user by ID |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Sign in with email & password |
| `POST` | `/api/auth/refresh` | Public (Cookie/Body) | Token rotation & exchange |
| `POST` | `/api/auth/logout` | Public (Cookie/Body) | Invalidate refresh tokens and clear cookies |
| `GET` | `/api/health` | Public | Diagnostic system health check |

### 3. Security Decisions & RBAC Controls
- **Strict Whitelisting**: The `PATCH /api/users/me` validator uses strict Zod parsing. Any attempt to modify `role`, `password`, `_id`, or `refreshTokens` is completely rejected with `400 Bad Request`.
- **Identity Isolation**: A user can only modify their own profile (`/api/users/me`). Direct modification of other users (`/api/users/:id`) is disallowed.
- **Image Architecture**: Built-in curated SVG avatar presets + custom URL image support with live preview and initials fallback, avoiding unnecessary third-party paid dependencies.

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
# Run all tests across monorepo (37 tests total: 27 backend + 10 frontend)
npm run test

# Run backend integration tests only
npm run test:server

# Run frontend component tests only
npm run test:client

# Run linting across all workspaces (0 errors, 0 warnings)
npm run lint

# Production client bundle build
npm run build
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
