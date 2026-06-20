<div align="center">

# InterviewQuest

### Your All-in-One Placement & Interview Preparation Platform

A full-stack web application designed to help students **ace campus placements** by providing structured learning resources, practice quizzes, AI-powered mock interviews, and admin-managed curriculum — all in one unified platform.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq-LLaMA%203.3-F55036?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com/)

<br>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_InterviewQuest-brightgreen?style=for-the-badge)](https://interviewquestt.vercel.app/)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

Students preparing for campus placements often struggle with:

- **Scattered Resources** — Study materials are spread across multiple platforms with no clear structure or roadmap.
- **No Guided Curriculum** — No organized, chapter-wise syllabus for core CS subjects (OS, DBMS, CN, DSA, OOP).
- **Limited Practice** — Generic quiz platforms lack topic-specific, difficulty-graded MCQs tailored for placement exams.
- **Interview Anxiety** — No safe environment to simulate real interview scenarios and receive constructive feedback.
- **No Progress Tracking** — Difficulty in measuring preparation progress across subjects and assessments.

---

## 💡 Solution

**InterviewQuest** solves these challenges by combining four powerful modules into one cohesive platform:

| Module | What It Solves |
|--------|----------------|
| **Structured Resources** | Admin-curated, chapter-wise study material for each CS subject with a clear roadmap |
| **Practice Quizzes** | Topic-specific, timed MCQ assessments with difficulty levels and score history |
| **AI Mock Interviews** | Realistic, conversational mock interviews powered by Groq AI (LLaMA 3.3 70B) with detailed scorecards |
| **Admin Dashboard** | Full CMS for admins to manage subjects, chapters, topics, questions, and content (manual + AI-generated) |

---

## ✨ Key Features

### 👤 User Features

- **Structured Learning Resources**
  - Browse subjects with organized chapters and topics
  - Read admin-curated theory content with a clean, distraction-free reader
  - Collapsible sidebar with nested chapter → topic navigation
  - Public access — no login required to read resources

- **Practice Quiz Engine**
  - Timed, topic-specific MCQ assessments (DSA, DBMS, OS, CN, OOP, Aptitude)
  - Difficulty-graded questions (Easy, Medium, Hard)
  - Instant scoring with correct answers and explanations
  - Complete attempt history with performance tracking

- **AI Mock Interviews**
  - Simulate realistic **Technical**, **HR**, and **Skill-Specific** interviews
  - Resume-specific and Topic-specific interview customization
  - Turn-by-turn conversational interview flow powered by **Groq AI (LLaMA 3.3 70B)**
  - **Voice input** (Speech-to-Text) and **voice output** (Text-to-Speech) support
  - Detailed **AI-generated scorecard** with strengths, weaknesses, and improvement areas
  - Full session history with past interview transcripts

- **User Dashboard**
  - Central hub with quick access to all modules
  - Clean, modern dark/light mode UI

### 🛡️ Admin Features

- **Subject & Resource Management (Full CRUD)**
  - Create, edit, delete, and toggle visibility of subjects on the landing page
  - Manage display order with sort controls

- **Curriculum Builder**
  - Add **chapters** under each subject
  - Add **topics** under each chapter
  - VS Code-style inline creation (no modals) for a seamless editing experience
  - In-place renaming and deletion of chapters and topics

- **Content Editor**
  - Write and edit rich topic content directly in the admin panel
  - Content is rendered as formatted study material for users

- **Question Bank Management**
  - Create, edit, and delete MCQ questions with options, correct answers, and explanations
  - Filter by topic and difficulty
  - Support for both **manually created** and **AI-generated** questions


### 🔐 Authentication & Security

- JWT-based stateless authentication
- Role-based access control (User / Admin)
- Protected API endpoints with Spring Security
- Secure password hashing with BCrypt

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, Lucide React, Web Speech API |
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, Hibernate, Lombok, JWT, Cloudinary, Groq API (LLaMA 3.3 70B) |
| **Database** | PostgreSQL |
| **Hosting** | Vercel (Frontend), Render (Backend) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React 19 + Vite + Tailwind CSS 4          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │  │
│  │  │Resources │ │ Practice │ │  AI Mock Interview│  │  │
│  │  │  Reader  │ │   Quiz   │ │  (Voice + Chat)   │  │  │
│  │  └──────────┘ └──────────┘ └───────────────────┘  │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ REST API (Axios)              │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│               Spring Boot 3.5 Backend                   │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │              REST Controllers Layer               │  │
│  │ Auth │ Subject │ Question │ Assessment │ Interview│  │
│  └──────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │               Service / Business Layer            │  │
│  │  AuthService │ SubjectService │ MockInterviewSvc  │  │
│  └──────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │            Spring Security (JWT + BCrypt)         │  │
│  └──────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │          Spring Data JPA / Hibernate ORM          │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │
          ┌───────────────┼──────────────┐
          │               │              │
    ┌─────┴─────┐  ┌──────┴─────┐  ┌─────┴──────┐
    │PostgreSQL │  │ Cloudinary │  │  Groq API  │
    │ Database  │  │   (CDN)    │  │ (LLaMA 3.3)│
    └───────────┘  └────────────┘  └────────────┘
```


---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed on your machine:

- **Java 21** (JDK) — [Download](https://adoptium.net/)
- **Maven 3.9+** — [Download](https://maven.apache.org/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **npm 10+** — Bundled with Node.js
- **PostgreSQL 15+** — [Download](https://www.postgresql.org/download/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Suraj-Upadhye/InterviewQuest.git
cd InterviewQuest
```

### 2️⃣ Set Up the Database

Create a PostgreSQL database and run the schema:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE interviewquest;

# Connect to it and run the schema
\c interviewquest
\i schema.sql
```

### 3️⃣ Configure the Backend

Create the application properties file:

```
interviewquestbackend/src/main/resources/application.properties
```

Add the following configuration:

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/interviewquest
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update

# JWT
interviewquest.jwt.secret=YOUR_JWT_SECRET_KEY
interviewquest.jwt.expirationMs=86400000

# Groq AI
interviewquest.groq.apiKey=YOUR_GROQ_API_KEY
interviewquest.groq.model=llama-3.3-70b-versatile

# Cloudinary
cloudinary.cloud-name=YOUR_CLOUD_NAME
cloudinary.api-key=YOUR_CLOUDINARY_API_KEY
cloudinary.api-secret=YOUR_CLOUDINARY_API_SECRET
```

### 4️⃣ Run the Backend

```bash
cd interviewquestbackend
./mvnw spring-boot:run
```

> On Windows, use `mvnw.cmd spring-boot:run`

The backend API will be available at `http://localhost:8080`

### 5️⃣ Configure the Frontend

Create the environment file:

```
interviewquestfrontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 6️⃣ Run the Frontend

```bash
cd interviewquestfrontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 🖼️ Screenshots

> _Screenshots coming soon — run the project locally to explore the full UI!_

<!-- 
Add screenshots here once available:
![Landing Page](./screenshots/landing.png)
![Resources](./screenshots/resources.png)
![Practice Quiz](./screenshots/quiz.png)
![Mock Interview](./screenshots/interview.png)
![Admin Dashboard](./screenshots/admin.png)
-->

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -m 'Add some feature'`)
4. **Push** to the branch (`git push origin feature/your-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Suraj Upadhye](https://github.com/Suraj-Upadhye)**

⭐ **If this project helped you, consider giving it a star!** ⭐

</div>
