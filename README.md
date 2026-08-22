# CampusFlow 🎓 (v1.7.0 — Final Release)

> **Enterprise-Grade Unified Academic & Student Career Platform** — Real-Time Collaboration, Academic Courses & Assignments, Kanban Workspaces, Live Socket.IO Chat, Dynamic Resume Builder & PDF Export, Career Placement Pipeline & DSA Tracking, Moderation Admin Panel, and Automated CI/CD.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![Version: v1.7.0](https://img.shields.io/badge/Version-v1.7.0-indigo.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/releases)
[![Tests: 199/199 Passed](https://img.shields.io/badge/Tests-199%2F199%20Passed%20(100%25)-emerald.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Docker: Ready](https://img.shields.io/badge/Docker-Compose%20Ready-sky.svg)](https://www.docker.com/)

---

## 📌 Executive Summary

**CampusFlow** is a modern, unified full-stack MERN platform built to streamline the academic and career lifecycle for universities and colleges. It replaces fragmented third-party tools with a single, high-performance, secure, and reactive application.

```text
                               ┌────────────────────────┐
                               │   CampusFlow v1.7.0    │
                               │ Unified Academic Hub   │
                               └───────────┬────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│   Student Flow   │             │   Faculty Flow   │             │    Admin Flow    │
├──────────────────┤             ├──────────────────┤             ├──────────────────┤
│ • Registration   │             │ • Secure Login   │             │ • Admin Auth     │
│ • Profile & Bio  │             │ • Faculty Studio │             │ • Platform Stats │
│ • Course Explore │             │ • Course Creation│             │ • User Directory │
│ • Assignments    │             │ • Assignment Mgmt│             │ • Moderation     │
│ • Kanban & Chat  │             │ • Submissions    │             │ • Account Lock   │
│ • Notifications  │             │ • Score & Grade  │             │ • Activity Audit │
│ • Placement & DSA│             │ • Performance    │             │ • System Reports │
│ • PDF Resume Gen │             │ • Announcement   │             │ • Health Monitor │
│ • Analytics KPIs │             │ • Analytics View │             │ • System Config  │
└──────────────────┘             └──────────────────┘             └──────────────────┘
```

---

## 🌟 Multi-Persona Feature Matrix

### 👨‍🎓 For Students
- **Academic Hub**: Browse published courses, enroll with one click, explore syllabus modules, and view faculty office hours.
- **Assignment Submissions**: Submit text/files before deadlines with automated validation, late flags, score history, and faculty feedback.
- **Project Collaboration & Kanban**: Create project workspaces, invite teammates, organize tasks across a 3-column Kanban board (`TODO`, `IN_PROGRESS`, `DONE`), and track project activity logs.
- **Real-Time Project Chat**: Persistent Socket.IO room chat with typing indicators, online member presence, and full message history.
- **Centralized Notifications**: Real-time notifications for project invitations, task assignments, grading feedback, and course announcements.
- **Placement & DSA Prep**: Track solved coding problems across topics (Arrays, Trees, DP, Graphs) and manage job applications across a 5-stage pipeline (`APPLIED` ➔ `OA` ➔ `TECHNICAL` ➔ `HR` ➔ `OFFER` / `REJECTED`).
- **Dynamic Resume Builder**: Auto-fill resumes from profile and project history, customize ATS templates (Modern Single-Column & Executive Split), and export print-ready vector PDFs.
- **Data-Driven Analytics**: Visual charts showing assignment completion rates, DSA streaks, grade trends, and application pipeline conversions.

### 👩‍🏫 For Faculty
- **Course Studio**: Create, edit, and publish courses with custom department, semester, credits, capacity limits, and structured syllabi.
- **Assignment Management**: Post assignments with total points, deadlines, and attachment links.
- **Submissions & Grading**: Review student submissions with late status badges, grade scores validated against total points, and provide structured feedback.
- **Class Analytics**: View enrollment counts, submission turnaround times, and class performance averages.

### 🛡️ For Administrators
- **Executive KPI Dashboard**: Real-time aggregated statistics across Users, Students, Faculty, Courses, Projects, and Assignments.
- **User Directory Governance**: Paginated user table with role filters, keyword search, user account suspension/reactivation, and admin self-lockout guards.
- **Content Moderation**: Moderate courses and projects, update publishing status, and remove inappropriate content.
- **System Activity & Audit Stream**: Real-time audit logs of registration events, course updates, and system activities.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, TanStack Query v5, Axios, React Router v6, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js (v20+), Express.js, Socket.IO, Mongoose 8, Zod, JWT (Access + Refresh Rotation), bcryptjs, Helmet, Compression |
| **Database** | MongoDB 7.0 (Mongoose schemas, compound indexes, text search, aggregation pipelines) |
| **Containerization** | Docker, Multi-Stage Builds, Nginx Alpine, Docker Compose |
| **CI/CD & DevOps** | GitHub Actions (`.github/workflows/ci.yml`), Gzip Compression, Rate Limiting, MongoSanitize |

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **MongoDB**: Local MongoDB instance on `mongodb://127.0.0.1:27017` or Docker

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kubervaidya24-max/CAMPUSFLOW.git
cd CAMPUSFLOW
npm run install:all
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Run in Development Mode
```bash
npm run dev
```
- **Client Application**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🐳 Docker Single-Command Production Deployment

Launch the entire full-stack cluster (MongoDB 7.0 + Backend API + Nginx Static Frontend) with Docker Compose:

```bash
docker compose up -d --build
```
- **Web Application (Nginx)**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Quality Engineering

Comprehensive testing architecture documented in [docs/testing.md](file:///e:/CAMPUSFLOW/docs/testing.md).

```bash
# Run all tests across monorepo (199 tests total: 158 backend + 41 frontend across 28 test suites)
npm run test

# Run backend integration, unit, E2E, and security tests (16 suites, 158 tests)
npm run test:server

# Run frontend component and smoke tests (12 suites, 41 tests)
npm run test:client

# Run ESLint across all workspaces (0 errors, 0 warnings)
npm run lint

# Production client bundle compilation (32.82 kB entry chunk)
npm run build
```

---

## 🔒 Security Hardening Certifications

Comprehensive security audit documented in [docs/security.md](file:///e:/CAMPUSFLOW/docs/security.md).

- **NoSQL Injection Neutralization**: Global `sanitize` middleware recursively stripping `$` and `.` MongoDB operator characters.
- **Rate Limiting Protection**: `authLimiter` (15 req/15m) on authentication routes and `apiLimiter` (1000 req/15m) globally.
- **IDOR Multi-Tenant Isolation**: Private resources (resumes, job applications, submissions) strictly bound to `req.user._id`.
- **Privilege Escalation Defense**: Strict server-side RBAC (`authorize('faculty')`, `authorize('admin')`) and immediate token rejection for suspended users (`isActive: false`).
- **Sensitive Field Stripping**: Schema serialization `toJSON` hooks stripping `password` and `refreshToken`.
- **Payload Limit Caps**: 2MB body parser limits preventing payload exhaustion DoS.

---

## ⚡ Performance Benchmark Certifications

Comprehensive performance audit documented in [docs/performance.md](file:///e:/CAMPUSFLOW/docs/performance.md).

- **Route Code-Splitting**: React.lazy() route splitting reduced initial entry bundle from **684.95 kB** to **32.82 kB** (**-95.2% size reduction**).
- **HTTP Payload Compression**: Automatic Gzip/Deflate compression via `compression` middleware saving ~75% wire bandwidth.
- **POJO Query Projections**: Plain object `.lean()` projections bypassing Mongoose hydration for 30%–40% faster read latency.
- **Index Deduplication**: Cleaned schema index declarations for optimal B-tree write throughput.
- **Socket Lifecycle & Presence**: Real-time room presence tracking with automated cleanup on client disconnect.

---

## 📜 Complete Release History

See [CHANGELOG.md](file:///e:/CAMPUSFLOW/CHANGELOG.md) for full milestone progression from Level 0 (`v0.1.0`) to Level 16 (`v1.7.0`).

---

## 📄 License & Authorship

Distributed under the **MIT License**. Created with precision for academic excellence.
