import dotenv from 'dotenv';
dotenv.config();

import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { Pool } from 'pg';
import connectPg from 'connect-pg-simple';
import { db } from '@db';
import * as schema from "@shared/schema";
import { insertUserSchema, users, problems, problemTags, submissions, competitions, userCompetitions, competitionProblems, userStats, userSkills, problemToTag, discussions, discussionReplies, discussionLikes, discussionReplyLikes, type SelectUser } from "@shared/schema";
import { eq, and, desc, asc, sql, isNull, not, like, or } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Utility functions for password hashing
const scryptAsync = promisify(scrypt);

// Define a minimal session store interface to avoid type errors
interface SessionStore {
  get: (sid: string, callback: (err: any, session?: any) => void) => void;
  set: (sid: string, session: any, callback?: (err?: any) => void) => void;
  destroy: (sid: string, callback?: (err?: any) => void) => void;
}

export interface IStorage {
  // User-related operations
  getUser: (id: number) => Promise<any>;
  getUserByUsername: (username: string) => Promise<any>;
  createUser: (user: any) => Promise<any>;
  updateUser: (id: number, data: any) => Promise<any>;
  getAllUsers: () => Promise<any[]>;
  getUsersByRole: (role: string) => Promise<any[]>;

  // Problem-related operations
  getProblem: (id: number) => Promise<any>;
  getProblems: (filters?: any) => Promise<any[]>;
  createProblem: (problem: any) => Promise<any>;
  updateProblem: (id: number, data: any) => Promise<any>;
  deleteProblem: (id: number) => Promise<boolean>;
  getProblemTags: () => Promise<any[]>;
  createProblemTag: (tag: any) => Promise<any>;
  addTagToProblem: (problemId: number, tagId: number) => Promise<any>;

  // Submission-related operations
  createSubmission: (submission: any) => Promise<any>;
  getUserSubmissions: (userId: number) => Promise<any[]>;
  getProblemSubmissions: (problemId: number) => Promise<any[]>;
  getSubmission: (id: number) => Promise<any>;

  // Competition-related operations
  getCompetitions: () => Promise<any[]>;
  getCompetition: (id: number) => Promise<any>;
  createCompetition: (competition: any) => Promise<any>;
  addProblemToCompetition: (competitionId: number, problemId: number, points: number) => Promise<any>;
  registerForCompetition: (userId: number, competitionId: number) => Promise<any>;
  getCompetitionLeaderboard: (competitionId: number) => Promise<any[]>;
  getActiveCompetitions: () => Promise<any[]>;

  // Stats-related operations
  getUserStats: (userId: number) => Promise<any>;
  updateUserStats: (userId: number, stats: any) => Promise<any>;
  getTopRankedUsers: (limit?: number) => Promise<any[]>;
  getUserSkills: (userId: number) => Promise<any[]>;
  updateUserSkill: (userId: number, tagId: number, proficiency: number) => Promise<any>;

  // Session store
  sessionStore: SessionStore;

  // Code execution
  executeCode: (language: string, code: string) => Promise<{ output: string; error?: string; success: boolean }>;

  // Discussions
  getDiscussions(filters: any): Promise<any>;
  getDiscussion(id: number): Promise<any>;
  createDiscussion(data: any): Promise<any>;
  getDiscussionReplies(discussionId: number): Promise<any>;
  createDiscussionReply(data: any): Promise<any>;
  toggleDiscussionLike(discussionId: number, userId: number): Promise<any>;
}

const execAsync = promisify(exec);

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // Utility functions for password operations
  async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  // User-related operations
  async getUser(id: number) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id)
      });
      return user || null;
    } catch (error) {
      console.error("Error in getUser:", error);
      return null;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.username, username)
      });
      return user || null;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return null;
    }
  }

  async createUser(userData: any) {
    try {
      const [user] = await db.insert(schema.users)
        .values({
          ...userData,
          createdAt: new Date()
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  async updateUser(id: number, data: any) {
    try {
      const [updatedUser] = await db.update(schema.users)
        .set(data)
        .where(eq(schema.users.id, id))
        .returning();
      return updatedUser || null;
    } catch (error) {
      console.error("Error in updateUser:", error);
      return null;
    }
  }

  async getAllUsers() {
    try {
      const users = await db.query.users.findMany({
        orderBy: asc(schema.users.username)
      });
      return users;
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  }

  async getUsersByRole(role: string) {
    try {
      const users = await db.query.users.findMany({
        where: eq(schema.users.role, role),
        orderBy: asc(schema.users.username)
      });
      return users;
    } catch (error) {
      console.error("Error in getUsersByRole:", error);
      return [];
    }
  }

  // Problem-related operations
  async getProblem(id: number) {
    try {
      const problem = await db.query.problems.findFirst({
        where: eq(schema.problems.id, id)
      });

      if (!problem) return null;

      // Fetch tags separately to avoid relation issues
      const problemTags = await db.query.problemTags.findMany({
        where: eq(schema.problemTags.problemId, id),
        with: {
          tag: true
        }
      });

      return {
        ...problem,
        tags: problemTags.map(pt => pt.tag)
      };
    } catch (error) {
      console.error("Error in getProblem:", error);
      return null;
    }
  }

  async getProblems(filters: any = {}) {
    try {
      let query = db.select().from(schema.problems);

      if (filters.difficulty) {
        query = query.where(eq(schema.problems.difficulty, filters.difficulty));
      }

      if (filters.search) {
        query = query.where(or(
          like(schema.problems.title, `%${filters.search}%`),
          like(schema.problems.description, `%${filters.search}%`)
        ));
      }

      const problems = await query.orderBy(asc(schema.problems.id));

      // For each problem, fetch its tags
      const problemsWithTags = await Promise.all(
        problems.map(async (problem) => {
          const problemTags = await db.query.problemToTag.findMany({
            where: eq(schema.problemToTag.problemId, problem.id),
            with: {
              tag: true
            }
          });

          return {
            ...problem,
            tags: problemTags.map(pt => pt.tag)
          };
        })
      );

      return problemsWithTags;
    } catch (error) {
      console.error("Error in getProblems:", error);
      return [];
    }
  }

  async createProblem(problemData: any) {
    try {
      const [problem] = await db.insert(schema.problems)
        .values({
          ...problemData,
          createdAt: new Date()
        })
        .returning();
      return problem;
    } catch (error) {
      console.error("Error in createProblem:", error);
      throw error;
    }
  }

  async updateProblem(id: number, data: any) {
    try {
      const [updatedProblem] = await db.update(schema.problems)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.problems.id, id))
        .returning();
      return updatedProblem || null;
    } catch (error) {
      console.error("Error in updateProblem:", error);
      return null;
    }
  }

  async deleteProblem(id: number) {
    try {
      // Delete problem tags first
      await db.delete(schema.problemToTag)
        .where(eq(schema.problemToTag.problemId, id));

      // Delete the problem
      const result = await db.delete(schema.problems)
        .where(eq(schema.problems.id, id));

      return result.count > 0;
    } catch (error) {
      console.error("Error in deleteProblem:", error);
      return false;
    }
  }

  async getProblemTags() {
    try {
      const tags = await db.query.problemTags.findMany({
        orderBy: asc(schema.problemTags.name)
      });
      return tags;
    } catch (error) {
      console.error("Error in getProblemTags:", error);
      return [];
    }
  }

  async createProblemTag(tag: any) {
    try {
      const [newTag] = await db.insert(schema.problemTags)
        .values(tag)
        .returning();
      return newTag;
    } catch (error) {
      console.error("Error in createProblemTag:", error);
      throw error;
    }
  }

  async addTagToProblem(problemId: number, tagId: number) {
    try {
      const [association] = await db.insert(schema.problemToTag)
        .values({ problemId, tagId })
        .returning();
      return association;
    } catch (error) {
      console.error("Error in addTagToProblem:", error);
      throw error;
    }
  }

  // Submission-related operations
  async createSubmission(submissionData: any) {
    try {
      const [submission] = await db.insert(schema.submissions)
        .values({
          ...submissionData,
          createdAt: new Date()
        })
        .returning();

      // Update user stats after submission
      await this.updateUserStatsAfterSubmission(
        submission.userId,
        submission.problemId,
        submission.status === 'accepted'
      );

      return submission;
    } catch (error) {
      console.error("Error in createSubmission:", error);
      throw error;
    }
  }

  async getUserSubmissions(userId: number) {
    try {
      const submissions = await db.query.submissions.findMany({
        where: eq(schema.submissions.userId, userId),
        orderBy: desc(schema.submissions.createdAt),
        with: {
          problem: true
        }
      });
      return submissions;
    } catch (error) {
      console.error("Error in getUserSubmissions:", error);
      return [];
    }
  }

  async getProblemSubmissions(problemId: number) {
    try {
      const submissions = await db.query.submissions.findMany({
        where: eq(schema.submissions.problemId, problemId),
        orderBy: desc(schema.submissions.createdAt),
        with: {
          user: true
        }
      });
      return submissions;
    } catch (error) {
      console.error("Error in getProblemSubmissions:", error);
      return [];
    }
  }

  async getSubmission(id: number) {
    try {
      const submission = await db.query.submissions.findFirst({
        where: eq(schema.submissions.id, id),
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
      const competitions = await db.query.competitions.findMany({
        orderBy: desc(schema.competitions.startTime)
      });
      return competitions;
    } catch (error) {
      console.error("Error in getCompetitions:", error);
      return [];
    }
  }

  async getCompetition(id: number) {
    try {
      const competition = await db.query.competitions.findFirst({
        where: eq(schema.competitions.id, id)
      });

      if (!competition) return null;

      // Get problems in this competition
      const competitionProblems = await db.query.competitionProblems.findMany({
        where: eq(schema.competitionProblems.competitionId, id),
        with: {
          problem: true
        }
      });

      return {
        ...competition,
        problems: competitionProblems.map(cp => ({
          ...cp.problem,
          points: cp.points
        }))
      };
    } catch (error) {
      console.error("Error in getCompetition:", error);
      return null;
    }
  }

  async createCompetition(competitionData: any) {
    try {
      const [competition] = await db.insert(schema.competitions)
        .values({
          ...competitionData,
          createdAt: new Date()
        })
        .returning();
      return competition;
    } catch (error) {
      console.error("Error in createCompetition:", error);
      throw error;
    }
  }

  async addProblemToCompetition(competitionId: number, problemId: number, points: number) {
    try {
      const [association] = await db.insert(schema.competitionProblems)
        .values({ competitionId, problemId, points })
        .returning();
      return association;
    } catch (error) {
      console.error("Error in addProblemToCompetition:", error);
      throw error;
    }
  }

  async registerForCompetition(userId: number, competitionId: number) {
    try {
      const [registration] = await db.insert(schema.userCompetitions)
        .values({
          userId,
          competitionId,
          score: 0,
          rank: 0,
          registeredAt: new Date()
        })
        .returning();
      return registration;
    } catch (error) {
      console.error("Error in registerForCompetition:", error);
      throw error;
    }
  }

  async getCompetitionLeaderboard(competitionId: number) {
    try {
      const participants = await db.query.userCompetitions.findMany({
        where: eq(schema.userCompetitions.competitionId, competitionId),
        orderBy: [
          desc(schema.userCompetitions.score),
          asc(schema.userCompetitions.registeredAt)
        ],
        with: {
          user: true
        }
      });

      // Update ranks based on the sorted order
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
      const now = new Date();
      const competitions = await db.query.competitions.findMany({
        where: and(
          sql`${schema.competitions.startTime} <= ${now}`,
          sql`${schema.competitions.endTime} >= ${now}`
        ),
        orderBy: desc(schema.competitions.endTime)
      });
      return competitions;
    } catch (error) {
      console.error("Error in getActiveCompetitions:", error);
      return [];
    }
  }

  // Stats-related operations
  async getUserStats(userId: number) {
    try {
      const stats = await db.query.userStats.findFirst({
        where: eq(schema.userStats.userId, userId)
      });

      if (stats) return stats;

      // Create stats if they don't exist
      const [newStats] = await db.insert(schema.userStats)
        .values({
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
          lastActivityDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return newStats;
    } catch (error) {
      console.error("Error in getUserStats:", error);
      return null;
    }
  }

  async updateUserStats(userId: number, statsData: any) {
    try {
      // Check if stats exist
      const existingStats = await db.query.userStats.findFirst({
        where: eq(schema.userStats.userId, userId)
      });

      if (existingStats) {
        // Update existing stats
        const [updatedStats] = await db.update(schema.userStats)
          .set({
            ...statsData,
            updatedAt: new Date()
          })
          .where(eq(schema.userStats.userId, userId))
          .returning();

        return updatedStats;
      } else {
        // Create new stats
        const [newStats] = await db.insert(schema.userStats)
          .values({
            userId,
            ...statsData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();

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
          desc(schema.userStats.problemsSolved),
          desc(schema.userStats.acceptedSubmissions)
        ],
        limit,
        with: {
          user: true
        }
      });

      // Update ranks based on the sorted order
      return rankings.map((ranking, index) => ({
        ...ranking,
        ranking: index + 1
      }));
    } catch (error) {
      console.error("Error in getTopRankedUsers:", error);
      return [];
    }
  }

  async getUserSkills(userId: number) {
    try {
      const skills = await db.query.userSkills.findMany({
        where: eq(schema.userSkills.userId, userId),
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

  async updateUserSkill(userId: number, tagId: number, proficiency: number) {
    try {
      // Check if skill exists
      const existingSkill = await db.query.userSkills.findFirst({
        where: and(
          eq(schema.userSkills.userId, userId),
          eq(schema.userSkills.tagId, tagId)
        )
      });

      if (existingSkill) {
        // Update existing skill
        const [updatedSkill] = await db.update(schema.userSkills)
          .set({
            proficiency,
            updatedAt: new Date()
          })
          .where(and(
            eq(schema.userSkills.userId, userId),
            eq(schema.userSkills.tagId, tagId)
          ))
          .returning();

        return updatedSkill;
      } else {
        // Create new skill
        const [newSkill] = await db.insert(schema.userSkills)
          .values({
            userId,
            tagId,
            proficiency,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();

        return newSkill;
      }
    } catch (error) {
      console.error("Error in updateUserSkill:", error);
      return null;
    }
  }

  // Discussions
  async getDiscussions(filters: any = {}) {
    try {
      let query = db
        .select({
          id: discussions.id,
          title: discussions.title,
          content: discussions.content,
          category: discussions.category,
          tags: discussions.tags,
          isPinned: discussions.isPinned,
          views: discussions.views,
          createdAt: discussions.createdAt,
          updatedAt: discussions.updatedAt,
          author: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
          },
          replyCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM ${discussionReplies} 
            WHERE ${discussionReplies.discussionId} = ${discussions.id}
          )`,
          likeCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM ${discussionLikes} 
            WHERE ${discussionLikes.discussionId} = ${discussions.id}
          )`
        })
        .from(discussions)
        .leftJoin(users, eq(discussions.authorId, users.id));

      if (filters.category && filters.category !== 'All Categories') {
        query = query.where(eq(discussions.category, filters.category));
      }

      if (filters.search) {
        query = query.where(
          sql`${discussions.title} ILIKE ${'%' + filters.search + '%'} OR 
              ${discussions.content} ILIKE ${'%' + filters.search + '%'}`
        );
      }

      return await query.orderBy(desc(discussions.isPinned), desc(discussions.updatedAt));
    } catch (error) {
      console.error("Error fetching discussions:", error);
      throw error;
    }
  }

  async getDiscussion(id: number) {
    try {
      const result = await db
        .select({
          id: discussions.id,
          title: discussions.title,
          content: discussions.content,
          category: discussions.category,
          tags: discussions.tags,
          isPinned: discussions.isPinned,
          views: discussions.views,
          createdAt: discussions.createdAt,
          updatedAt: discussions.updatedAt,
          author: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
          },
          replyCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM ${discussionReplies} 
            WHERE ${discussionReplies.discussionId} = ${discussions.id}
          )`,
          likeCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM ${discussionLikes} 
            WHERE ${discussionLikes.discussionId} = ${discussions.id}
          )`
        })
        .from(discussions)
        .leftJoin(users, eq(discussions.authorId, users.id))
        .where(eq(discussions.id, id));

      if (result.length === 0) return null;

      // Increment view count
      await db
        .update(discussions)
        .set({ views: sql`${discussions.views} + 1` })
        .where(eq(discussions.id, id));

      return result[0];
    } catch (error) {
      console.error("Error fetching discussion:", error);
      throw error;
    }
  }

  async createDiscussion(data: any) {
    try {
      const result = await db
        .insert(discussions)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating discussion:", error);
      throw error;
    }
  }

  async getDiscussionReplies(discussionId: number) {
    try {
      return await db
        .select({
          id: discussionReplies.id,
          content: discussionReplies.content,
          parentReplyId: discussionReplies.parentReplyId,
          createdAt: discussionReplies.createdAt,
          updatedAt: discussionReplies.updatedAt,
          author: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
          },
          likeCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM ${discussionReplyLikes} 
            WHERE ${discussionReplyLikes.replyId} = ${discussionReplies.id}
          )`
        })
        .from(discussionReplies)
        .leftJoin(users, eq(discussionReplies.authorId, users.id))
        .where(eq(discussionReplies.discussionId, discussionId))
        .orderBy(discussionReplies.createdAt);
    } catch (error) {
      console.error("Error fetching discussion replies:", error);
      throw error;
    }
  }

  async createDiscussionReply(data: any) {
    try {
      const result = await db
        .insert(discussionReplies)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating discussion reply:", error);
      throw error;
    }
  }

  async toggleDiscussionLike(discussionId: number, userId: number) {
    try {
      // Check if user already liked this discussion
      const existingLike = await db
        .select()
        .from(discussionLikes)
        .where(and(
          eq(discussionLikes.discussionId, discussionId),
          eq(discussionLikes.userId, userId)
        ));

      if (existingLike.length > 0) {
        // Unlike
        await db
          .delete(discussionLikes)
          .where(and(
            eq(discussionLikes.discussionId, discussionId),
            eq(discussionLikes.userId, userId)
          ));
        return { liked: false };
      } else {
        // Like
        await db
          .insert(discussionLikes)
          .values({ discussionId, userId });
        return { liked: true };
      }
    } catch (error) {
      console.error("Error toggling discussion like:", error);
      throw error;
    }
  }

  // Execute code
  async executeCode(language: string, code: string): Promise<{ output: string; error?: string; success: boolean }> {
    const tempDir = "/tmp";
    const filename = `code_${crypto.randomBytes(8).toString('hex')}`;
    const timeout = 10; // 10 seconds

    try {
      let command: string;
      let filepath: string;

      switch (language) {
        case "javascript":
          filepath = path.join(tempDir, `${filename}.js`);
          await fs.writeFile(filepath, code);
          command = `timeout ${timeout} node ${filepath}`;
          break;

        case "typescript":
          filepath = path.join(tempDir, `${filename}.ts`);
          await fs.writeFile(filepath, code);
          command = `timeout ${timeout} npx tsx ${filepath}`;
          break;

        case "python":
          filepath = path.join(tempDir, `${filename}.py`);
          await fs.writeFile(filepath, code);
          command = `timeout ${timeout} python3 ${filepath}`;
          break;

        case "java":
          const className = "Solution";
          filepath = path.join(tempDir, `${className}.java`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} javac ${className}.java && timeout ${timeout} java ${className}`;
          break;

        case "cpp":
          filepath = path.join(tempDir, `${filename}.cpp`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} g++ -o ${filename} ${filename}.cpp && timeout ${timeout} ./${filename}`;
          break;

        case "c":
          filepath = path.join(tempDir, `${filename}.c`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} gcc -o ${filename} ${filename}.c && timeout ${timeout} ./${filename}`;
          break;

        case "go":
          filepath = path.join(tempDir, `${filename}.go`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} go run ${filename}.go`;
          break;

        case "rust":
          filepath = path.join(tempDir, `${filename}.rs`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} rustc ${filename}.rs -o ${filename} && timeout ${timeout} ./${filename}`;
          break;

        case "php":
          filepath = path.join(tempDir, `${filename}.php`);
          await fs.writeFile(filepath, code);
          command = `timeout ${timeout} php ${filepath}`;
          break;

        case "ruby":
          filepath = path.join(tempDir, `${filename}.rb`);
          await fs.writeFile(filepath, code);
          command = `timeout ${timeout} ruby ${filepath}`;
          break;

        case "swift":
          filepath = path.join(tempDir, `${filename}.swift`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} swift ${filename}.swift`;
          break;

        case "kotlin":
          filepath = path.join(tempDir, `${filename}.kt`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} kotlinc ${filename}.kt -include-runtime -d ${filename}.jar && timeout ${timeout} java -jar ${filename}.jar`;
          break;

        case "dart":
          filepath = path.join(tempDir, `${filename}.dart`);
          await fs.writeFile(filepath, code);
          command = `timeout ${timeout} dart run ${filepath}`;
          break;

        case "scala":
          filepath = path.join(tempDir, `${filename}.scala`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} scala ${filename}.scala`;
          break;

        case "perl":
          filepath = path.join(tempDir, `${filename}.pl`);
          await fs.writeFile(filepath, code);
          command = `timeout ${timeout} perl ${filepath}`;
          break;

        case "objective-c":
          filepath = path.join(tempDir, `${filename}.m`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} clang -framework Foundation ${filename}.m -o ${filename} && timeout ${timeout} ./${filename}`;
          break;

        case "fsharp":
          filepath = path.join(tempDir, `${filename}.fs`);
          await fs.writeFile(filepath, code);
          command = `cd ${tempDir} && timeout ${timeout} fsharpc ${filename}.fs -o ${filename}.exe && timeout ${timeout} mono ${filename}.exe`;
          break;

        default:
          return {
            output: `Language '${language}' is not supported for execution in this environment`,
            success: false,
            error: "Unsupported language"
          };
      }

      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command);
      const executionTime = Date.now() - startTime;

      // Cleanup files
      try {
        await fs.unlink(filepath);
        // Also cleanup compiled files for Java and C/C++
        if (language === "java") {
          try {
            await fs.unlink(path.join(tempDir, "Solution.class"));
          } catch {}
        } else if (language === "cpp" || language === "c") {
          try {
            await fs.unlink(path.join(tempDir, filename));
          } catch {}
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      const hasOutput = stdout && stdout.trim().length > 0;
      const hasError = stderr && stderr.trim().length > 0;

      return {
        output: hasOutput ? stdout.trim() : (hasError ? stderr.trim() : "No output"),
        success: !hasError,
        error: hasError ? stderr.trim() : undefined
      };

    } catch (error: any) {
      console.error("Code execution error:", error);

      // Cleanup on error
      try {
        const filepath = path.join(tempDir, `${filename}.*`);
        await execAsync(`rm -f ${filepath}`);
      } catch {}

      let errorMessage = "Execution failed";
      if (error.message.includes("timeout")) {
        errorMessage = "Code execution timed out (10 seconds limit)";
      } else if (error.message.includes("Command failed")) {
        errorMessage = "Compilation or runtime error";
      }

      return {
        output: error.stdout || errorMessage,
        success: false,
        error: error.stderr || error.message
      };
    }
  }
}

// Export a singleton instance
// Export a singleton instance
export const storage = new DatabaseStorage();