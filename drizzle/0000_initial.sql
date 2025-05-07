-- Create enums
CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin', 'examiner', 'learner');
CREATE TYPE "difficulty" AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE "submission_status" AS ENUM ('accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error');
CREATE TYPE "programming_language" AS ENUM ('javascript', 'python', 'java', 'cpp', 'ruby', 'go', 'csharp');

-- Create tables
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "email" VARCHAR(100) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "display_name" VARCHAR(100),
  "role" "user_role" NOT NULL DEFAULT 'learner',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "problem_tags" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL UNIQUE,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "problems" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(100) NOT NULL,
  "description" TEXT NOT NULL,
  "difficulty" "difficulty" NOT NULL,
  "starter_code" JSONB, 
  "test_cases" JSONB,
  "created_by" INTEGER REFERENCES "users"("id"),
  "time_limit" INTEGER DEFAULT 1000,
  "memory_limit" INTEGER DEFAULT 128,
  "acceptance_rate" DECIMAL(5,2),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "problem_to_tag" (
  "problem_id" INTEGER REFERENCES "problems"("id") ON DELETE CASCADE,
  "tag_id" INTEGER REFERENCES "problem_tags"("id") ON DELETE CASCADE,
  PRIMARY KEY ("problem_id", "tag_id")
);

CREATE TABLE IF NOT EXISTS "submissions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id"),
  "problem_id" INTEGER REFERENCES "problems"("id"),
  "code" TEXT NOT NULL,
  "language" "programming_language" NOT NULL,
  "status" "submission_status" NOT NULL,
  "execution_time" INTEGER,
  "memory_used" INTEGER,
  "submitted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "competitions" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP NOT NULL,
  "created_by" INTEGER REFERENCES "users"("id"),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "competition_problems" (
  "competition_id" INTEGER REFERENCES "competitions"("id") ON DELETE CASCADE,
  "problem_id" INTEGER REFERENCES "problems"("id") ON DELETE CASCADE,
  "points" INTEGER NOT NULL,
  PRIMARY KEY ("competition_id", "problem_id")
);

CREATE TABLE IF NOT EXISTS "user_competitions" (
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "competition_id" INTEGER REFERENCES "competitions"("id") ON DELETE CASCADE,
  "registered_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "score" INTEGER DEFAULT 0,
  "rank" INTEGER,
  PRIMARY KEY ("user_id", "competition_id")
);

CREATE TABLE IF NOT EXISTS "user_stats" (
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE PRIMARY KEY,
  "problems_solved" INTEGER DEFAULT 0,
  "easy_solved" INTEGER DEFAULT 0,
  "medium_solved" INTEGER DEFAULT 0,
  "hard_solved" INTEGER DEFAULT 0,
  "current_streak" INTEGER DEFAULT 0,
  "longest_streak" INTEGER DEFAULT 0,
  "total_submissions" INTEGER DEFAULT 0,
  "accepted_submissions" INTEGER DEFAULT 0,
  "ranking" INTEGER,
  "last_activity_date" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user_skills" (
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "tag_id" INTEGER REFERENCES "problem_tags"("id") ON DELETE CASCADE,
  "proficiency" INTEGER DEFAULT 0,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user_id", "tag_id")
);

-- Create session table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" VARCHAR NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");