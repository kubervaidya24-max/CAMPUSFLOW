# CampusFlow — Comprehensive Security Audit & Hardening Report

This document presents the defensive security audit of **CampusFlow**, inspecting Authentication, Authorization, Input Validation, NoSQL Injection, XSS, CSRF, CORS, Rate Limiting, File Uploads, IDOR, Sensitive Data Exposure, and Error Handling.

Each section follows the standard audit progression:
**CURRENT SECURITY** ➔ **PROBLEM** ➔ **FIX** ➔ **WHY**.

---

## 1. Authentication & Session Security

### Current Security
- Password hashing with `bcryptjs` (salt rounds: 12).
- Dual JWT architecture: short-lived Access Token (15m) and long-lived Refresh Token (7d).
- Refresh tokens stored in MongoDB with expiration timestamps and issued via signed HTTP-only cookies (`httpOnly: true`, `sameSite: 'lax'`, `secure: production`).

### Problem
- Repeated unconstrained authentication requests (login/registration) were susceptible to automated brute-force password guessing and credential-stuffing attacks.

### Fix
- Implemented `authLimiter` middleware via `express-rate-limit` capping authentication endpoints (`/api/auth/login` and `/api/auth/register`) to 15 attempts per 15-minute window per IP.

### Why
- Eliminates automated password dictionary attacks and credential stuffing without interfering with normal user sessions.

---

## 2. NoSQL & MongoDB Operator Injection Defense

### Current Security
- Strict payload validation using Zod schemas on all API endpoints.

### Problem
- Express body parsing allows nested JSON structures where malicious keys containing MongoDB operator syntax (such as `"$gt"`, `"$ne"`, or `"."`) could be passed in query parameters or request bodies to bypass filtering logic if passed directly to Mongoose queries.

### Fix
- Implemented recursive `sanitize` middleware (`server/src/middleware/sanitize.js`) mounted globally before all route handlers. The sanitizer automatically strips any object keys beginning with `$` or containing `.` from `req.body`, `req.query`, and `req.params`.

### Why
- Guarantees that query selectors cannot be manipulated into executing unauthorized boolean or evaluation logic inside MongoDB.

---

## 3. Insecure Direct Object References (IDOR) & Multi-Tenant Data Isolation

### Current Security
- Role checks (`student`, `faculty`, `admin`) enforced via route middleware.

### Problem
- A malicious authenticated user (Student A) could attempt to query or mutate private resources belonging to another user (Student B) by substituting arbitrary MongoDB ObjectIds in URL parameters (e.g. `/api/resumes/:id`, `/api/placements/jobs/:id`, `/api/assignments/:id/submit`).

### Fix
- Every private resource controller binds operations explicitly to `req.user._id`:
  - **Resumes**: `Resume.findOne({ _id: id, user: req.user._id })`
  - **Job Applications**: `JobApplication.findOne({ _id: id, user: req.user._id })`
  - **DSA Problems**: `DSAProblem.findOne({ _id: id, user: req.user._id })`
  - **Submissions**: Non-owning faculty and non-enrolled students are rejected with `403 Forbidden`.
  - **Projects**: Only project leads can invite/remove members, and only active members can access tasks and chat.

### Why
- Guarantees strict multi-tenant data isolation; valid authentication alone is never sufficient without verified resource ownership.

---

## 4. Role-Based Privilege Escalation & Admin Route Protection

### Current Security
- Frontend routes guarded with React `ProtectedRoute` components.

### Problem
- Frontend route protection alone is purely cosmetic. If API endpoints lack server-side authorization guards, a student could send raw HTTP requests to create courses, grade submissions, or access admin analytics.

### Fix
- Enforced server-side `authorize('faculty')` and `authorize('admin')` middleware on all administrative and academic routes.
- Added suspension verification in `authenticate` middleware: suspended users (`isActive: false`) are immediately locked out from all APIs and login attempts.
- Added admin self-lockout guard preventing administrators from suspending or demoting their own active accounts.

### Why
- Provides defense-in-depth where server-side authorization is the sole source of truth.

---

## 5. Denial of Service (DoS) & Payload Size Caps

### Current Security
- Global Express body parser was accepting payloads up to `10mb`.

### Problem
- Unrestricted large JSON payloads could exhaust server memory buffers and CPU resources during high concurrency.

### Fix
- Lowered default body parser limits to `2mb` (`express.json({ limit: '2mb' })` and `express.urlencoded({ limit: '2mb' })`).
- Mounted `apiLimiter` globally across `/api` allowing 1000 requests per 15 minutes per IP.

### Why
- Prevents resource exhaustion attacks while comfortably accommodating structured resume and project payloads.

---

## 6. Sensitive Data Exposure & Response Sanitization

### Current Security
- Passwords are encrypted before database insertion.

### Problem
- Model queries returning user documents could inadvertently include password hashes, refresh token histories, or internal fields in JSON responses.

### Fix
- Configured Mongoose schema `toJSON` transform on `User` model:
  ```javascript
  transform(doc, ret) {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  }
  ```
- Password field configured with `select: false` or stripped during query projection.

### Why
- Prevents accidental credential or session token leakage across all user-facing endpoints.

---

## 7. Error Handling & Stack Trace Leaks

### Current Security
- Centralized `errorHandler` middleware.

### Problem
- Uncaught exceptions or database errors displaying raw stack traces to end users could reveal database schema names, internal file paths, and library versions.

### Fix
- `errorHandler.js` checks `config.isProduction`:
  - Mongoose `CastError` and `ValidationError` are transformed into standardized, user-friendly `400 Bad Request` messages.
  - Raw error stack traces are strictly stripped in production environments.

### Why
- Prevents information disclosure while providing structured error responses for client applications.

---

## 8. HTTP Headers & Cross-Origin Resource Sharing (CORS)

### Current Security
- `helmet` and `cors` installed.

### Problem
- Default HTTP headers can leak server technology details (`X-Powered-By`) and allow clickjacking or MIME-type sniffing.

### Fix
- Configured Helmet with explicit `Cross-Origin-Resource-Policy` (`cross-origin`).
- CORS origin restricted to configured environment origins (e.g. `http://localhost:5173`) with `credentials: true`.

### Why
- Hardens the HTTP communication channel against clickjacking, MIME sniffing, and unauthorized cross-origin requests.

---

## 9. Threat & Verification Matrix

| Vector / Threat | Mitigation Implemented | Verified in Test Suite |
|---|---|---|
| **NoSQL Operator Injection** | `sanitize.js` recursive key stripper | `server/tests/security.test.js` |
| **Authentication Brute Force** | `authLimiter` rate limiter | `server/tests/security.test.js` |
| **IDOR (Resumes & Placements)** | `req.user._id` query binding | `server/tests/security.test.js` |
| **Privilege Escalation** | `authorize` RBAC middleware | `server/tests/security.test.js` |
| **Suspended Account Access** | Immediate token rejection guard | `server/tests/security.test.js` |
| **Malformed ObjectId Crashes** | CastError normalization (400 Bad Request) | `server/tests/security.test.js` |
| **Sensitive Data Exposure** | `toJSON` transform stripping hashes | `server/tests/security.test.js` |
