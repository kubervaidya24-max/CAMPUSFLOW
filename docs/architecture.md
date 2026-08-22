# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Dynamic Resume Builder & PDF Generation Pipeline (Level 9)

```mermaid
graph TD
    User["User (Student / Faculty)"] --> Profile["User Profile & Projects Data"]
    Profile --> AutoFill["Auto-Fill Engine (GET /api/resumes/auto-fill)"]
    AutoFill --> Builder["Resume Builder State (ResumeBuilderPage.jsx)"]
    
    Builder --> TemplateSel{"Template Selector"}
    TemplateSel -->|modern| ModernComp["ModernTemplate.jsx (Single-Column ATS)"]
    TemplateSel -->|dual-column| DualComp["DualColumnTemplate.jsx (Executive Split)"]
    
    ModernComp --> Renderer["Live Split-Screen Interactive Renderer"]
    DualComp --> Renderer
    
    Renderer --> Export["High-Fidelity PDF Engine (@media print / Vector Export)"]
    Export --> OutputPDF[("ATS-Compliant Vector PDF")]
```

---

## 3. Placement Preparation & Analytics Architecture (Level 8)

```mermaid
graph TD
    UserPl["User (Student)"] --> ClientPl["React Client (PlacementPage.jsx / placementService)"]
    ClientPl --> APIPl["Express Placement Router (/api/placements)"]
    
    APIPl --> DSAController["placementController: DSA Engine"]
    APIPl --> JobController["placementController: Job Pipeline Engine"]
    
    DSAController --> MongoDSA[("MongoDB: DSAProblems Collection<br/>- Compound Index: { user: 1, status: 1, topic: 1 }")]
    JobController --> MongoJobs[("MongoDB: JobApplications Collection<br/>- Compound Index: { user: 1, status: 1, applicationDate: -1 }")]
    
    DSAController --> AggEngine["Dynamic Analytics Engine (Non-hardcoded)"]
    AggEngine --> Metrics["Streaks, Topic Mastery, Difficulty Breakdown"]
    Metrics --> ClientPl
    
    JobController --> PipelineGroup["Pipeline Grouping Engine"]
    PipelineGroup --> Stages["Visual Stages (APPLIED -> OA -> TECH -> HR -> OFFER)"]
    Stages --> ClientPl
```

---

## 4. REST vs WebSocket Responsibilities

| Responsibility Layer | Transport Protocol | Primary Role |
|---|---|---|
| **Resume Management** | **HTTP / REST** (`/api/resumes`) | Resume creation, section editing, profile auto-fill extraction, and template preference persistence. |
| **Placement & Career Data** | **HTTP / REST** (`/api/placements/dsa`, `/jobs`) | Problem logging, dynamic algorithmic metrics aggregation, pipeline stage management. |
| **Notification Hydration & History** | **HTTP / REST** (`GET /api/notifications`) | Cold start state hydration, unread counts (`/unread-count`), pagination. |
| **Real-time Notifications** | **WebSockets (Socket.IO)** | Instant delivery of notifications directly to the targeted `user:<userId>` room. |
| **Real-time Chat** | **WebSockets (Socket.IO)** | Instant message broadcasting, typing indicators, and online presence in `project:<projectId>`. |
| **Authentication** | **Handshake JWT** | Verifies token during socket handshake; automatically joins socket to `user:<userId>`. |
| **Durability Guarantee** | **MongoDB Persistence** | All resumes, problems, applications, messages, and notifications are validated and persisted to MongoDB. |

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

    class Resume {
        +ObjectId _id
        +ObjectId user
        +String title
        +String template
        +PersonalInfo personalInfo
        +Education[] education
        +SkillCategory[] skills
        +ProjectItem[] projects
        +ExperienceItem[] experience
        +Certification[] certifications
        +Achievement[] achievements
        +Links links
    }

    class DSAProblem {
        +ObjectId _id
        +ObjectId user
        +String title
        +String platform
        +String topic
        +String difficulty
        +String status
        +Date solvedDate
        +String notes
        +Number rating
    }

    class JobApplication {
        +ObjectId _id
        +ObjectId user
        +String company
        +String role
        +String status
        +Date applicationDate
        +Date interviewDate
        +String salary
        +Contact[] contacts
    }

    User "1" <-- "*" Resume : creates
    User "1" <-- "*" DSAProblem : tracks
    User "1" <-- "*" JobApplication : applies
```

### Database Performance Indexes:
| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| `resumes` | `{ user: 1, createdAt: -1 }` | Compound | Fast user resume retrieval & sorting |
| `dsaproblems` | `{ user: 1, status: 1, topic: 1 }` | Compound | Fast topic mastery & difficulty filtering |
| `dsaproblems` | `{ user: 1, solvedDate: -1 }` | Compound | Fast daily/weekly streak calculation |
| `jobapplications` | `{ user: 1, status: 1, applicationDate: -1 }` | Compound | Instant visual pipeline stage rendering |
| `notifications` | `{ recipient: 1, read: 1, createdAt: -1 }` | Compound | Fast unread count aggregation & chronological queries |
| `messages` | `{ project: 1, createdAt: 1 }` | Compound | Fast chronological chat history retrieval |
| `projects` | `{ "members.user": 1 }` | Multikey | Fast retrieval of user's active projects |
| `tasks` | `{ project: 1, status: 1, order: 1 }` | Compound | Instant Kanban board column rendering |

---

## 10. Level 10: Data-Driven Analytics & Aggregation Engine

### Architecture Flow:
```mermaid
graph TD
    DB[("MongoDB Collections\n(Course, Assignment, Submission, Project, Task, DSA, JobApp)")] --> Pipeline["Optimized Compound-Indexed Aggregations\n($match, $group, $facet, $lookup)"]
    Pipeline --> Controller["analyticsController.js\n(Transformation & Percentage Normalization)"]
    Controller --> API["REST Analytics API\n(/api/analytics/student, /project, /placement)"]
    API --> ClientService["analyticsService.js\n(React Query Cache Layer)"]
    ClientService --> UI["AnalyticsDashboardPage.jsx\n(KPI Cards, Funnel Converter, Mastery Meters)"]
```

### Aggregation Pipeline Rationales:
1. **Academic Credits & Courses (`Course.aggregate`)**:
   - Uses `$match: { 'enrolledStudents.student': userId }` followed by `$facet` to compute total enrolled courses, total active credits, and department distribution in a single database roundtrip.
2. **Assignment Performance & Grades (`Submission.aggregate`)**:
   - Uses `$lookup` with the `assignments` collection to compute maximum total points against scored grades, calculating true dynamic completion rate % and average score % without fetching full submission histories into server memory.
3. **Project & Task Velocity (`Task.aggregate`)**:
   - Uses `$facet` to aggregate task counts by status (`DONE`, `IN_PROGRESS`, `TODO`) and group tasks by priority (`urgent`, `high`, `medium`, `low`) alongside individual member contributions.
4. **Placement Funnel & Career Pipeline (`JobApplication.aggregate` + `DSAProblem.aggregate`)**:
   - Groups applications by recruitment stages (`APPLIED` ➔ `OA` ➔ `TECHNICAL` ➔ `HR` ➔ `OFFER` / `REJECTED`) to dynamically calculate conversion and rejection rates alongside DSA difficulty and topic mastery progress.

