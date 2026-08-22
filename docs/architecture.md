# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Role-Based Access Control (RBAC) Architecture (Level 2)

```mermaid
graph TD
    Client["React Client (Axios + AuthContext)"] --> Gateway["Express API Gateway"]
    
    Gateway --> AuthMiddleware["Auth Middleware (authenticate)"]
    AuthMiddleware --> RoleMiddleware["Role Authorization Guard (authorize(...roles))"]
    
    RoleMiddleware -->|student, faculty, admin| UserCtrl["User Profile Controller"]
    
    subgraph Roles ["Role Capabilities"]
        Student["Student Role<br/>- View/Edit Own Profile<br/>- View Peer & Faculty Profiles<br/>- Semester, Skills, Social Links"]
        Faculty["Faculty Role<br/>- View/Edit Own Profile<br/>- View Student Profiles<br/>- Designation, Subjects, Cabin"]
        Admin["Admin Role<br/>- Read-all Access<br/>- System Diagnostics"]
    end
```

---

## 3. User Profile Update & Whitelisting Permission Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant Client as React Client (EditProfilePage)
    participant API as Express API (/api/users/me)
    participant Auth as JWT Auth Middleware
    participant Val as Zod Validator (updateProfileSchema)
    participant DB as MongoDB (User Collection)

    User->>Client: Edits Bio, Semester, Skills, Social Links
    Client->>API: PATCH /api/users/me (Bearer Token)
    API->>Auth: Verify Access Token signature
    Auth->>Auth: Attach req.user
    API->>Val: Validate request payload against strict whitelist
    alt Payload contains forbidden keys (e.g. role, password, _id)
        Val-->>Client: 400 Bad Request ("Validation failed: Unrecognized key")
    else Payload valid
        Val-->>API: Whitelisted payload
        API->>DB: Update permitted profile fields on req.user & save()
        DB-->>API: Updated User Document
        API-->>Client: 200 OK (Updated User JSON)
        Client->>Client: Update AuthContext state & navigate to /profile
    end
```

---

## 4. User Data Model (Level 2 Extended)

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password (select: false)
        +String role ("student" | "faculty" | "admin")
        +Profile profile
        +RefreshToken[] refreshTokens
        +Date createdAt
        +Date updatedAt
        +comparePassword(candidate)
        +generateAccessToken()
        +generateRefreshToken()
    }

    class Profile {
        +String avatar
        +String bio (max 500)
        +String department
        +Number semester (1-12)
        +Number graduationYear
        +String collegeId
        +String[] skills
        +String[] interests
        +SocialLinks socialLinks
        +String designation
        +String[] subjects
        +String officeLocation
    }

    class SocialLinks {
        +String github
        +String linkedin
        +String portfolio
    }

    class RefreshToken {
        +String token
        +Date expiresAt
        +Date createdAt
    }

    User *-- Profile
    User *-- RefreshToken
    Profile *-- SocialLinks
```

---

## 5. Security & Isolation Matrix

| Capability / Action | Student | Faculty | Admin | Unauthenticated |
|---|---|---|---|---|
| View own profile (`GET /api/users/me`) | Allowed ✅ | Allowed ✅ | Allowed ✅ | Denied (401) ❌ |
| Edit own profile (`PATCH /api/users/me`) | Allowed ✅ | Allowed ✅ | Allowed ✅ | Denied (401) ❌ |
| View public profile (`GET /api/users/:id`) | Allowed ✅ | Allowed ✅ | Allowed ✅ | Denied (401) ❌ |
| Modify another user's profile | Denied (404/403) ❌ | Denied (404/403) ❌ | Denied (404/403) ❌ | Denied (401) ❌ |
| Change role via profile update | Denied (400) ❌ | Denied (400) ❌ | Denied (400) ❌ | Denied (401) ❌ |
| Change password via profile update | Denied (400) ❌ | Denied (400) ❌ | Denied (400) ❌ | Denied (401) ❌ |
