# CampusFlow 🎓

> **Unified Platform for College Students** — Academics, Deliverables, Team Projects & Kanban, Real-Time Socket.IO Chat & Notifications, Placement Prep & Career Growth.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Rotation-emerald.svg)](https://jwt.io/)
[![Courses](https://img.shields.io/badge/Courses-Syllabus%20%2B%20Enrollment-blueviolet.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)
[![Assignments](https://img.shields.io/badge/Assignments-Submissions%20%26%20Grading-sky.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)
[![Projects](https://img.shields.io/badge/Projects-Kanban%20%26%20Collab-emerald.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)
[![Chat](https://img.shields.io/badge/Chat-Socket.IO%20Realtime-orange.svg)](https://socket.io/)
[![Notifications](https://img.shields.io/badge/Notifications-Centralized%20Realtime-rose.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)

---

## 📌 Project Overview

**CampusFlow** is a modern, full-stack MERN platform built to unify every phase of a student's collegiate journey. It replaces disconnected tools with a single, cohesive workspace for academic courses, assignment submissions, collaborative project workspaces with interactive Kanban boards, real-time Socket.IO chat, centralized multi-channel notifications, placement preparation, and dynamic resume building.

---

## 🏗️ Architecture & Monorepo Structure

```
campusflow/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, TanStack Query, Axios, Socket.IO Client)
│   ├── public/                 # Static assets (Favicon, SVG logos)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, NotificationBell, NotificationPanel, CourseCard, AssignmentCard, ProjectCard, KanbanBoard, ProjectChat, ProtectedRoute)
│   │   ├── context/            # Global AuthContext & session restore provider
│   │   ├── hooks/              # Custom hooks (useProjectChat, useNotifications)
│   │   ├── pages/              # Route pages (Landing, Login, Register, Dashboard, Profile, EditProfile, Courses, CourseDetails, CourseEditor, Assignments, AssignmentDetails, AssignmentEditor, Projects, ProjectDetails, ProjectEditor, NotFound)
│   │   ├── services/           # API & Socket clients (authService, userService, courseService, assignmentService, projectService, socketService, notificationService)
│   │   ├── tests/              # Frontend smoke, auth, guard, profile, course, assignment, project, chat, and notification tests (26 tests)
│   │   ├── App.jsx             # Root routing & AuthProvider wrapper
│   │   ├── index.css           # Tailwind base styles & glassmorphism tokens
│   │   └── main.jsx            # React 18 DOM mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, Socket.IO, Mongoose, Zod, JWT)
│   ├── src/
│   │   ├── config/             # Environment variables (env.js) & MongoDB connection (db.js)
│   │   ├── controllers/        # Request handlers (auth, user, course, assignment, submission, project, task, message, notification, health)
│   │   ├── middleware/         # Error handling, 404, JWT authentication, role authorization, validation
│   │   ├── models/             # Mongoose schemas (User, Course, Assignment, Submission, Project, Task, ProjectActivity, Message, Notification)
│   │   ├── routes/             # Express API routes (/api/auth, /api/users, /api/courses, /api/assignments, /api/submissions, /api/projects, /api/tasks, /api/notifications, /api/health)
│   │   ├── services/           # Centralized business services (notificationService.js)
│   │   ├── socket/             # Socket.IO server initialization, handshake auth, room guards (socketServer.js)
│   │   ├── utils/              # Standardized API response, ApiError class, cookie helpers
│   │   ├── validators/         # Zod schemas (authValidators, userValidators, courseValidators, assignmentValidators, projectValidators)
│   │   ├── app.js              # Express app setup & middleware pipeline (Helmet, CORS, Morgan, CookieParser)
│   │   └── server.js           # HTTP + Socket.IO server bootstrap & graceful shutdown
│   ├── tests/                  # Backend Supertest & socket.io-client integration test suite (78 tests)
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
| **Level 5** | **Project Collaboration & Kanban (Team Invitations, 3-Column Kanban Board, Activity Audit Log)** | **Completed** ✅ |
| **Level 6** | **Real-Time Chat & Socket.IO (Handshake Auth, Room Authorization, MongoDB Message Persistence, Typing Indicators, Online Presence)** | **Completed** ✅ |
| **Level 7** | **Centralized Notification System (NotificationService, Multi-channel Event Triggers, MongoDB Compound Indexing, Socket.IO User Rooms, Navbar Bell & Popover Panel)** | **Completed** ✅ |
| Level 8 | Dynamic ATS Resume Builder | *Upcoming* |
| Level 9 | Analytics, Admin Dashboard & Production Hardening | *Upcoming* |

---

## 🔔 Level 7 Centralized Notification System

### 1. Notification Event Lifecycle Architecture
```
Event (Assignment Created, Project Invite, Task Assigned, Faculty Feedback)
  │
  ▼
Business Logic Controller (courseController, projectController, etc.)
  │
  ▼
Centralized NotificationService (createNotification / createBulkNotifications)
  │
  ├───────────────────────────────┐
  ▼                               ▼
MongoDB (Notification Collection)  Socket.IO Server (io.to('user:' + userId).emit('new_notification'))
  │                               │
  ▼                               ▼
REST Polling / Cold Start Hydration  Real-Time User Delivery (Navbar Bell + Live Badge)
```

### 2. Supported Notification Event Triggers

| Event Trigger | Recipient Target | Trigger Action |
|---|---|---|
| `project_invitation` | Invited Student | Project owner sends team invitation |
| `task_assignment` | Assigned Member | Task created or assigned to project member |
| `assignment_created` | Enrolled Students (Bulk) | Faculty publishes new assignment |
| `faculty_feedback` | Submitting Student | Faculty grades submission and provides score & remarks |
| `course_announcement` | Enrolled Students | Course instructor posts broadcast update |
| `system` | Single / All Users | Account/profile updates and system alerts |

### 3. REST Notification Endpoints

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Retrieve paginated notifications for current user |
| `GET` | `/api/notifications/unread-count` | Authenticated | Instant query for unread notification count |
| `PATCH` | `/api/notifications/:id/read` | Authenticated (Owner only) | Mark specific notification as read |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Mark all user notifications as read |
| `DELETE` | `/api/notifications/:id` | Authenticated (Owner only) | Delete notification document |

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
# Run all tests across monorepo (104 tests total: 78 backend + 26 frontend)
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
