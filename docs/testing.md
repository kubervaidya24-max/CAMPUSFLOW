# CampusFlow — Comprehensive Testing Strategy & Quality Assurance

This document defines the automated testing architecture, testing pyramid, mocking standards, and quality verification workflows established across the **CampusFlow** monorepo.

---

## 1. Testing Philosophy & Test Pyramid

CampusFlow employs a three-tier testing strategy designed to achieve maximum confidence, zero flakiness, and high execution speed.

```
                  ┌───────────────────────────────┐
                  │      E2E Critical Journeys    │  (10-Step Full Monorepo Workflow)
                  │      (server/tests/e2e.test)  │
                  ├───────────────────────────────┤
                  │    Integration Test Suites    │  (Auth, Users, Courses, Assignments,
                  │   (12 Server + 12 Client)     │   Projects, Chat, Notifications,
                  │                               │   Placements, Resumes, Analytics, Admin)
                  ├───────────────────────────────┤
                  │     Unit Tests & Validators   │  (Zod Schemas, API Utilities, Token
                  │   (Validators, Utils, Helpers)│   Generators, Business Logic Helpers)
                  └───────────────────────────────┘
```

---

## 2. Test Suites Overview

### A. Backend Test Suites (`server/tests/`)
1. **`health.test.js`**: Service liveness, database connectivity check, and memory consumption.
2. **`auth.test.js`**: Registration, login, bcrypt verification, access token issuance, refresh token rotation, and cookie security.
3. **`user.test.js`**: Profile retrieval, profile updates, department/semester assignments, and avatar selection.
4. **`course.test.js`**: Course creation, syllabus item parsing, capacity constraints, publication workflow, and student enrollment/leaving.
5. **`assignment.test.js`**: Assignment creation, deadline enforcement (`allowLate`), student submission, and faculty scoring & feedback.
6. **`project.test.js`**: Project workspaces, team invitations, member removal, and Kanban task transitions (`TODO` ➔ `IN_PROGRESS` ➔ `DONE`).
7. **`chat.test.js`**: Socket.IO JWT handshake auth, room authorization guards, real-time broadcast, and MongoDB message persistence.
8. **`notification.test.js`**: Centralized notification delivery, unread counter badge, targeted socket delivery, and mark-all-as-read.
9. **`placement.test.js`**: DSA problem tracking, daily streak calculation, topic mastery aggregations, and 6-stage Job Application pipeline.
10. **`resume.test.js`**: Profile & Project auto-fill extraction engine, modern and dual-column layouts, and data isolation.
11. **`analytics.test.js`**: Optimized MongoDB aggregations (`$match`, `$group`, `$facet`, `$lookup`) for student, project, and placement metrics.
12. **`admin.test.js`**: Server-side RBAC guards (`authorize('admin')`), paginated user directory, account suspension lockout, and content moderation.
13. **`validators.unit.test.js`**: Unit tests verifying Zod payload schemas across all modules.
14. **`utils.unit.test.js`**: Unit tests verifying `ApiError`, `sendSuccess`, token generation, and password hashing.
15. **`e2e.test.js`**: 10-step full critical user journey from registration through admin governance.

### B. Frontend Test Suites (`client/src/tests/`)
1. **`smoke.test.jsx`**: Global layout smoke tests, Navbar, Footer, 404 handler, and Level badges.
2. **`auth.test.jsx`**: Login and Register page forms, validation errors, and authentication state transitions.
3. **`profile.test.jsx`**: Profile rendering and profile editor interactions.
4. **`course.test.jsx`**: Course directory, department filtering, and course details rendering.
5. **`assignment.test.jsx`**: Assignment lists, submission forms, and faculty grading panels.
6. **`project.test.jsx`**: Project list, Kanban 3-column task board, and task move triggers.
7. **`chat.test.jsx`**: Real-time chat box, message bubbles, sending states, and typing indicators.
8. **`notification.test.jsx`**: Navbar notification bell, unread badge counter, and dropdown panel interactions.
9. **`placement.test.jsx`**: DSA practice tracker, streak badge, and visual job pipeline stage columns.
10. **`resume.test.jsx`**: Split-screen resume builder, template switcher, and auto-fill button.
11. **`analytics.test.jsx`**: Analytics dashboard KPI scorecards, progress meters, and tab switching.
12. **`admin.test.jsx`**: Admin command center, paginated tables, suspension toggles, and audit stream.

---

## 3. Mocking & In-Memory Environment

- **Backend (`mongodb-memory-server`)**:
  - Each backend test suite spins up a clean, isolated in-memory MongoDB replica.
  - Zero cross-test pollution with automated `beforeEach` collection purges.
  - Fast execution (under 30s for the entire backend suite).
- **Frontend (`@testing-library/react` + `vitest`)**:
  - Services are mocked with Vitest spies (`vi.fn()`).
  - React Query wrapped in test providers with `{ retry: false }` for deterministic rendering.
  - Simulated User Events with `fireEvent` and `@testing-library/user-event`.

---

## 4. Execution Commands & Quality Gates

```bash
# Run all monorepo test suites (Unit, Integration, E2E)
npm run test

# Run backend test suites only
npm run test:server

# Run frontend test suites only
npm run test:client

# Execute ESLint audit across monorepo (0 errors, 0 warnings required)
npm run lint

# Build production bundle for deployment validation
npm run build
```
