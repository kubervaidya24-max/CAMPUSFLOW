# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Authentication & Authorization Architecture (Level 1)

### 2.1 Security & Token Architecture

```mermaid
graph TD
    Client["Client Browser"] -->|1. POST /api/auth/login| Server["Express Server"]
    Server -->|2. Verify bcrypt Hash| DB[("MongoDB (User Model)")]
    Server -->|3. Set HTTP-Only Refresh Cookie + Return Access Token JSON| Client
    Client -->|4. Request with Authorization: Bearer AccessToken| Protected["Protected Endpoints (/api/auth/me)"]
    Client -->|5. Automatic Silent Refresh via Cookie| RefreshEndpoint["/api/auth/refresh"]
    RefreshEndpoint -->|6. Token Rotation & Verification| DB
```

### 2.2 Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client (RegisterPage)
    participant API as Express API (/api/auth/register)
    participant Val as Zod Validator
    participant DB as MongoDB (User Collection)

    User->>Client: Enters Name, Email, Password, Role, Profile
    Client->>API: POST /api/auth/register
    API->>Val: Validate payload schema & password complexity
    Val-->>API: Validated data
    API->>DB: Check if email already exists
    alt Email already taken
        DB-->>API: User found
        API-->>Client: 409 Conflict ("An account with this email already exists")
    else Email available
        API->>API: Hash password with bcryptjs (12 salt rounds)
        API->>API: Generate Access Token (15m) & Refresh Token (7d) with unique jti
        API->>DB: Save User with hashed password & refreshTokens array
        API-->>Client: 201 Created (Set-Cookie: refreshToken + accessToken JSON)
        Client->>Client: Save Access Token in AuthContext & redirect to /dashboard
    end
```

### 2.3 Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client (LoginPage)
    participant API as Express API (/api/auth/login)
    participant DB as MongoDB (User Collection)

    User->>Client: Enters Email & Password
    Client->>API: POST /api/auth/login
    API->>DB: Find User by email (select: +password)
    alt User not found or password mismatch
        API-->>Client: 401 Unauthorized ("Invalid email or password")
    else Credentials valid
        API->>API: Generate Access Token (15m) & new Refresh Token (7d)
        API->>DB: Prune expired tokens and append new refresh token
        API-->>Client: 200 OK (Set-Cookie: refreshToken + accessToken JSON)
        Client->>Client: Update AuthContext state & redirect to /dashboard
    end
```

### 2.4 Silent Refresh & Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    participant Client as React Client (Axios Interceptor)
    participant API as Express API (/api/auth/refresh)
    participant DB as MongoDB

    Client->>API: POST /api/auth/refresh (Cookie: refreshToken)
    API->>API: Verify JWT signature with JWT_REFRESH_SECRET
    API->>DB: Find User & verify token exists in User.refreshTokens
    alt Token missing from DB (Compromise / Reuse detected)
        API->>DB: Invalidate ALL active refresh tokens
        API-->>Client: 401 Unauthorized ("Session compromised. Sign in again.")
    else Token valid
        API->>API: Generate NEW Access Token & NEW rotated Refresh Token
        API->>DB: Remove old refresh token & save new refresh token
        API-->>Client: 200 OK (Set-Cookie: newRefreshToken + newAccessToken)
        Client->>Client: Replay original failed HTTP request seamlessly
    end
```

### 2.5 Logout Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client
    participant API as Express API (/api/auth/logout)
    participant DB as MongoDB

    User->>Client: Clicks Logout
    Client->>API: POST /api/auth/logout (Cookie: refreshToken)
    API->>DB: Pull refresh token from User.refreshTokens
    API-->>Client: 200 OK (Clear-Cookie: refreshToken)
    Client->>Client: Reset AuthContext user = null, token = null & redirect to /login
```

---

## 3. Database Schema: User Model

```
User Schema {
  name: String (required, trim, min: 2, max: 50)
  email: String (required, unique, lowercase, trim, indexed)
  password: String (required, select: false, bcrypt hashed)
  role: Enum ['student', 'faculty', 'admin'] (default: 'student', indexed)
  profile: {
    avatar: String
    bio: String (max: 250)
    department: String
    graduationYear: Number
    collegeId: String
  }
  refreshTokens: [
    {
      token: String (required)
      expiresAt: Date (required)
      createdAt: Date (default: Date.now)
    }
  ]
  createdAt: Date (timestamp)
  updatedAt: Date (timestamp)
}
```

---

## 4. Key Security Decisions

1. **XSS Mitigation**: Long-lived refresh tokens are stored exclusively in `httpOnly`, `secure`, `sameSite: 'lax'` cookies, preventing malicious client scripts from reading them.
2. **Access Token Lifespan**: Short-lived (15 minutes) in-memory tokens minimize the risk window if intercepted.
3. **Token Rotation & Revocation**: Refresh tokens are single-use. Replay detection automatically invalidates all active sessions for that account.
4. **Bcrypt Hashing**: Passwords undergo 12 rounds of salted bcrypt hashing.
5. **Role-Based Guards**: Protected endpoints and client routes check permissions before serving data or views.
