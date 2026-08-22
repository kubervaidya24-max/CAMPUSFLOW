# CampusFlow 🎓

> **Unified Platform for College Students** — Academics, Projects, Messaging, Placement Prep & Career Growth.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Rotation-emerald.svg)](https://jwt.io/)
[![Courses](https://img.shields.io/badge/Courses-Syllabus%20%2B%20Enrollment-blueviolet.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)

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
│   │   ├── components/         # Reusable UI & Layouts (Navbar, Footer, CourseCard, ProtectedRoute)
│   │   ├── context/            # Global AuthContext & session restore provider
│   │   ├── pages/              # Route pages (LandingPage, LoginPage, RegisterPage, DashboardPage, ProfilePage, EditProfilePage, CoursesPage, CourseDetailsPage, CourseEditorPage, NotFoundPage)
│   │   ├── services/           # Axios API clients (authService, userService, courseService)
│   │   ├── tests/              # Frontend smoke, auth, guard, profile, and course tests (13 tests)
│   │   ├── App.jsx             # Root routing & AuthProvider wrapper
│   │   ├── index.css           # Tailwind base styles & glassmorphism tokens
│   │   └── main.jsx            # React 18 DOM mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, Mongoose, Zod, JWT)
│   ├── src/
│   │   ├── config/             # Environment variables (env.js) & MongoDB connection (db.js)
│   │   ├── controllers/        # Request handlers (authController, userController, courseController, healthController)
│   │   ├── middleware/         # Error handling, 404, JWT authentication, role authorization, validation
│   │   ├── models/             # Mongoose schemas (User, Course with indexing & virtual enrollment counters)
│   │   ├── routes/             # Express API routes (/api/auth, /api/users, /api/courses, /api/health)
│   │   ├── utils/              # Standardized API response, ApiError class, cookie helpers
│   │   ├── validators/         # Zod schemas (authValidators, userValidators, courseValidators)
│   │   ├── app.js              # Express app setup & middleware pipeline (Helmet, CORS, Morgan, CookieParser)
│   │   └── server.js           # Server bootstrap & graceful lifecycle manager
│   ├── tests/                  # Backend Supertest integration test suite with MongoMemoryServer (43 tests)
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
| **Level 3** | **Academic & Course Management (Syllabus Builder, Enrollment Guards, Capacity Limits)** | **Completed** ✅ |
| Level 4 | Assignments, Submissions & Kanban Tasks | *Upcoming* |
| Level 5 | Project Collaboration & Real-Time Chat (Socket.IO) | *Upcoming* |
| Level 6 | Placement Preparation & Practice Sheets | *Upcoming* |
| Level 7 | Dynamic ATS Resume Builder | *Upcoming* |
| Level 8 | Analytics, Admin Dashboard & Production Hardening | *Upcoming* |

---

## 📚 Level 3 Course Management Subsystem

### 1. Course Capabilities by Role
- **Faculty**:
  - Author courses with weekly syllabus modules, lecture schedules (days, time, hall), and capacity limits.
  - Publish or draft courses (`draft` courses remain invisible to students).
  - Update and manage enrolled students with live registration tables.
  - Delete or archive courses owned by them.
- **Student**:
  - Explore published courses filtered by Department and Semester.
  - Search courses by code (e.g. `CS401`), title, or topic keywords.
  - Single-click enrollment with duplicate prevention and capacity enforcement.
  - View "My Enrolled Courses" and unenroll/leave courses.
- **Admin**:
  - System-wide visibility and course oversight.

### 2. Available Course APIs

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/courses` | Faculty / Admin | Create new course with syllabus & schedule |
| `GET` | `/api/courses` | Protected | List courses with filters (`department`, `semester`, `search`, `enrolled`, `facultyOnly`) |
| `GET` | `/api/courses/:id` | Protected | Retrieve full course details, syllabus modules, and enrollment status |
| `PATCH` | `/api/courses/:id` | Faculty Owner / Admin | Update course metadata, syllabus, capacity, or publish status |
| `DELETE` | `/api/courses/:id` | Faculty Owner / Admin | Delete course |
| `POST` | `/api/courses/:id/enroll` | Student | Enroll in a published course |
| `DELETE` | `/api/courses/:id/enroll` | Student | Unenroll / leave a course |

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
# Run all tests across monorepo (56 tests total: 43 backend + 13 frontend)
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
