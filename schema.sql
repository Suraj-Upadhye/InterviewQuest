-- ============================================================================
-- INTERVIEWQUEST DATABASE SCHEMA (POSTGRESQL)
-- ============================================================================

-- Enable UUID extension if we want to use UUID generation features in Postgres
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    google_id VARCHAR(100),
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);


-- ----------------------------------------------------------------------------
-- Table: resumes
-- ----------------------------------------------------------------------------
CREATE TABLE resumes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    cloudinary_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Table: companies
-- ----------------------------------------------------------------------------
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(name);


-- ----------------------------------------------------------------------------
-- Table: questions
-- ----------------------------------------------------------------------------
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    topic VARCHAR(50) NOT NULL CHECK (topic IN ('DSA', 'DBMS', 'OS', 'CN', 'OOP', 'APTITUDE')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings/objects representing multiple choices
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- ----------------------------------------------------------------------------
-- Table: assessment_attempts
-- ----------------------------------------------------------------------------
CREATE TABLE assessment_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    topic VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_attempts_user ON assessment_attempts(user_id);
CREATE INDEX idx_attempts_topic ON assessment_attempts(topic);

-- ----------------------------------------------------------------------------
-- Table: notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ----------------------------------------------------------------------------
-- Table: mock_interviews
-- ----------------------------------------------------------------------------
CREATE TABLE mock_interviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(100),
    topic_or_skills VARCHAR(255),
    interview_type VARCHAR(50) NOT NULL CHECK (interview_type IN ('TECHNICAL', 'HR', 'SKILL_SPECIFIC')),
    conversation JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store list of turn-based messages
    credits_used INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mock_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mock_interviews_user ON mock_interviews(user_id);
