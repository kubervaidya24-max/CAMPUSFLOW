# CampusFlow 🎓

> **Unified Platform for College Students** — Academics, Coursework, Projects, Placement Prep & Career Growth.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Rotation-emerald.svg)](https://jwt.io/)
[![Courses](https://img.shields.io/badge/Courses-Syllabus%20%2B%20Enrollment-blueviolet.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)
[![Assignments](https://img.shields.io/badge/Assignments-Submissions%20%26%20Grading-sky.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)

---

## 📌 Project Overview

**CampusFlow** is a modern, full-stack MERN platform built to unify every phase of a student's collegiate journey. It replaces disconnected tools with a single, cohesive workspace for course management, assignments & deliverables, team project tracking, real-time collaboration, placement preparation, and dynamic resume building.

---

## 🏗️ Architecture & Monorepo Structure

```
campusflow/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, TanStack Query, Axios)
│   ├── public/                 # Static assets (Favicon, SVG logos)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, CourseCard, AssignmentCard, ProtectedRoute)
│   │   ├── context/            # Global AuthContext & session restore provider
│   │   ├── pages/              # Route pages (LandingPage, LoginPage, RegisterPage, DashboardPage, ProfilePage, EditProfilePage, CoursesPage, CourseDetailsPage, CourseEditorPage, AssignmentsPage, AssignmentDetailsPage, AssignmentEditorPage, NotFoundPage)
│   │   ├── services/           # Axios API clients (authService, userService, courseService, assignmentService)
│   │   ├── tests/              # Frontend smoke, auth, guard, profile, course, and assignment tests (16 tests)
│   │   ├── App.jsx             # Root routing & AuthProvider wrapper
│   │   ├── index.css           # Tailwind base styles & glassmorphism tokens
│   │   └── main.jsx            # React 18 DOM mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, Mongoose, Zod, JWT)
│   ├── src/
│   │   ├── config/             # Environment variables (env.js) & MongoDB connection (db.js)
│   │   ├── controllers/        # Request handlers (authController, userController, courseController, assignmentController, submissionController, healthController)
│   │   ├── middleware/         # Error handling, 404, JWT authentication, role authorization, validation
│   │   ├── models/             # Mongoose schemas (User, Course, Assignment, Submission)
│   │   ├── routes/             # Express API routes (/api/auth, /api/users, /api/courses, /api/assignments, /api/submissions, /api/health)
│   │   ├── utils/              # Standardized API response, ApiError class, cookie helpers
│   │   ├── validators/         # Zod schemas (authValidators, userValidators, courseValidators, assignmentValidators)
│   │   ├── app.js              # Express app setup & middleware pipeline (Helmet, CORS, Morgan, CookieParser)
│   │   └── server.js           # Server bootstrap & graceful lifecycle manager
│   ├── tests/                  # Backend Supertest integration test suite with MongoMemoryServer (55 tests)
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
| **Level 4** | **Assignments & Submissions (Deadline Validation, Late Flags, Faculty Grading & Feedback)** | **Completed** ✅ |
| Level 5 | Project Collaboration & Real-Time Chat (Socket.IO) | *Upcoming* |
| Level 6 | Placement Preparation & Practice Sheets | *Upcoming* |
| Level 7 | Dynamic ATS Resume Builder | *Upcoming* |
| Level 8 | Analytics, Admin Dashboard & Production Hardening | *Upcoming* |

---

## 📝 Level 4 Assignments & Submissions Subsystem

### 1. Capabilities by Role
- **Faculty**:
  - Create assignments bound to courses they teach with custom point scales, due dates, strict/late submission toggles, and attached resource links.
  - Edit or delete assignments.
  - View all student submissions in a live evaluation roster.
  - Grade student submissions with score validation (`score <= maxMarks`) and constructive remarks.
- **Student**:
  - View all assignments scoped to enrolled courses.
  - Filter assignments by status: `Pending`, `Submitted`, `Late`, `Graded`.
  - Submit notes, solution URLs (e.g. GitHub repos), and attached deliverables.
  - Update / resubmit deliverables before the deadline.
  - View awarded grades and instructor feedback.

### 2. Available Assignment & Submission APIs

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/assignments` | Faculty / Admin | Create new assignment for a course |
| `GET` | `/api/assignments` | Protected | List assignments (filtered by course & student enrollment) |
| `GET` | `/api/assignments/:id` | Protected | Retrieve assignment details, attachments, and submission state |
| `PATCH` | `/api/assignments/:id` | Faculty Owner / Admin | Update assignment metadata or deadline |
| `DELETE` | `/api/assignments/:id` | Faculty Owner / Admin | Delete assignment and associated submissions |
| `POST` | `/api/assignments/:id/submit` | Student | Submit or update assignment deliverable (guards against deadline) |
| `GET` | `/api/assignments/:id/submissions` | Faculty Owner / Admin | Retrieve all student submissions for an assignment |
| `GET` | `/api/submissions/me` | Student | List all submissions and grades for the current student |
| `PATCH` | `/api/submissions/:id/grade` | Faculty Owner / Admin | Evaluate and score student submission |

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
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Run Both Client & Server Concurrently
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Quality

```bash
# Run all tests across monorepo (71 tests total: 55 backend + 16 frontend)
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
