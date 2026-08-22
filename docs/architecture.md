# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Project Collaboration Architecture

```mermaid
graph TD
    Client["React Client (Axios + TanStack Query)"] --> Gateway["Express API Gateway"]
    
    Gateway --> AuthMiddleware["Auth Middleware (authenticate)"]
    AuthMiddleware --> MembershipGuard["Project Membership Guard"]
    
    MembershipGuard --> ProjectCtrl["Project & Task Controllers"]
    
    subgraph Operations ["Level 5 Operations"]
        TeamOps["Team Actions<br/>- Create Project Workspaces<br/>- Invite Teammates by Email<br/>- Accept / Decline Invitations<br/>- Leave / Remove Member"]
        KanbanOps["Kanban Board Actions<br/>- Create Tasks (TODO)<br/>- Assign Tasks to Teammates<br/>- Move Tasks (IN_PROGRESS -> DONE)<br/>- Delete Tasks"]
        AuditOps["Activity Logger<br/>- Record Immutable Audit Trail<br/>- Real-time Timeline Feed"]
    end
    
    ProjectCtrl --> ProjectModel[("MongoDB: Project Collection<br/>- Index: members.user<br/>- Index: invitations.user")]
    ProjectCtrl --> TaskModel[("MongoDB: Task Collection<br/>- Compound Index: project + status + order")]
    ProjectCtrl --> ActivityModel[("MongoDB: ProjectActivity Collection<br/>- Compound Index: project + createdAt")]
```

---

## 3. Project Creation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Project Creator
    participant Client as React Client (ProjectEditorPage)
    participant API as Express API (/api/projects)
    participant Val as Zod Validator (createProjectSchema)
    participant DB as MongoDB (Project & Activity)

    Student->>Client: Enters Title, Description, Tech Stack, URLs
    Client->>API: POST /api/projects (Bearer Token)
    API->>Val: Validate Project Data
    Val-->>API: Validated Payload
    API->>DB: Create Project (owner: req.user._id, members: [{ user: req.user._id, role: 'owner' }])
    API->>DB: Log Activity ('PROJECT_CREATED')
    DB-->>API: Saved Project Document
    API-->>Client: 201 Created (Project JSON)
    Client->>Client: Redirect to /projects/:id
```

---

## 4. Team Invitation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Project Owner
    actor Teammate as Invited Student
    participant Client as React Client (ProjectDetailsPage / ProjectsPage)
    participant API as Express API (/api/projects/:id/invitations)
    participant DB as MongoDB (Project & User)

    Owner->>Client: Enters Teammate's Email & Role
    Client->>API: POST /api/projects/:id/invitations
    API->>DB: Find User by Email
    alt User not found or already member
        API-->>Client: 400 Bad Request
    else Valid invitation
        API->>DB: Push into project.invitations ({ user, invitedBy, status: 'pending' })
        API->>DB: Log Activity ('INVITATION_SENT')
        API-->>Client: 200 OK ("Invitation sent")
    end

    Teammate->>Client: Opens "Invitations" Tab (/projects?scope=invitations)
    Client->>API: GET /api/projects?scope=invitations
    API-->>Client: List of pending project invites
    Teammate->>Client: Clicks "Accept & Join"
    Client->>API: POST /api/projects/:id/invitations/respond ({ action: 'accept' })
    API->>DB: Update invitation status to 'accepted' & push user to project.members
    API->>DB: Log Activity ('MEMBER_JOINED')
    API-->>Client: 200 OK ("You joined the project!")
```

---

## 5. Kanban Task Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor Member as Project Member
    participant Client as React Client (KanbanBoard)
    participant API as Express API (/api/tasks/:id/status)
    participant DB as MongoDB (Task & ProjectActivity)

    Member->>Client: Clicks "Start Progress" on TODO task
    Client->>API: PATCH /api/tasks/:id/status ({ status: 'IN_PROGRESS' })
    API->>DB: Verify user is project member
    API->>DB: Update task.status = 'IN_PROGRESS'
    API->>DB: Log Activity ('TASK_MOVED', from: 'TODO', to: 'IN_PROGRESS')
    DB-->>API: Updated Task Document
    API-->>Client: 200 OK (Task JSON)
    Client->>Client: Optimistically re-render Kanban column
```

---

## 6. Activity Audit Logging Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Team Collaborator
    participant API as Express API
    participant Logger as Activity Logger Service
    participant DB as MongoDB (ProjectActivity)
    participant Feed as Client Activity Timeline

    User->>API: Executes Task/Team Action (e.g. Move Task, Complete Task)
    API->>DB: Persist Task/Project State
    API->>Logger: logActivity(projectId, userId, action, details)
    Logger->>DB: Insert into ProjectActivity ({ project, user, action, details, createdAt })
    User->>Feed: Views Activity Feed (/projects/:id Tab: Activities)
    Feed->>API: GET /api/projects/:id/activities
    API-->>Feed: 200 OK (Chronological Audit Feed)
```

---

## 7. Data Models & Indexes

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

    class Member {
        +ObjectId user
        +String role
        +Date joinedAt
    }

    class Invitation {
        +ObjectId user
        +ObjectId invitedBy
        +String status
        +Date createdAt
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

    Project *-- Member
    Project *-- Invitation
    Project "1" <-- "*" Task : contains
    Project "1" <-- "*" ProjectActivity : logs
```

### Database Performance Indexes:
| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| `projects` | `{ "members.user": 1 }` | Multikey | Fast retrieval of user's active projects |
| `projects` | `{ "invitations.user": 1, "invitations.status": 1 }` | Compound | Fast pending invitations lookup |
| `tasks` | `{ project: 1, status: 1, order: 1 }` | Compound | Instant Kanban board column rendering |
| `projectactivities` | `{ project: 1, createdAt: -1 }` | Compound | Fast chronological activity feed pagination |
