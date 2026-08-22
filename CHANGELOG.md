# CampusFlow — Changelog & Release History

All notable changes to the **CampusFlow** unified student & academic collaboration platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.8.0] — 2026-08-23 (Level 16 — Admin-Managed Must-to-Do DSA Sheet)

### Added
- **Global Curated Must-to-Do DSA Sheet**:
  - `DSASheet` Model: Singleton shared curriculum (`slug: 'must-to-do'`) created, curated, reordered, and published exclusively by authorized Admin users.
  - `DSASheetProgress` Model: Isolated per-user progress records (`NOT_STARTED`, `ATTEMPTED`, `SOLVED`, `attemptedAt`, `solvedAt`) with unique compound index `{ user: 1, sheet: 1, questionId: 1 }`.
  - **Cascade Cleanup**: Admin question deletion automatically purges all associated user progress records.
  - **Sparse Persistence**: Questions default to `NOT_STARTED` with 0 database records stored; transitioning to `NOT_STARTED` automatically deletes the progress document.
  - **Authenticated User Endpoints**: `GET /api/placements/sheet` and `PATCH /api/placements/sheet/progress/:questionId`.
  - **Admin Management Endpoints**: `GET /api/admin/dsa-sheet`, `PATCH /api/admin/dsa-sheet`, `PATCH /api/admin/dsa-sheet/publish`, `POST /api/admin/dsa-sheet/questions`, `PATCH /api/admin/dsa-sheet/questions/:id`, `DELETE /api/admin/dsa-sheet/questions/:id`, `PATCH /api/admin/dsa-sheet/questions/reorder`.
  - **Student Placement Hub Tab**: `⭐ Must-to-Do DSA Sheet` with live progress scorecard, difficulty/topic breakdown, multi-attribute filter bar, and safe `[Solve ↗]` external problem launcher.
  - **Admin Command Center Tab**: `⭐ DSA Sheet` management tab with live publish/unpublish toggle, add/edit question modals, and question table.
  - **Automated Tests**: Comprehensive backend test suite (`server/tests/dsaSheet.test.js`) certifying RBAC and multi-user progress isolation, plus frontend integration tests (`client/src/tests/dsaSheet.test.jsx`).

---

## [1.7.0] — 2026-08-23 (Final Release)

### Added
- **Final Product Integration & UX Polish**:
  - Unified color token system, dark-mode glassmorphism styling, and responsive layout across all 20 pages.
  - Actionable empty states with contextual CTA routing for Courses, Assignments, Projects, Placement, and Resume modules.
  - Interactive toast feedback, loading skeleton fallbacks, and Error Boundary wrappers.
- **Milestone Version Tag**: Updated platform branding to `v1.7.0`.

---

## [1.6.0] — 2026-08-23 (Productionization & CI/CD Pipeline)

### Added
- **Multi-Stage Docker Containers**:
  - `server/Dockerfile`: Multi-stage Node 20-Alpine image running as unprivileged `node` user with automated `/api/health` healthcheck.
  - `client/Dockerfile` & `client/nginx.conf`: Multi-stage build with Nginx Alpine server, SPA fallback routing, reverse proxy for `/api/` and `/socket.io/`, Gzip, and security headers.
- **Container Orchestration**: `docker-compose.yml` and `docker-compose.prod.yml` coordinating MongoDB 7.0, Backend API, and Nginx Client.
- **GitHub Actions CI/CD Pipeline**: `.github/workflows/ci.yml` running linting, backend tests, frontend tests, and production build on push/PR.
- **Environment Templates**: `.env.example`, `server/.env.example`, `client/.env.example`.
- **Operations Guide**: `docs/deployment.md` covering Docker Compose, Let's Encrypt SSL, and MongoDB Atlas configuration.

---

## [1.5.0] — 2026-08-23 (Performance & Scalability Optimization)

### Added & Optimized
- **Route Code-Splitting**: React `lazy()` and `<Suspense>` route splitting reducing initial client entry bundle from `684.95 kB` to `32.82 kB` (**-95.2% payload reduction**).
- **HTTP Payload Compression**: `compression` middleware with Gzip/Deflate saving ~75% wire bandwidth.
- **Database POJO Serialization**: `.lean()` projections applied across list and message history queries for 30%–40% faster read latency.
- **Schema Index Deduplication**: Cleaned redundant index declarations in `Course.js` and `Assignment.js`.
- **Performance Report**: Comprehensive documentation in `docs/performance.md`.

---

## [1.4.0] — 2026-08-22 (Defensive Security Audit & Hardening)

### Security Hardening
- **NoSQL Injection Neutralization**: Recursive `sanitize` middleware stripping `$` and `.` operators.
- **Rate Limiting Protection**: `authLimiter` (15 req/15m) and `apiLimiter` (1000 req/15m).
- **IDOR Multi-Tenant Isolation**: Query bindings to `req.user._id` across Resumes, Placements, and Submissions.
- **Privilege Escalation Defense**: Strict server-side RBAC and real-time suspended account token invalidation.
- **Sensitive Field Stripping**: `toJSON` hooks stripping `password` and `refreshToken`.
- **Security Audit Report**: Detailed audit in `docs/security.md`.
- **Security Test Suite**: Dedicated `server/tests/security.test.js` (17 tests).

---

## [1.3.0] — 2026-08-22 (Comprehensive Testing & Quality Engineering)

### Added
- **Unit Test Suites**: `validators.unit.test.js` (15 tests) and `utils.unit.test.js` (8 tests).
- **End-to-End User Journey**: `e2e.test.js` (10-step full workflow from registration to grading and administration).
- **Testing Pyramid Documentation**: `docs/testing.md`.

---

## [1.2.0] — 2026-08-22 (Admin Panel & Platform Moderation)

### Added
- **Admin Dashboard**: Real-time aggregated statistics (Users, Faculty, Students, Courses, Projects, Assignments).
- **User Management**: Paginated directory, role filtering, search, and user suspension/reactivation.
- **Course & Project Moderation**: Inappropriate content removal and status updates.
- **System Audit Logs**: Audit stream for system events and registration history.

---

## [1.1.0] — 2026-08-22 (Data-Driven Analytics Dashboards)

### Added
- **Student Analytics**: Course progress, assignment submissions, average grade scores, DSA problems solved, placement pipeline counts.
- **Project Analytics**: Task status breakdown, member contributions, and completion velocity.
- **Placement Analytics**: Application funnel conversion rates and rejection analytics.

---

## [1.0.0] — 2026-08-22 (Dynamic Resume Builder & PDF Export)

### Added
- **Resume Builder**: Multi-section resume editor (Education, Experience, Projects, Skills, Certifications, Achievements).
- **Profile & Project Auto-Fill**: Auto-populates resume drafts from student profile and active project portfolios.
- **Resume Templates**: Modern Single-Column & Executive Split (Dual Column) layouts.
- **Client-Side PDF Export**: Print-ready vector styling for instant PDF generation.

---

## [0.9.0] — 2026-08-22 (Placement Preparation & Job Pipeline)

### Added
- **DSA Problem Tracker**: Topic categorizations (Arrays, DP, Graphs, Trees, etc.), platform tracking, difficulty ratings, daily streak counter.
- **Job Application Pipeline**: Visual 5-stage funnel (`APPLIED` ➔ `OA` ➔ `TECHNICAL` ➔ `HR` ➔ `OFFER` / `REJECTED`).
- **Dynamic Analytics**: Non-hardcoded topic mastery calculations.

---

## [0.8.0] — 2026-08-22 (Centralized Notification System)

### Added
- **Notification Service**: Centralized dispatch for invitations, tasks, announcements, chat mentions, and grading feedback.
- **Real-Time Delivery**: Socket.IO direct push notifications.
- **Notification Bell & Panel**: Unread badge count, filter tabs, mark-as-read, and mark-all-as-read.

---

## [0.7.0] — 2026-08-22 (Real-Time Project Chat)

### Added
- **Persistent Socket.IO Chat**: Project chat rooms, typing indicators, member presence tracking, and MongoDB persistence.
- **Room Authorization**: Validates project membership before room subscription.

---

## [0.6.0] — 2026-08-22 (Project Collaboration & Kanban Board)

### Added
- **Project Workspaces**: Project creation, repository links, tech stack tags, deadlines.
- **Team Management**: Invitations, accept/reject workflows, member removal, project departure.
- **Interactive Kanban Board**: 3-column drag-and-drop task workflow (`TODO`, `IN_PROGRESS`, `DONE`) with priority tagging.

---

## [0.5.0] — 2026-08-22 (Assignment & Submission Management)

### Added
- **Faculty Assignment Studio**: Assignment creation, deadlines, total points, file attachments.
- **Student Submissions**: Text and attachment submissions, deadline enforcement, late submission tracking.
- **Faculty Grading Subsystem**: Scoring with validation against max points and structured feedback comments.

---

## [0.4.0] — 2026-08-22 (Academic Course Management)

### Added
- **Course Catalog**: Course creation, department/semester filtering, keyword search, capacity enforcement.
- **Enrollment Flow**: One-click student enrollment and course departure.

---

## [0.3.0] — 2026-08-22 (User Profiles & Identity)

### Added
- **Role-Specific Profiles**: Student attributes (collegeId, department, semester, skills, social links) and Faculty attributes (designation, subjects, office location).
- **Public & Private Profile Pages**: Interactive skill tags, editable bio, social profiles.

---

## [0.2.0] — 2026-08-22 (Authentication & Session Architecture)

### Added
- **Dual JWT Auth**: Short-lived access tokens (15m) + HTTP-only refresh tokens (7d) in signed cookies.
- **Role-Based Access Control**: `student`, `faculty`, and `admin` roles.
- **Zod Request Validation**: Strict validation across registration and login.

---

## [0.1.0] — 2026-08-22 (Platform Foundation)

### Added
- **MERN Monorepo Architecture**: Express backend + React 18 / Vite frontend + TailwindCSS design system.
- **Database & Health Infrastructure**: MongoDB Mongoose connection and `/api/health` monitoring probe.
