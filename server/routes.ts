import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { insertProblemSchema, insertSubmissionSchema, insertCompetitionSchema, insertProblemTagSchema } from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();
import { insertUserSchema, users, problems, problemTags, submissions, competitions, type SelectUser } from "@shared/schema";
import { desc, eq, and, sql, count, avg } from "drizzle-orm";
import { requireAuth } from "./auth";
import { getDbConnection } from "@db";
import { hash } from "bcryptjs";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication and session handling
  setupAuth(app);

  const httpServer = createServer(app);

  // Users Routes
  app.get("/api/users", (req: any, res: Response) => {
    req.authorize(['super_admin', 'admin'])(req, res, async () => {
      try {
        const users = await storage.getAllUsers();
        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });

  app.get("/api/users/role/:role", (req: any, res: Response) => {
    const { role } = req.params;
    req.authorize(['super_admin', 'admin'])(req, res, async () => {
      try {
        const users = await storage.getUsersByRole(role);
        res.json(users);
      } catch (error) {
        console.error(`Error fetching users with role ${role}:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });

  // Problems Routes
  app.get("/api/problems", async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      const problems = await storage.getProblems(filters);
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/problems/:id", async (req: Request, res: Response) => {
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

  app.post("/api/problems", (req: any, res: Response) => {
    req.authorize(['super_admin', 'admin', 'examiner'])(req, res, async () => {
      try {
        const problemData = insertProblemSchema.parse(req.body);

        // Add the user as creator
        const data = {
          ...problemData,
          createdBy: req.user.id
        };

        const problem = await storage.createProblem(data);

        // Add tags if provided
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

  app.put("/api/problems/:id", (req: any, res: Response) => {
    const { id } = req.params;
    req.authorize(['super_admin', 'admin', 'examiner'])(req, res, async () => {
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

  app.delete("/api/problems/:id", (req: any, res: Response) => {
    const { id } = req.params;
    req.authorize(['super_admin', 'admin'])(req, res, async () => {
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

  // Problem Tags Routes
  app.get("/api/problem-tags", async (req: Request, res: Response) => {
    try {
      const tags = await storage.getProblemTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching problem tags:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/problem-tags", (req: any, res: Response) => {
    req.authorize(['super_admin', 'admin', 'examiner'])(req, res, async () => {
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

  // Submissions Routes
  app.post("/api/submissions", async (req: any, res: Response) => {
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

  app.get("/api/submissions", async (req: any, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.role === 'learner' ? req.user.id : req.query.userId;

    try {
      const submissions = await storage.getUserSubmissions(Number(userId));
      res.json(submissions);
    } catch (error) {
      console.error(`Error fetching submissions for user ${userId}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/problems/:id/submissions", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const submissions = await storage.getProblemSubmissions(Number(id));
      res.json(submissions);
    } catch (error) {
      console.error(`Error fetching submissions for problem ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Competitions Routes
  app.get("/api/competitions", async (req: Request, res: Response) => {
    try {
      const competitions = await storage.getCompetitions();
      res.json(competitions);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/competitions/active", async (req: Request, res: Response) => {
    try {
      const activeCompetitions = await storage.getActiveCompetitions();
      res.json(activeCompetitions);
    } catch (error) {
      console.error("Error fetching active competitions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/competitions/:id", async (req: Request, res: Response) => {
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

  app.post("/api/competitions", (req: any, res: Response) => {
    req.authorize(['super_admin', 'admin', 'examiner'])(req, res, async () => {
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

  app.post("/api/competitions/:id/problems", (req: any, res: Response) => {
    const { id } = req.params;
    req.authorize(['super_admin', 'admin', 'examiner'])(req, res, async () => {
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

  app.post("/api/competitions/:id/register", async (req: any, res: Response) => {
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

  app.get("/api/competitions/:id/leaderboard", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const leaderboard = await storage.getCompetitionLeaderboard(Number(id));
      res.json(leaderboard);
    } catch (error) {
      console.error(`Error fetching leaderboard for competition ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Stats Routes
  app.get("/api/users/:id/stats", async (req: Request, res: Response) => {
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

  app.get("/api/users/:id/skills", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const skills = await storage.getUserSkills(Number(id));
      res.json(skills);
    } catch (error) {
      console.error(`Error fetching skills for user ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const topUsers = await storage.getTopRankedUsers(limit);
      res.json(topUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Execute code
  app.post("/api/execute", requireAuth, async (req, res) => {
    try {
      const { language, code } = req.body;

      if (!language || !code) {
        return res.status(400).json({ 
          message: "Language and code are required",
          output: "Error: Missing language or code parameter",
          success: false
        });
      }

      const result = await storage.executeCode(language, code);
      res.json(result);
    } catch (error: any) {
      console.error("Error executing code:", error);
      res.status(500).json({ 
        message: "Failed to execute code",
        output: `Error: ${error.message || "Code execution failed"}`,
        success: false,
        error: error.message || "Internal server error"
      });
    }
  });

  

  return httpServer;
}