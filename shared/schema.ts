import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import dotenv from 'dotenv';
dotenv.config();

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'examiner', 'learner']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const submissionStatusEnum = pgEnum('submission_status', ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error']);
export const programmingLanguageEnum = pgEnum('programming_language', ['javascript', 'python', 'java', 'cpp', 'ruby', 'go', 'csharp']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: userRoleEnum("role").notNull().default('learner'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
  competitions: many(userCompetitions),
}));

// Problem tags (e.g., array, string, dynamic programming)
export const problemTags = pgTable("problem_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const problemTagsRelations = relations(problemTags, ({ many }) => ({
  problemToTags: many(problemToTag),
}));

// Problems table
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  starterCode: jsonb("starter_code").notNull(), // JSON object with keys as language IDs and values as starter code
  testCases: jsonb("test_cases").notNull(), // JSON array of test cases
  timeLimit: integer("time_limit").notNull(), // in milliseconds
  memoryLimit: integer("memory_limit").notNull(), // in megabytes
  acceptanceRate: integer("acceptance_rate"), // to be calculated
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const problemsRelations = relations(problems, ({ many }) => ({
  submissions: many(submissions),
  problemToTags: many(problemToTag),
}));

// Problem to Tag (many-to-many) relation
export const problemToTag = pgTable("problem_to_tag", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").notNull().references(() => problems.id),
  tagId: integer("tag_id").notNull().references(() => problemTags.id),
});

export const problemToTagRelations = relations(problemToTag, ({ one }) => ({
  problem: one(problems, {
    fields: [problemToTag.problemId],
    references: [problems.id],
  }),
  tag: one(problemTags, {
    fields: [problemToTag.tagId],
    references: [problemTags.id],
  }),
}));

// Submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  problemId: integer("problem_id").notNull().references(() => problems.id),
  language: programmingLanguageEnum("language").notNull(),
  code: text("code").notNull(),
  status: submissionStatusEnum("status").notNull(),
  runTime: integer("run_time"), // in milliseconds
  memory: integer("memory"), // in kilobytes
  competitionId: integer("competition_id").references(() => competitions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
  competition: one(competitions, {
    fields: [submissions.competitionId],
    references: [competitions.id],
  }),
}));

// Competitions table
export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const competitionsRelations = relations(competitions, ({ many }) => ({
  competitionProblems: many(competitionProblems),
  participants: many(userCompetitions),
  submissions: many(submissions),
}));

// Competition Problems (Many-to-Many)
export const competitionProblems = pgTable("competition_problems", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").notNull().references(() => competitions.id),
  problemId: integer("problem_id").notNull().references(() => problems.id),
  points: integer("points").notNull(),
});

export const competitionProblemsRelations = relations(competitionProblems, ({ one }) => ({
  competition: one(competitions, {
    fields: [competitionProblems.competitionId],
    references: [competitions.id],
  }),
  problem: one(problems, {
    fields: [competitionProblems.problemId],
    references: [problems.id],
  }),
}));

// User Competitions (Many-to-Many)
export const userCompetitions = pgTable("user_competitions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  competitionId: integer("competition_id").notNull().references(() => competitions.id),
  score: integer("score").default(0),
  rank: integer("rank"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const userCompetitionsRelations = relations(userCompetitions, ({ one }) => ({
  user: one(users, {
    fields: [userCompetitions.userId],
    references: [users.id],
  }),
  competition: one(competitions, {
    fields: [userCompetitions.competitionId],
    references: [competitions.id],
  }),
}));

// User Stats (per user statistics)
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  problemsSolved: integer("problems_solved").default(0),
  easySolved: integer("easy_solved").default(0),
  mediumSolved: integer("medium_solved").default(0),
  hardSolved: integer("hard_solved").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalSubmissions: integer("total_submissions").default(0),
  acceptedSubmissions: integer("accepted_submissions").default(0),
  ranking: integer("ranking"),
  lastActivityDate: timestamp("last_activity_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

// Skill progress tracking
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tagId: integer("tag_id").notNull().references(() => problemTags.id),
  proficiency: integer("proficiency").notNull().default(0), // 0-100 score
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  tag: one(problemTags, {
    fields: [userSkills.tagId],
    references: [problemTags.id],
  }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  email: (schema) => schema.email("Must be a valid email"),
  role: (schema) => schema,
});

export const insertProblemSchema = createInsertSchema(problems);
export const insertSubmissionSchema = createInsertSchema(submissions);
export const insertCompetitionSchema = createInsertSchema(competitions);
export const insertProblemTagSchema = createInsertSchema(problemTags);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type ProblemTag = typeof problemTags.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;
