# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Course Management Architecture (Level 3)

```mermaid
graph TD
    Client["React Client (Axios + TanStack Query)"] --> Gateway["Express API Gateway"]
    
    Gateway --> AuthMiddleware["Auth Middleware (authenticate)"]
    AuthMiddleware --> RoleGuard["Role Authorization Guard (authorize(...roles))"]
    
    RoleGuard --> CourseCtrl["Course Controller"]
    
    subgraph Operations ["Course Operations"]
        FacultyOps["Faculty Actions<br/>- Create / Edit / Delete Course<br/>- Publish / Draft Toggle<br/>- Author Syllabus Modules<br/>- View Enrolled Students"]
        StudentOps["Student Actions<br/>- Search & Filter Catalog<br/>- View Course Syllabus & Schedule<br/>- Enroll (Capacity & Duplicate Guarded)<br/>- Leave Enrolled Course"]
    end
    
    CourseCtrl --> CourseModel[("MongoDB (Course Collection)<br/>- Unique Index on code<br/>- Compound Index: department + semester + status<br/>- Enrolled Students Index")]
```

---

## 3. Student Enrollment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Client as React Client (CoursesPage / Details)
    participant API as Express API (/api/courses/:id/enroll)
    participant Auth as JWT Auth Middleware
    participant DB as MongoDB (Course Model)

    Student->>Client: Clicks "Enroll in Course"
    Client->>API: POST /api/courses/:id/enroll (Bearer Token)
    API->>Auth: Verify Token & Student Role
    Auth-->>API: Validated Student Session (req.user)
    API->>DB: Find Course by ID
    alt Course status is not 'published'
        API-->>Client: 400 Bad Request ("Course is not published")
    else Student is already enrolled in course
        API-->>Client: 409 Conflict ("You are already enrolled in this course")
    else Course capacity is reached
        API-->>Client: 400 Bad Request ("Course capacity limit reached")
    else Valid enrollment
        API->>DB: Push { student: studentId, enrolledAt: Date.now() }
        DB-->>API: Saved Course Document
        API-->>Client: 200 OK ("Successfully enrolled in course")
        Client->>Client: Invalidate 'courses' query & toggle button to "Enrolled"
    end
```

---

## 4. Faculty Course Creation & Management Flow

```mermaid
sequenceDiagram
    autonumber
    actor Faculty
    participant Client as React Client (CourseEditorPage)
    participant API as Express API (/api/courses)
    participant Val as Zod Validator (createCourseSchema)
    participant DB as MongoDB (Course Collection)

    Faculty->>Client: Enters Title, Code, Syllabus, Schedule, Capacity
    Client->>API: POST /api/courses (Bearer Token)
    API->>Val: Validate Course Payload
    Val-->>API: Validated Data
    API->>DB: Check if course code is already taken
    alt Course code exists
        DB-->>API: Existing Course Found
        API-->>Client: 409 Conflict ("Course with code already exists")
    else Code is unique
        API->>DB: Create Course with faculty = req.user._id
        DB-->>API: Created Course Document
        API-->>Client: 201 Created (Course JSON)
        Client->>Client: Redirect to /courses/:id
    end
```

---

## 5. Course Data Model

```mermaid
classDiagram
    class Course {
        +ObjectId _id
        +String title
        +String code
        +String description
        +String department
        +Number semester
        +Number credits
        +ObjectId faculty
        +EnrolledStudent[] enrolledStudents
        +Number capacity
        +String status ("draft" | "published" | "archived")
        +SyllabusItem[] syllabus
        +Schedule schedule
        +Number enrolledCount (virtual)
        +Date createdAt
        +Date updatedAt
    }

    class EnrolledStudent {
        +ObjectId student
        +Date enrolledAt
    }

    class SyllabusItem {
        +Number week
        +String title
        +String description
    }

    class Schedule {
        +String[] days
        +String time
        +String room
    }

    Course *-- EnrolledStudent
    Course *-- SyllabusItem
    Course *-- Schedule
```

---

## 6. Database Indexes & Performance Design

| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| `courses` | `{ code: 1 }` | Unique | Enforces course code uniqueness (e.g. `CS101`) |
| `courses` | `{ faculty: 1 }` | Single Field | Fast lookup for instructor's created courses |
| `courses` | `{ department: 1, semester: 1, status: 1 }` | Compound | Fast student catalog filtering |
| `courses` | `{ "enrolledStudents.student": 1 }` | Multikey | Instant retrieval of a student's enrolled courses |
| `courses` | `{ title: "text", description: "text", code: "text" }` | Text Search | Full-text search across course catalog |
