# CampusFlow 🎓

> **Unified Platform for College Students** — Academics, Deliverables, Team Projects & Kanban, Placement Prep & Career Growth.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Rotation-emerald.svg)](https://jwt.io/)
[![Courses](https://img.shields.io/badge/Courses-Syllabus%20%2B%20Enrollment-blueviolet.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)
[![Assignments](https://img.shields.io/badge/Assignments-Submissions%20%26%20Grading-sky.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)
[![Projects](https://img.shields.io/badge/Projects-Kanban%20%26%20Collab-emerald.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)

---

## 📌 Project Overview

**CampusFlow** is a modern, full-stack MERN platform built to unify every phase of a student's collegiate journey. It replaces disconnected tools with a single, cohesive workspace for academic courses, assignment submissions, collaborative project workspaces with interactive Kanban boards, placement preparation, and dynamic resume building.

---

## 🏗️ Architecture & Monorepo Structure

```
campusflow/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, TanStack Query, Axios)
│   ├── public/                 # Static assets (Favicon, SVG logos)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, CourseCard, AssignmentCard, ProjectCard, KanbanBoard, ProtectedRoute)
│   │   ├── context/            # Global AuthContext & session restore provider
│   │   ├── pages/              # Route pages (Landing, Login, Register, Dashboard, Profile, EditProfile, Courses, CourseDetails, CourseEditor, Assignments, AssignmentDetails, AssignmentEditor, Projects, ProjectDetails, ProjectEditor, NotFound)
│   │   ├── services/           # Axios API clients (authService, userService, courseService, assignmentService, projectService)
│   │   ├── tests/              # Frontend smoke, auth, guard, profile, course, assignment, and project tests (19 tests)
│   │   ├── App.jsx             # Root routing & AuthProvider wrapper
│   │   ├── index.css           # Tailwind base styles & glassmorphism tokens
│   │   └── main.jsx            # React 18 DOM mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, Mongoose, Zod, JWT)
│   ├── src/
│   │   ├── config/             # Environment variables (env.js) & MongoDB connection (db.js)
│   │   ├── controllers/        # Request handlers (auth, user, course, assignment, submission, project, task, health)
│   │   ├── middleware/         # Error handling, 404, JWT authentication, role authorization, validation
│   │   ├── models/             # Mongoose schemas (User, Course, Assignment, Submission, Project, Task, ProjectActivity)
│   │   ├── routes/             # Express API routes (/api/auth, /api/users, /api/courses, /api/assignments, /api/submissions, /api/projects, /api/tasks, /api/health)
│   │   ├── utils/              # Standardized API response, ApiError class, cookie helpers
│   │   ├── validators/         # Zod schemas (authValidators, userValidators, courseValidators, assignmentValidators, projectValidators)
│   │   ├── app.js              # Express app setup & middleware pipeline (Helmet, CORS, Morgan, CookieParser)
│   │   └── server.js           # Server bootstrap & graceful lifecycle manager
│   ├── tests/                  # Backend Supertest integration test suite with MongoMemoryServer (61 tests)
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
| Level 6 | Placement Preparation & Practice Sheets | *Upcoming* |
| Level 7 | Dynamic ATS Resume Builder | *Upcoming* |
| Level 8 | Analytics, Admin Dashboard & Production Hardening | *Upcoming* |

---

## 🗂️ Level 5 Project Collaboration Subsystem

### 1. Capabilities & Workflow
- **Collaborative Project Workspaces**:
  - Create and configure software projects with title, description, tech stack tags, repository URL, and live demo links.
  - Team management: invite collaborators via email, accept/reject pending invitations, remove members (owner only), or leave project.
- **Interactive 3-Column Kanban Board**:
  - Organize tasks into **TODO**, **IN PROGRESS**, and **DONE**.
  - Create tasks with priority indicators (`Low`, `Medium`, `High`, `Urgent`), deadlines, assignees, and descriptions.
  - Quick status progression buttons persist directly to the database.
- **Activity Audit Feed**:
  - Automatically records all events: `PROJECT_CREATED`, `INVITATION_SENT`, `MEMBER_JOINED`, `MEMBER_REMOVED`, `MEMBER_LEFT`, `TASK_CREATED`, `TASK_MOVED`, `TASK_COMPLETED`, and `TASK_DELETED`.

### 2. Available Project & Task APIs

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/projects` | Protected | Create new project |
| `GET` | `/api/projects` | Protected | List user's projects or pending invitations |
| `GET` | `/api/projects/:id` | Member / Admin | Retrieve project workspace details |
| `PATCH` | `/api/projects/:id` | Owner / Lead | Update project metadata |
| `DELETE` | `/api/projects/:id` | Owner / Admin | Delete project, tasks, and activities |
| `POST` | `/api/projects/:id/invitations` | Owner / Lead | Invite a collaborator by email |
| `POST` | `/api/projects/:id/invitations/respond` | Protected | Accept or decline invitation |
| `DELETE` | `/api/projects/:id/members/:userId` | Owner / Admin | Remove a team member |
| `POST` | `/api/projects/:id/leave` | Member | Leave project team |
| `POST` | `/api/projects/:id/tasks` | Member | Create task in project |
| `GET` | `/api/projects/:id/tasks` | Member | Get all tasks for project |
| `PATCH` | `/api/tasks/:id` | Member | Update task details |
| `PATCH` | `/api/tasks/:id/status` | Member | Move task status (`TODO` / `IN_PROGRESS` / `DONE`) |
| `DELETE` | `/api/tasks/:id` | Member | Delete task |
| `GET` | `/api/projects/:id/activities` | Member | Retrieve project activity feed |

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
# Run all tests across monorepo (80 tests total: 61 backend + 19 frontend)
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
