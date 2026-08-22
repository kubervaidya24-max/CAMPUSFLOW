# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Centralized Notification Architecture (Level 7)

```mermaid
graph TD
    Event["Event Trigger (Assignment, Invite, Task, Grade)"] --> Logic["Business Controller Layer"]
    Logic --> Service["NotificationService (createNotification / createBulkNotifications)"]
    
    Service --> MongoSave[("MongoDB: Notification Collection<br/>- Compound Index: { recipient: 1, read: 1, createdAt: -1 }")]
    Service --> SocketServer["Socket.IO Server"]
    
    SocketServer --> UserRoom["User Notification Room (user:userId)"]
    UserRoom --> ReactClient["React Client (NotificationBell / useNotifications hook)"]
```

---

## 3. Real-Time Notification Event Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Faculty Member
    actor Student as Enrolled Student
    participant ClientF as Faculty Client
    participant Controller as Course/Assignment Controller
    participant Service as NotificationService
    participant DB as MongoDB (Notifications)
    participant Socket as Socket.IO Server
    participant ClientS as Student Client (Navbar Bell)

    Student->>Socket: Socket Handshake (auth: { token })
    Socket->>Socket: Join private room ('user:' + studentId)

    Faculty->>ClientF: Submits New Assignment
    ClientF->>Controller: POST /api/assignments
    Controller->>Service: createBulkNotifications(enrolledStudents, payload)
    Service->>DB: Notification.insertMany(docs)
    DB-->>Service: Persisted Documents
    Service->>Socket: io.to('user:' + studentId).emit('new_notification', notif)
    Socket->>ClientS: 'new_notification' Event
    ClientS->>ClientS: Increment Unread Counter Badge (Navbar Bell) + Audio Cue
```

---

## 4. REST vs WebSocket Responsibilities

| Responsibility Layer | Transport Protocol | Primary Role |
|---|---|---|
| **Notification Hydration & History** | **HTTP / REST** (`GET /api/notifications`) | Cold start state hydration, unread counts (`/unread-count`), pagination. |
| **Notification Status Mutations** | **HTTP / REST** (`PATCH /:id/read`, `PATCH /read-all`) | Atomic status updates to database with immediate cache mutation. |
| **Real-time Live Sync** | **WebSockets (Socket.IO)** | Instant delivery of notifications directly to the targeted `user:<userId>` room. |
| **Message Streaming (Chat)** | **WebSockets (Socket.IO)** | Delivers instant chat messages, typing indicators, and online presence in `project:<projectId>`. |
| **Authentication** | **Handshake JWT** | Verifies token during socket handshake; automatically joins socket to `user:<userId>`. |
| **Durability Guarantee** | **MongoDB (`Notification` collection)** | Notifications are persisted to MongoDB before broadcasting, ensuring no missed alerts. |

---

## 5. Data Models & Performance Indexes

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String role
        +Profile profile
    }

    class Notification {
        +ObjectId _id
        +ObjectId recipient
        +String type
        +String title
        +String message
        +Resource relatedResource
        +Boolean read
        +Date createdAt
    }

    class Project {
        +ObjectId _id
        +String title
        +ObjectId owner
        +Member[] members
    }

    class Message {
        +ObjectId _id
        +ObjectId project
        +ObjectId sender
        +String content
        +Date createdAt
    }

    User "1" <-- "*" Notification : receives
    User "1" <-- "*" Message : sends
    Project "1" <-- "*" Message : contains
```

### Database Performance Indexes:
| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| `notifications` | `{ recipient: 1, read: 1, createdAt: -1 }` | Compound | Fast unread count aggregation & chronological queries |
| `messages` | `{ project: 1, createdAt: 1 }` | Compound | Fast chronological chat history retrieval |
| `projects` | `{ "members.user": 1 }` | Multikey | Fast retrieval of user's active projects |
| `tasks` | `{ project: 1, status: 1, order: 1 }` | Compound | Instant Kanban board column rendering |
| `assignments` | `{ course: 1, status: 1, dueDate: 1 }` | Compound | Fast course deliverables queries |
