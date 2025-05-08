var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { Pool as Pool2 } from "pg";
import connectPg from "connect-pg-simple";

// db/index.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  competitionProblems: () => competitionProblems,
  competitionProblemsRelations: () => competitionProblemsRelations,
  competitions: () => competitions,
  competitionsRelations: () => competitionsRelations,
  difficultyEnum: () => difficultyEnum,
  insertCompetitionSchema: () => insertCompetitionSchema,
  insertProblemSchema: () => insertProblemSchema,
  insertProblemTagSchema: () => insertProblemTagSchema,
  insertSubmissionSchema: () => insertSubmissionSchema,
  insertUserSchema: () => insertUserSchema,
  problemTags: () => problemTags,
  problemTagsRelations: () => problemTagsRelations,
  problemToTag: () => problemToTag,
  problemToTagRelations: () => problemToTagRelations,
  problems: () => problems,
  problemsRelations: () => problemsRelations,
  programmingLanguageEnum: () => programmingLanguageEnum,
  submissionStatusEnum: () => submissionStatusEnum,
  submissions: () => submissions,
  submissionsRelations: () => submissionsRelations,
  userCompetitions: () => userCompetitions,
  userCompetitionsRelations: () => userCompetitionsRelations,
  userRoleEnum: () => userRoleEnum,
  userSkills: () => userSkills,
  userSkillsRelations: () => userSkillsRelations,
  userStats: () => userStats,
  userStatsRelations: () => userStatsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var userRoleEnum = pgEnum("user_role", ["super_admin", "admin", "examiner", "learner"]);
var difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
var submissionStatusEnum = pgEnum("submission_status", ["accepted", "wrong_answer", "time_limit_exceeded", "runtime_error", "compilation_error"]);
var programmingLanguageEnum = pgEnum("programming_language", ["javascript", "python", "java", "cpp", "ruby", "go", "csharp"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: userRoleEnum("role").notNull().default("learner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
  competitions: many(userCompetitions)
}));
var problemTags = pgTable("problem_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description")
});
var problemTagsRelations = relations(problemTags, ({ many }) => ({
  problemToTags: many(problemToTag)
}));
var problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  starterCode: jsonb("starter_code").notNull(),
  // JSON object with keys as language IDs and values as starter code
  testCases: jsonb("test_cases").notNull(),
  // JSON array of test cases
  timeLimit: integer("time_limit").notNull(),
  // in milliseconds
  memoryLimit: integer("memory_limit").notNull(),
  // in megabytes
  acceptanceRate: integer("acceptance_rate"),
  // to be calculated
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var problemsRelations = relations(problems, ({ many }) => ({
  submissions: many(submissions),
  problemToTags: many(problemToTag)
}));
var problemToTag = pgTable("problem_to_tag", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").notNull().references(() => problems.id),
  tagId: integer("tag_id").notNull().references(() => problemTags.id)
});
var problemToTagRelations = relations(problemToTag, ({ one }) => ({
  problem: one(problems, {
    fields: [problemToTag.problemId],
    references: [problems.id]
  }),
  tag: one(problemTags, {
    fields: [problemToTag.tagId],
    references: [problemTags.id]
  })
}));
var submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  problemId: integer("problem_id").notNull().references(() => problems.id),
  language: programmingLanguageEnum("language").notNull(),
  code: text("code").notNull(),
  status: submissionStatusEnum("status").notNull(),
  runTime: integer("run_time"),
  // in milliseconds
  memory: integer("memory"),
  // in kilobytes
  competitionId: integer("competition_id").references(() => competitions.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id]
  }),
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id]
  }),
  competition: one(competitions, {
    fields: [submissions.competitionId],
    references: [competitions.id]
  })
}));
var competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var competitionsRelations = relations(competitions, ({ many }) => ({
  competitionProblems: many(competitionProblems),
  participants: many(userCompetitions),
  submissions: many(submissions)
}));
var competitionProblems = pgTable("competition_problems", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").notNull().references(() => competitions.id),
  problemId: integer("problem_id").notNull().references(() => problems.id),
  points: integer("points").notNull()
});
var competitionProblemsRelations = relations(competitionProblems, ({ one }) => ({
  competition: one(competitions, {
    fields: [competitionProblems.competitionId],
    references: [competitions.id]
  }),
  problem: one(problems, {
    fields: [competitionProblems.problemId],
    references: [problems.id]
  })
}));
var userCompetitions = pgTable("user_competitions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  competitionId: integer("competition_id").notNull().references(() => competitions.id),
  score: integer("score").default(0),
  rank: integer("rank"),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});
var userCompetitionsRelations = relations(userCompetitions, ({ one }) => ({
  user: one(users, {
    fields: [userCompetitions.userId],
    references: [users.id]
  }),
  competition: one(competitions, {
    fields: [userCompetitions.competitionId],
    references: [competitions.id]
  })
}));
var userStats = pgTable("user_stats", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id]
  })
}));
var userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tagId: integer("tag_id").notNull().references(() => problemTags.id),
  proficiency: integer("proficiency").notNull().default(0),
  // 0-100 score
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id]
  }),
  tag: one(problemTags, {
    fields: [userSkills.tagId],
    references: [problemTags.id]
  })
}));
var insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  email: (schema) => schema.email("Must be a valid email"),
  role: (schema) => schema
});
var insertProblemSchema = createInsertSchema(problems);
var insertSubmissionSchema = createInsertSchema(submissions);
var insertCompetitionSchema = createInsertSchema(competitions);
var insertProblemTagSchema = createInsertSchema(problemTags);

// db/index.ts
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, asc, sql, like, or } from "drizzle-orm";
var PostgresSessionStore = connectPg(session);
var pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
var scryptAsync = promisify(scrypt);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool2,
      createTableIfMissing: true
    });
  }
  // Utility functions for password operations
  async hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const buf = await scryptAsync(password, salt, 64);
    return `${buf.toString("hex")}.${salt}`;
  }
  async comparePasswords(supplied, stored) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }
  // User-related operations
  async getUser(id) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id)
      });
      return user || null;
    } catch (error) {
      console.error("Error in getUser:", error);
      return null;
    }
  }
  async getUserByUsername(username) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      return user || null;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return null;
    }
  }
  async createUser(userData) {
    try {
      const [user] = await db.insert(users).values({
        ...userData,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  async updateUser(id, data) {
    try {
      const [updatedUser] = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return updatedUser || null;
    } catch (error) {
      console.error("Error in updateUser:", error);
      return null;
    }
  }
  async getAllUsers() {
    try {
      const users2 = await db.query.users.findMany({
        orderBy: asc(users.username)
      });
      return users2;
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  }
  async getUsersByRole(role) {
    try {
      const users2 = await db.query.users.findMany({
        where: eq(users.role, role),
        orderBy: asc(users.username)
      });
      return users2;
    } catch (error) {
      console.error("Error in getUsersByRole:", error);
      return [];
    }
  }
  // Problem-related operations
  async getProblem(id) {
    try {
      const problem = await db.query.problems.findFirst({
        where: eq(problems.id, id),
        with: {
          tags: {
            with: {
              tag: true
            }
          }
        }
      });
      if (!problem) return null;
      return {
        ...problem,
        tags: problem.tags.map((pt) => pt.tag)
      };
    } catch (error) {
      console.error("Error in getProblem:", error);
      return null;
    }
  }
  async getProblems(filters = {}) {
    try {
      let query = db.select().from(problems);
      if (filters.difficulty) {
        query = query.where(eq(problems.difficulty, filters.difficulty));
      }
      if (filters.search) {
        query = query.where(or(
          like(problems.title, `%${filters.search}%`),
          like(problems.description, `%${filters.search}%`)
        ));
      }
      const problems2 = await query.orderBy(asc(problems.id));
      const problemsWithTags = await Promise.all(
        problems2.map(async (problem) => {
          const problemTags2 = await db.query.problemToTag.findMany({
            where: eq(problemToTag.problemId, problem.id),
            with: {
              tag: true
            }
          });
          return {
            ...problem,
            tags: problemTags2.map((pt) => pt.tag)
          };
        })
      );
      return problemsWithTags;
    } catch (error) {
      console.error("Error in getProblems:", error);
      return [];
    }
  }
  async createProblem(problemData) {
    try {
      const [problem] = await db.insert(problems).values({
        ...problemData,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      return problem;
    } catch (error) {
      console.error("Error in createProblem:", error);
      throw error;
    }
  }
  async updateProblem(id, data) {
    try {
      const [updatedProblem] = await db.update(problems).set({
        ...data,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(problems.id, id)).returning();
      return updatedProblem || null;
    } catch (error) {
      console.error("Error in updateProblem:", error);
      return null;
    }
  }
  async deleteProblem(id) {
    try {
      await db.delete(problemToTag).where(eq(problemToTag.problemId, id));
      const result = await db.delete(problems).where(eq(problems.id, id));
      return result.count > 0;
    } catch (error) {
      console.error("Error in deleteProblem:", error);
      return false;
    }
  }
  async getProblemTags() {
    try {
      const tags = await db.query.problemTags.findMany({
        orderBy: asc(problemTags.name)
      });
      return tags;
    } catch (error) {
      console.error("Error in getProblemTags:", error);
      return [];
    }
  }
  async createProblemTag(tag) {
    try {
      const [newTag] = await db.insert(problemTags).values(tag).returning();
      return newTag;
    } catch (error) {
      console.error("Error in createProblemTag:", error);
      throw error;
    }
  }
  async addTagToProblem(problemId, tagId) {
    try {
      const [association] = await db.insert(problemToTag).values({ problemId, tagId }).returning();
      return association;
    } catch (error) {
      console.error("Error in addTagToProblem:", error);
      throw error;
    }
  }
  // Submission-related operations
  async createSubmission(submissionData) {
    try {
      const [submission] = await db.insert(submissions).values({
        ...submissionData,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      await this.updateUserStatsAfterSubmission(
        submission.userId,
        submission.problemId,
        submission.status === "accepted"
      );
      return submission;
    } catch (error) {
      console.error("Error in createSubmission:", error);
      throw error;
    }
  }
  async getUserSubmissions(userId) {
    try {
      const submissions2 = await db.query.submissions.findMany({
        where: eq(submissions.userId, userId),
        orderBy: desc(submissions.createdAt),
        with: {
          problem: true
        }
      });
      return submissions2;
    } catch (error) {
      console.error("Error in getUserSubmissions:", error);
      return [];
    }
  }
  async getProblemSubmissions(problemId) {
    try {
      const submissions2 = await db.query.submissions.findMany({
        where: eq(submissions.problemId, problemId),
        orderBy: desc(submissions.createdAt),
        with: {
          user: true
        }
      });
      return submissions2;
    } catch (error) {
      console.error("Error in getProblemSubmissions:", error);
      return [];
    }
  }
  async getSubmission(id) {
    try {
      const submission = await db.query.submissions.findFirst({
        where: eq(submissions.id, id),
        with: {
          user: true,
          problem: true
        }
      });
      return submission || null;
    } catch (error) {
      console.error("Error in getSubmission:", error);
      return null;
    }
  }
  // Competition-related operations
  async getCompetitions() {
    try {
      const competitions2 = await db.query.competitions.findMany({
        orderBy: desc(competitions.startTime)
      });
      return competitions2;
    } catch (error) {
      console.error("Error in getCompetitions:", error);
      return [];
    }
  }
  async getCompetition(id) {
    try {
      const competition = await db.query.competitions.findFirst({
        where: eq(competitions.id, id)
      });
      if (!competition) return null;
      const competitionProblems2 = await db.query.competitionProblems.findMany({
        where: eq(competitionProblems.competitionId, id),
        with: {
          problem: true
        }
      });
      return {
        ...competition,
        problems: competitionProblems2.map((cp) => ({
          ...cp.problem,
          points: cp.points
        }))
      };
    } catch (error) {
      console.error("Error in getCompetition:", error);
      return null;
    }
  }
  async createCompetition(competitionData) {
    try {
      const [competition] = await db.insert(competitions).values({
        ...competitionData,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      return competition;
    } catch (error) {
      console.error("Error in createCompetition:", error);
      throw error;
    }
  }
  async addProblemToCompetition(competitionId, problemId, points) {
    try {
      const [association] = await db.insert(competitionProblems).values({ competitionId, problemId, points }).returning();
      return association;
    } catch (error) {
      console.error("Error in addProblemToCompetition:", error);
      throw error;
    }
  }
  async registerForCompetition(userId, competitionId) {
    try {
      const [registration] = await db.insert(userCompetitions).values({
        userId,
        competitionId,
        score: 0,
        rank: 0,
        registeredAt: /* @__PURE__ */ new Date()
      }).returning();
      return registration;
    } catch (error) {
      console.error("Error in registerForCompetition:", error);
      throw error;
    }
  }
  async getCompetitionLeaderboard(competitionId) {
    try {
      const participants = await db.query.userCompetitions.findMany({
        where: eq(userCompetitions.competitionId, competitionId),
        orderBy: [
          desc(userCompetitions.score),
          asc(userCompetitions.registeredAt)
        ],
        with: {
          user: true
        }
      });
      return participants.map((participant, index) => ({
        ...participant,
        rank: index + 1
      }));
    } catch (error) {
      console.error("Error in getCompetitionLeaderboard:", error);
      return [];
    }
  }
  async getActiveCompetitions() {
    try {
      const now = /* @__PURE__ */ new Date();
      const competitions2 = await db.query.competitions.findMany({
        where: and(
          sql`${competitions.startTime} <= ${now}`,
          sql`${competitions.endTime} >= ${now}`
        ),
        orderBy: desc(competitions.endTime)
      });
      return competitions2;
    } catch (error) {
      console.error("Error in getActiveCompetitions:", error);
      return [];
    }
  }
  // Stats-related operations
  async getUserStats(userId) {
    try {
      const stats = await db.query.userStats.findFirst({
        where: eq(userStats.userId, userId)
      });
      if (stats) return stats;
      const [newStats] = await db.insert(userStats).values({
        userId,
        problemsSolved: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        currentStreak: 0,
        longestStreak: 0,
        ranking: 9999,
        lastActivityDate: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return newStats;
    } catch (error) {
      console.error("Error in getUserStats:", error);
      return null;
    }
  }
  async updateUserStats(userId, statsData) {
    try {
      const existingStats = await db.query.userStats.findFirst({
        where: eq(userStats.userId, userId)
      });
      if (existingStats) {
        const [updatedStats] = await db.update(userStats).set({
          ...statsData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(userStats.userId, userId)).returning();
        return updatedStats;
      } else {
        const [newStats] = await db.insert(userStats).values({
          userId,
          ...statsData,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newStats;
      }
    } catch (error) {
      console.error("Error in updateUserStats:", error);
      return null;
    }
  }
  async getTopRankedUsers(limit = 10) {
    try {
      const rankings = await db.query.userStats.findMany({
        orderBy: [
          desc(userStats.problemsSolved),
          desc(userStats.acceptedSubmissions)
        ],
        limit,
        with: {
          user: true
        }
      });
      return rankings.map((ranking, index) => ({
        ...ranking,
        ranking: index + 1
      }));
    } catch (error) {
      console.error("Error in getTopRankedUsers:", error);
      return [];
    }
  }
  async getUserSkills(userId) {
    try {
      const skills = await db.query.userSkills.findMany({
        where: eq(userSkills.userId, userId),
        with: {
          tag: true
        }
      });
      return skills;
    } catch (error) {
      console.error("Error in getUserSkills:", error);
      return [];
    }
  }
  async updateUserSkill(userId, tagId, proficiency) {
    try {
      const existingSkill = await db.query.userSkills.findFirst({
        where: and(
          eq(userSkills.userId, userId),
          eq(userSkills.tagId, tagId)
        )
      });
      if (existingSkill) {
        const [updatedSkill] = await db.update(userSkills).set({
          proficiency,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(
          eq(userSkills.userId, userId),
          eq(userSkills.tagId, tagId)
        )).returning();
        return updatedSkill;
      } else {
        const [newSkill] = await db.insert(userSkills).values({
          userId,
          tagId,
          proficiency,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newSkill;
      }
    } catch (error) {
      console.error("Error in updateUserSkill:", error);
      return null;
    }
  }
  // Helper methods
  async updateUserStatsAfterSubmission(userId, problemId, isAccepted) {
    try {
      const userStats2 = await this.getUserStats(userId);
      if (!userStats2) return;
      const problem = await this.getProblem(problemId);
      if (!problem) return;
      const updates = {
        totalSubmissions: userStats2.totalSubmissions + 1,
        lastActivityDate: /* @__PURE__ */ new Date()
      };
      if (isAccepted) {
        const previousSubmissions = await db.query.submissions.findMany({
          where: and(
            eq(submissions.userId, userId),
            eq(submissions.problemId, problemId),
            eq(submissions.status, "accepted")
          ),
          orderBy: desc(submissions.createdAt),
          limit: 2
          // Get the most recent accepted submission + the current one
        });
        if (previousSubmissions.length <= 1) {
          updates.problemsSolved = userStats2.problemsSolved + 1;
          updates.acceptedSubmissions = userStats2.acceptedSubmissions + 1;
          if (problem.difficulty === "easy") {
            updates.easySolved = userStats2.easySolved + 1;
          } else if (problem.difficulty === "medium") {
            updates.mediumSolved = userStats2.mediumSolved + 1;
          } else if (problem.difficulty === "hard") {
            updates.hardSolved = userStats2.hardSolved + 1;
          }
          const today = (/* @__PURE__ */ new Date()).toDateString();
          const lastActivity = new Date(userStats2.lastActivityDate).toDateString();
          if (today === lastActivity) {
          } else if (new Date(today).getTime() - new Date(lastActivity).getTime() <= 864e5) {
            updates.currentStreak = userStats2.currentStreak + 1;
            if (updates.currentStreak > userStats2.longestStreak) {
              updates.longestStreak = updates.currentStreak;
            }
          } else {
            updates.currentStreak = 1;
          }
        }
      }
      await this.updateUserStats(userId, updates);
    } catch (error) {
      console.error("Error in updateUserStatsAfterSubmission:", error);
    }
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt as scrypt2, randomBytes as randomBytes2, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify2 } from "util";
var scryptAsync2 = promisify2(scrypt2);
async function hashPassword(password) {
  const salt = randomBytes2(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync2(supplied, salt, 64);
  return timingSafeEqual2(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  if (!process.env.SESSION_SECRET) {
    console.warn("No SESSION_SECRET environment variable set, using a default secret");
  }
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "CodeLearn-default-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours,
      sameSite: "lax"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err2) => {
        if (err2) {
          return next(err2);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  const authorize = (roles) => {
    return (req, res, next) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      next();
    };
  };
  app2.use((req, res, next) => {
    req.authorize = authorize;
    next();
  });
}

// server/routes.ts
import { ZodError } from "zod";
async function registerRoutes(app2) {
  setupAuth(app2);
  const httpServer = createServer(app2);
  app2.get("/api/users", (req, res) => {
    req.authorize(["super_admin", "admin"])(req, res, async () => {
      try {
        const users2 = await storage.getAllUsers();
        res.json(users2);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.get("/api/users/role/:role", (req, res) => {
    const { role } = req.params;
    req.authorize(["super_admin", "admin"])(req, res, async () => {
      try {
        const users2 = await storage.getUsersByRole(role);
        res.json(users2);
      } catch (error) {
        console.error(`Error fetching users with role ${role}:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.get("/api/problems", async (req, res) => {
    try {
      const filters = req.query;
      const problems2 = await storage.getProblems(filters);
      res.json(problems2);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/problems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const problem = await storage.getProblem(Number(id));
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      res.json(problem);
    } catch (error) {
      console.error(`Error fetching problem ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/problems", (req, res) => {
    req.authorize(["super_admin", "admin", "examiner"])(req, res, async () => {
      try {
        const problemData = insertProblemSchema.parse(req.body);
        const data = {
          ...problemData,
          createdBy: req.user.id
        };
        const problem = await storage.createProblem(data);
        if (req.body.tags && Array.isArray(req.body.tags)) {
          for (const tagId of req.body.tags) {
            await storage.addTagToProblem(problem.id, tagId);
          }
        }
        res.status(201).json(problem);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        console.error("Error creating problem:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.put("/api/problems/:id", (req, res) => {
    const { id } = req.params;
    req.authorize(["super_admin", "admin", "examiner"])(req, res, async () => {
      try {
        const problemData = req.body;
        const updatedProblem = await storage.updateProblem(Number(id), problemData);
        if (!updatedProblem) {
          return res.status(404).json({ message: "Problem not found" });
        }
        res.json(updatedProblem);
      } catch (error) {
        console.error(`Error updating problem ${id}:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.delete("/api/problems/:id", (req, res) => {
    const { id } = req.params;
    req.authorize(["super_admin", "admin"])(req, res, async () => {
      try {
        const success = await storage.deleteProblem(Number(id));
        if (!success) {
          return res.status(404).json({ message: "Problem not found" });
        }
        res.status(204).send();
      } catch (error) {
        console.error(`Error deleting problem ${id}:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.get("/api/problem-tags", async (req, res) => {
    try {
      const tags = await storage.getProblemTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching problem tags:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/problem-tags", (req, res) => {
    req.authorize(["super_admin", "admin", "examiner"])(req, res, async () => {
      try {
        const tagData = insertProblemTagSchema.parse(req.body);
        const tag = await storage.createProblemTag(tagData);
        res.status(201).json(tag);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        console.error("Error creating problem tag:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.post("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const submissionData = insertSubmissionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.role === "learner" ? req.user.id : req.query.userId;
    try {
      const submissions2 = await storage.getUserSubmissions(Number(userId));
      res.json(submissions2);
    } catch (error) {
      console.error(`Error fetching submissions for user ${userId}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/problems/:id/submissions", async (req, res) => {
    try {
      const { id } = req.params;
      const submissions2 = await storage.getProblemSubmissions(Number(id));
      res.json(submissions2);
    } catch (error) {
      console.error(`Error fetching submissions for problem ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/competitions", async (req, res) => {
    try {
      const competitions2 = await storage.getCompetitions();
      res.json(competitions2);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/competitions/active", async (req, res) => {
    try {
      const activeCompetitions = await storage.getActiveCompetitions();
      res.json(activeCompetitions);
    } catch (error) {
      console.error("Error fetching active competitions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/competitions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const competition = await storage.getCompetition(Number(id));
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      res.json(competition);
    } catch (error) {
      console.error(`Error fetching competition ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/competitions", (req, res) => {
    req.authorize(["super_admin", "admin", "examiner"])(req, res, async () => {
      try {
        const competitionData = insertCompetitionSchema.parse({
          ...req.body,
          createdBy: req.user.id
        });
        const competition = await storage.createCompetition(competitionData);
        res.status(201).json(competition);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        console.error("Error creating competition:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.post("/api/competitions/:id/problems", (req, res) => {
    const { id } = req.params;
    req.authorize(["super_admin", "admin", "examiner"])(req, res, async () => {
      try {
        const { problemId, points } = req.body;
        if (!problemId || !points) {
          return res.status(400).json({ message: "Problem ID and points are required" });
        }
        const competitionProblem = await storage.addProblemToCompetition(
          Number(id),
          Number(problemId),
          Number(points)
        );
        res.status(201).json(competitionProblem);
      } catch (error) {
        console.error(`Error adding problem to competition ${id}:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
  app2.post("/api/competitions/:id/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { id } = req.params;
    try {
      const registration = await storage.registerForCompetition(req.user.id, Number(id));
      res.status(201).json(registration);
    } catch (error) {
      console.error(`Error registering for competition ${id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/competitions/:id/leaderboard", async (req, res) => {
    try {
      const { id } = req.params;
      const leaderboard = await storage.getCompetitionLeaderboard(Number(id));
      res.json(leaderboard);
    } catch (error) {
      console.error(`Error fetching leaderboard for competition ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/stats", async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getUserStats(Number(id));
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      res.json(stats);
    } catch (error) {
      console.error(`Error fetching stats for user ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/skills", async (req, res) => {
    try {
      const { id } = req.params;
      const skills = await storage.getUserSkills(Number(id));
      res.json(skills);
    } catch (error) {
      console.error(`Error fetching skills for user ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const topUsers = await storage.getTopRankedUsers(limit);
      res.json(topUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
