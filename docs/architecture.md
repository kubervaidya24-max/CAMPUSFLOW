# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Real-Time Chat & Socket.IO Architecture (Level 6)

```mermaid
graph TD
    User["User (Browser)"] --> ReactClient["React Client (ProjectChat.jsx / useProjectChat hook)"]
    ReactClient --> SocketClient["Socket.IO Client (Auto-reconnect with Access Token)"]
    
    SocketClient --> SocketServer["Socket.IO Server (initSocketServer on HTTP Server)"]
    
    SocketServer --> HandshakeAuth["Socket Handshake Auth Middleware (jwt.verify)"]
    HandshakeAuth --> RoomAuth["Room Authorization Check (project.members.some)"]
    
    RoomAuth --> ProjectRoom["Project Room (project:projectId)"]
    
    ProjectRoom --> MongoSave[("MongoDB: Message Collection<br/>- Compound Index: project + createdAt")]
    MongoSave --> Broadcast["Real-Time Broadcast (io.to(room).emit('new_message'))"]
```

---

## 3. REST vs WebSocket Responsibilities

| Responsibility Layer | Transport Protocol | Primary Role |
|---|---|---|
| **Message History & Archive** | **HTTP / REST** (`GET /api/projects/:id/messages`) | Initial chat history pagination, cache hydration via TanStack Query, fast cold-start rendering. |
| **Real-time Live Sync** | **WebSockets (Socket.IO)** | Instant message broadcasting, typing indicators ("Bob is typing..."), member presence/online status. |
| **Authentication** | **Handshake JWT** | Verify token during WebSocket connection setup; reject unauthenticated sockets immediately. |
| **Room Authorization** | **Socket Handshake & Room Guard** | Validate requester is an active member or owner of the target project before calling `socket.join('project:<id>')`. |
| **Persistence** | **MongoDB (`Message` collection)** | Every real-time message is validated and persisted to MongoDB *before* broadcasting to room members so history survives server restarts. |

---

## 4. Real-Time Chat Event Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Alice (Project Owner)
    actor Bob as Bob (Project Member)
    participant ClientA as Alice's Client
    participant ClientB as Bob's Client
    participant Socket as Socket.IO Server
    participant DB as MongoDB (Message Collection)

    Alice->>ClientA: Connects to Chat Tab (/projects/:id)
    ClientA->>Socket: Socket Handshake (auth: { token: aliceJWT })
    Socket->>Socket: Verify JWT & attach socket.user
    ClientA->>Socket: emit('join_project', { projectId })
    Socket->>DB: Verify Alice is project member
    Socket->>ClientA: emit('room_joined', { projectId, onlineUsers })

    Bob->>ClientB: Connects to Chat Tab (/projects/:id)
    ClientB->>Socket: Socket Handshake (auth: { token: bobJWT })
    ClientB->>Socket: emit('join_project', { projectId })
    Socket->>ClientA: emit('presence_update', { onlineUsers: [Alice, Bob] })
    Socket->>ClientB: emit('presence_update', { onlineUsers: [Alice, Bob] })

    Alice->>ClientA: Types in message input
    ClientA->>Socket: emit('typing_start', { projectId })
    Socket->>ClientB: emit('user_typing', { projectId, user: 'Alice' })

    Alice->>ClientA: Hits Enter ("Deployment pipeline is green!")
    ClientA->>Socket: emit('send_message', { projectId, content: '...' })
    Socket->>DB: Message.create({ project, sender: aliceId, content })
    DB-->>Socket: Persisted Message Document
    Socket->>ClientA: emit('new_message', { message })
    Socket->>ClientB: emit('new_message', { message })
```

---

## 5. Data Models & Indexes

```mermaid
classDiagram
    class Project {
        +ObjectId _id
        +String title
        +String description
        +ObjectId owner
        +Member[] members
        +Invitation[] invitations
        +String[] technologies
        +String repositoryUrl
        +String liveUrl
        +String status
        +Date deadline
    }

    class Message {
        +ObjectId _id
        +ObjectId project
        +ObjectId sender
        +String content
        +Attachment[] attachments
        +Date createdAt
        +Date updatedAt
    }

    class Task {
        +ObjectId _id
        +ObjectId project
        +String title
        +String description
        +ObjectId assignee
        +ObjectId creator
        +String priority
        +String status
        +Date deadline
        +Number order
    }

    class ProjectActivity {
        +ObjectId _id
        +ObjectId project
        +ObjectId user
        +String action
        +Object details
        +Date createdAt
    }

    Project "1" <-- "*" Message : contains
    Project "1" <-- "*" Task : contains
    Project "1" <-- "*" ProjectActivity : logs
```

### Database Performance Indexes:
| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| `messages` | `{ project: 1, createdAt: 1 }` | Compound | Fast chronological chat history retrieval |
| `projects` | `{ "members.user": 1 }` | Multikey | Fast retrieval of user's active projects |
| `projects` | `{ "invitations.user": 1, "invitations.status": 1 }` | Compound | Fast pending invitations lookup |
| `tasks` | `{ project: 1, status: 1, order: 1 }` | Compound | Instant Kanban board column rendering |
| `projectactivities` | `{ project: 1, createdAt: -1 }` | Compound | Fast chronological activity feed pagination |
