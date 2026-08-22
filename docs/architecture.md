# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Monorepo Design Principles

```mermaid
graph TD
    Client["Client (React 18 + Vite + Tailwind)"] -->|HTTP / REST API| Server["Server (Express.js + Node.js)"]
    Client -->|WebSocket (Level 5)| Server
    Server -->|Mongoose ODM| DB[("MongoDB Database")]
    Server -->|Graceful Lifecycle| OS["Host / Container OS"]
```

### Separation of Concerns:
1. **`client/`**: Pure single-page application (SPA) focused solely on client-side rendering, caching (TanStack Query), state management, and user interface responsiveness.
2. **`server/`**: Stateless REST API and real-time backend implementing middleware pipelines, schema validation, domain controllers, and persistent database management.
3. **`docs/`**: Persistent architectural and operational manuals maintained with every release cycle.

---

## 3. Backend Architecture (`server/`)

### Application Lifecycle
- **`src/app.js`**: Pure Express application setup. Assembles middleware (Helmet, CORS, Morgan, Body Parser), mounts route tables, attaches the 404 handler, and concludes with the centralized error handler. Separation of `app.js` from `server.js` enables Supertest to run tests without binding to real network ports.
- **`src/server.js`**: Dedicated runtime entrypoint. Connects to MongoDB, starts the HTTP server, and registers `SIGINT` / `SIGTERM` listeners for graceful shutdown.

### Response & Error Handling Paradigm
All API endpoints follow a strict JSON payload contract:

#### Success Contract:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

#### Error Contract:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### Error Flow
1. Controllers or services throw standard or custom `ApiError` instances (e.g. `ApiError.badRequest()`, `ApiError.unauthorized()`).
2. Express catches the error and bubbles it down to `errorHandler.js`.
3. Mongoose validation errors, duplicate keys (`11000`), and bad object IDs are normalized automatically into `400 Bad Request` or `409 Conflict`.
4. In production environments (`NODE_ENV=production`), internal stack traces are redacted.

---

## 4. Frontend Architecture (`client/`)

### Key Technologies
- **Vite**: Rapid HMR and optimized ESM bundling.
- **Tailwind CSS**: Utility-first styling with custom theme extensions (glassmorphism, tailored color palettes).
- **TanStack Query (React Query)**: Declarative server state caching, background refetching, and latency measurement.
- **React Router (v6)**: Declarative nested routing with layout templates and catch-all 404 views.
- **Axios**: Centralized HTTP client configured with baseURL fallback and response/error unwrap interceptors.

---

## 5. Security Principles Implemented in Level 0
- **Helmet**: Secures HTTP response headers against clickjacking, sniffing, and cross-site scripting attacks.
- **CORS Configuration**: Restricts API consumption to trusted origins specified via `CORS_ORIGIN`.
- **Environment Isolation**: No credentials or URLs hardcoded; managed through `.env` files with `.env.example` templates.
