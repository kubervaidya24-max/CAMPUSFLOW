# CampusFlow Architecture Specification

## 1. System Overview

CampusFlow is designed using the **MERN** (MongoDB, Express, React, Node.js) technology stack, structured inside an **npm workspaces monorepo**. This ensures isolated package dependencies, shared tooling, and modular scalability without leaking domain concerns across layers.

---

## 2. Course & Assignment Architecture

```mermaid
graph TD
    Client["React Client (Axios + TanStack Query)"] --> Gateway["Express API Gateway"]
    
    Gateway --> AuthMiddleware["Auth Middleware (authenticate)"]
    AuthMiddleware --> RoleGuard["Role Authorization Guard (authorize(...roles))"]
    
    RoleGuard --> AssignmentCtrl["Assignment & Submission Controllers"]
    
    subgraph Operations ["Level 4 Operations"]
        FacultyOps["Faculty Actions<br/>- Create / Edit / Delete Assignments<br/>- Attach Resource Links<br/>- Set Due Dates & Max Points<br/>- Evaluate & Grade Submissions"]
        StudentOps["Student Actions<br/>- Filter by Course & Due Date<br/>- Submit Solution Notes & URLs<br/>- Update Submission Before Deadline<br/>- View Marks & Feedback"]
    end
    
    AssignmentCtrl --> AssignmentModel[("MongoDB: Assignment Collection<br/>- Index: course + dueDate<br/>- Index: faculty")]
    AssignmentCtrl --> SubmissionModel[("MongoDB: Submission Collection<br/>- Unique Compound Index: assignment + student<br/>- Index: course + student")]
```

---

## 3. Assignment Creation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Faculty
    participant Client as React Client (AssignmentEditorPage)
    participant API as Express API (/api/assignments)
    participant Val as Zod Validator (createAssignmentSchema)
    participant DB as MongoDB (Assignment Collection)

    Faculty->>Client: Enters Title, Description, Course, Due Date, Points, Attachments
    Client->>API: POST /api/assignments (Bearer Token)
    API->>Val: Validate Assignment Payload
    Val-->>API: Validated Data
    API->>DB: Check if Course exists & Faculty is Instructor
    alt Faculty is not course owner
        API-->>Client: 403 Forbidden ("You do not have permission")
    else Faculty owns course
        API->>DB: Create Assignment Document
        DB-->>API: Saved Assignment
        API-->>Client: 201 Created (Assignment JSON)
        Client->>Client: Redirect to /assignments/:id
    end
```

---

## 4. Student Submission Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Client as React Client (AssignmentDetailsPage)
    participant API as Express API (/api/assignments/:id/submit)
    participant Auth as JWT Auth Middleware
    participant DB as MongoDB (Submission Model)

    Student->>Client: Submits Solution Text, GitHub URL, and Attachments
    Client->>API: POST /api/assignments/:id/submit (Bearer Token)
    API->>Auth: Verify Token & Student Role
    Auth-->>API: Validated Student Session (req.user)
    API->>DB: Find Assignment & Check Course Enrollment
    alt Student is not enrolled in course
        API-->>Client: 403 Forbidden ("Must be enrolled in course")
    else Past deadline and allowLate is false
        API-->>Client: 400 Bad Request ("Deadline passed; late submissions not allowed")
    else Valid Submission (On-time or Late Allowed)
        Note over API,DB: Determine status ('submitted' or 'late')
        API->>DB: Upsert Submission Document for (assignment, student)
        DB-->>API: Saved Submission Record
        API-->>Client: 200 OK (Submission JSON with status)
        Client->>Client: Invalidate 'assignment' query & show confirmation
    end
```

---

## 5. Faculty Grading Flow

```mermaid
sequenceDiagram
    autonumber
    actor Faculty
    participant Client as React Client (AssignmentDetailsPage)
    participant API as Express API (/api/submissions/:id/grade)
    participant Val as Zod Validator (gradeSubmissionSchema)
    participant DB as MongoDB (Submission Model)

    Faculty->>Client: Enters Score & Feedback Remarks
    Client->>API: PATCH /api/submissions/:id/grade (Bearer Token)
    API->>Val: Validate Score & Feedback
    Val-->>API: Validated Payload
    API->>DB: Fetch Submission & Check Assignment Ownership
    alt Non-owning faculty
        API-->>Client: 403 Forbidden
    else Score exceeds assignment max points
        API-->>Client: 400 Bad Request ("Score exceeds maximum points")
    else Valid evaluation
        API->>DB: Update grade = { score, feedback, gradedAt, gradedBy } & status = 'graded'
        DB-->>API: Saved Submission Document
        API-->>Client: 200 OK (Graded Submission JSON)
        Client->>Client: Invalidate submissions query & update UI
    end
```

---

## 6. Data Model Relationships

```mermaid
classDiagram
    class Course {
        +ObjectId _id
        +String title
        +String code
        +ObjectId faculty
        +EnrolledStudent[] enrolledStudents
    }

    class Assignment {
        +ObjectId _id
        +String title
        +String description
        +ObjectId course
        +ObjectId faculty
        +Date dueDate
        +Number totalPoints
        +Boolean allowLate
        +Attachment[] attachments
        +String status
        +Date createdAt
    }

    class Submission {
        +ObjectId _id
        +ObjectId assignment
        +ObjectId course
        +ObjectId student
        +String content
        +Attachment[] attachments
        +Date submittedAt
        +String status
        +Grade grade
    }

    class Grade {
        +Number score
        +String feedback
        +Date gradedAt
        +ObjectId gradedBy
    }

    Course "1" <-- "*" Assignment : belongs to
    Assignment "1" <-- "*" Submission : receives
    Submission *-- Grade : evaluated with
```

---

## 7. Database Indexes & Performance Design

| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| `assignments` | `{ course: 1, dueDate: 1 }` | Compound | Fast retrieval of course assignments sorted by deadline |
| `assignments` | `{ faculty: 1 }` | Single Field | Instructor assignment management |
| `submissions` | `{ assignment: 1, student: 1 }` | Unique Compound | Strict guarantee of one submission per student per assignment |
| `submissions` | `{ course: 1, student: 1 }` | Compound | Rapid lookup of student submissions across a course |
| `submissions` | `{ student: 1 }` | Single Field | Student grades and submission history lookup |
