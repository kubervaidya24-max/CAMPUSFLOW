# CampusFlow Setup & Developer Guide

## Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version >= 20.x or 22.x)
- [npm](https://www.npmjs.com/) (Version >= 10.x)
- [MongoDB](https://www.mongodb.com/) (Local installation or Docker)

---

## 1. Installation

From the repository root:

```bash
npm install
```

This installs dependencies across the root, `client`, and `server` packages simultaneously via npm workspaces.

---

## 2. Environment Setup

Copy example environment files to their respective destinations:

```bash
# In server/
cp server/.env.example server/.env

# In client/
cp client/.env.example client/.env
```

### Server Configuration Options (`server/.env`)
- `PORT`: Port the Express server listens on (default: `5000`)
- `NODE_ENV`: Runtime mode (`development`, `test`, `production`)
- `MONGODB_URI`: Connection string for MongoDB (default: `mongodb://127.0.0.1:27017/campusflow`)
- `CORS_ORIGIN`: Allowed origin for CORS (default: `http://localhost:5173`)

### Client Configuration Options (`client/.env`)
- `VITE_API_URL`: Base URL for the backend API (default: `http://localhost:5000/api`)

---

## 3. Database Setup

### Option A: Using Docker (Recommended for quick local testing)
```bash
docker compose up -d mongodb
```

### Option B: Local MongoDB Service
Ensure your local MongoDB daemon (`mongod`) is running on `mongodb://127.0.0.1:27017`.

---

## 4. Running the Application

### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

### Running Backend Only
```bash
npm run dev:server
```

### Running Frontend Only
```bash
npm run dev:client
```

---

## 5. Verification & Tests

### Run Full Test Suite
```bash
npm run test
```

### Backend Integration Tests
```bash
npm run test:server
```

### Frontend Smoke Tests
```bash
npm run test:client

### Build Production Bundle
```bash
npm run build
```
