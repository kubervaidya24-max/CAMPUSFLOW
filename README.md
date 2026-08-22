# CampusFlow 🎓

> **Unified Platform for College Students** — Academics, Projects, Messaging, Placement Prep & Career Growth.

[![CampusFlow CI](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml/badge.svg)](https://github.com/kubervaidya24-max/CAMPUSFLOW/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v20%2B-emerald.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)

---

## 📌 Project Overview

**CampusFlow** is a modern, full-stack MERN platform built to unify every phase of a student's collegiate journey. It replaces disconnected tools (chat apps, cloud drives, isolated spreadsheets) with a single, highly cohesive workspace for course management, team project tracking, real-time collaboration, placement preparation, and dynamic resume building.

---

## 🏗️ Architecture & Monorepo Structure

The project is architected as an **npm workspaces** monorepo:

```
campusflow/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, TanStack Query)
│   ├── public/                 # Static assets (Favicon, logos)
│   ├── src/
│   │   ├── components/         # Reusable UI & Layouts (Navbar, Footer, ErrorBoundary)
│   │   ├── pages/              # Route pages (LandingPage, NotFoundPage)
│   │   ├── services/           # Axios API client & endpoints (healthService)
│   │   ├── tests/              # Frontend smoke and unit tests
│   │   ├── App.jsx             # Root routing & context wrapper
│   │   ├── index.css           # Tailwind base styles & custom design tokens
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, Mongoose, Socket.IO)
│   ├── src/
│   │   ├── config/             # Environment variables & MongoDB connection
│   │   ├── controllers/        # Request handlers (healthController)
│   │   ├── middleware/         # Error handling, 404, auth, validation
│   │   ├── models/             # Mongoose schemas (Level 1+)
│   │   ├── routes/             # Express API routes (/api/health, /api/...)
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # Standardized API response & ApiError classes
│   │   ├── validators/         # Zod request validation schemas
│   │   ├── app.js              # Express app setup & middleware pipeline
│   │   └── server.js           # Server bootstrap & graceful lifecycle manager
│   ├── tests/                  # Backend Supertest integration test suite
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

## 🚀 Status: Level 0 (Project Foundation)

| Level | Feature Scope | Status |
|---|---|---|
| **Level 0** | **Monorepo Foundation, Express Server, Vite Client, Health API & CI** | **Completed** ✅ |
| Level 1 | Authentication (JWT, Refresh Tokens, bcrypt, Zod validation) | *Upcoming* |
| Level 2 | User Profiles & Role-Based Access Control (RBAC) | *Upcoming* |
| Level 3 | Academic & Course Management | *Upcoming* |
| Level 4 | Assignments, Submissions & Kanban Tasks | *Upcoming* |
| Level 5 | Project Collaboration & Real-Time Chat (Socket.IO) | *Upcoming* |
| Level 6 | Placement Preparation & Practice Sheets | *Upcoming* |
| Level 7 | Dynamic ATS Resume Builder | *Upcoming* |
| Level 8 | Analytics, Admin Dashboard & Production Hardening | *Upcoming* |

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

Run all automated test suites across the monorepo:

```bash
# Run all tests (Server + Client)
npm run test

# Run backend tests only
npm run test:server

# Run frontend tests only
npm run test:client

# Production client build test
npm run build
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
