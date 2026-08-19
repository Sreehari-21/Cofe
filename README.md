# Academic Project Submission Portal (Cofe)

**Version 1.0** — local MERN dossier: student / faculty / admin courses, submissions, reviews, and notebook-paper UI. Hosted deploy is not in this release; run on localhost (`5050` API, `5173` client).

A professional, role-based MERN monorepo academic submission portal built with React + Vite, Node.js + Express, and MongoDB. The application facilitates a hierarchical academic workflow connecting instructors, courses, assignments, student submissions, and feedback reviews.

---

## 🏗️ Academic Workflow Architecture

```text
                 ADMIN
                   │
        ┌──────────┴──────────┐
        │                     │
     FACULTY                STUDENT
        │                     │
   Create Course        Join Course
        │              using Reference Key
        │                     │
   Reference Key              │
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
                COURSE
                   │
                   ▼
          ASSIGNMENT / PROJECT
                   │
                   ▼
               SUBMISSION
                   │
                   ▼
                REVIEW
                   │
                   ▼
          MARKS + FEEDBACK
```

---

## ⚡ Key Features

* **Multi-Role Dashboards**: Adaptive dashboard screens for **Students**, **Faculty**, and **System Admins**.
* **Course Workspaces**: Faculty can create academic courses generating a unique reference key (e.g. `WT-7K29-XP`) which students enter to enroll.
* **Assignment Workspace**: Nested project assignments with custom descriptions, recommended technologies, list requirements, maximum scores, deadlines, and toggles for late submission.
* **Document Uploader**: Integrated Multer uploads in Express with file size constraints (10MB limit) and extension filtering (`.pdf`, `.zip`, `.docx`, `.pptx`).
* **Evaluation Ledger**: Evaluator sheet for assigning marks, comments, and project approval/rejection decisions. Includes a Course results matrix gradebook.
* **Security & Auth**: Secure password hashing (`bcryptjs`), JWT token-based authentication sessions, role-based REST API authorization middleware, and protection against macOS AirPlay Receiver port conflicts by running on port `5050` (shuffled from port `5000`).

---

## 🛠️ Technology Stack

* **Frontend**: React (v19), Vite (v8), React Router Dom (v7), Lucide Icons, Vanilla CSS Variables.
* **Backend**: Node.js, Express, Mongoose / MongoDB, JWT, BcryptJS, Multer, Morgan.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v20.18.0+ recommended) and **MongoDB Community Server** installed on your machine.

### 2. Configure Environment variables
Create a `.env` file in the root directory (matching the variables in `.env.example`):
```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/project_portal
JWT_SECRET=supersecretjwtkey_change_me_in_production
NODE_ENV=development
```

### 3. Install Dependencies
Run the installation script in the root directory:
```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 4. Seed the Database
Run the database seeder to populate the sample courses, assignments, and test accounts:
```bash
npm run seed
```

### 5. Start the Application
Boot up both the Express backend server (port `5050`) and Vite development server (port `5173`) concurrently:
```bash
npm run dev
```

---

## 🔐 Seeded Test Credentials

You can use the following mock accounts populated by the seeder to test different roles:

| Role | Email Address | Password | Name | Department / Course |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@university.edu` | `password123` | Admin Principal | System Management |
| **Faculty** | `faculty1@university.edu` | `password123` | Dr. Alan Turing | Computer Science (Web Tech) |
| **Faculty** | `faculty2@university.edu` | `password123` | Dr. Ada Lovelace | Mathematics (Advanced Math) |
| **Student** | `student1@university.edu` | `password123` | Alice Smith | Computer Science |
| **Student** | `student2@university.edu` | `password123` | Bob Jones | Computer Science |
| **Student** | `student3@university.edu` | `password123` | Charlie Brown | Mathematics |

---

## 🧪 Testing & Validation

To run the programmatic API validation tests asserting health endpoints, JWT tokens, duplicate enrollment blocks, and cross-course authorization restrictions:
```bash
node server/src/utils/test-api.js
```
