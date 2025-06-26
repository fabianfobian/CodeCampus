
-- Learning Paths tables
CREATE TYPE "difficulty" AS ENUM('easy', 'medium', 'hard');

CREATE TABLE IF NOT EXISTS "learning_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"total_lessons" integer DEFAULT 0 NOT NULL,
	"estimated_hours" integer DEFAULT 0 NOT NULL,
	"topics" jsonb NOT NULL,
	"prerequisites" jsonb DEFAULT '[]' NOT NULL,
	"color" text DEFAULT 'bg-blue-500' NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "learning_path_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"path_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"order_index" integer NOT NULL,
	"problem_ids" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_learning_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"path_id" integer NOT NULL,
	"completed_lessons" integer DEFAULT 0,
	"current_lesson_id" integer,
	"time_spent" integer DEFAULT 0,
	"can_access" boolean DEFAULT true,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "learning_path_lessons" ADD CONSTRAINT "learning_path_lessons_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_current_lesson_id_learning_path_lessons_id_fk" FOREIGN KEY ("current_lesson_id") REFERENCES "learning_path_lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert sample learning paths
INSERT INTO "learning_paths" ("title", "description", "difficulty", "total_lessons", "estimated_hours", "topics", "prerequisites", "color") VALUES
('Data Structures Fundamentals', 'Master the essential data structures used in programming', 'easy', 15, 25, '["Arrays", "Linked Lists", "Stacks", "Queues", "Hash Tables"]', '[]', 'bg-blue-500'),
('Algorithm Design Patterns', 'Learn common algorithmic approaches and problem-solving techniques', 'medium', 20, 35, '["Two Pointers", "Sliding Window", "Recursion", "Dynamic Programming"]', '["Data Structures Fundamentals"]', 'bg-green-500'),
('Advanced Graph Algorithms', 'Deep dive into graph theory and advanced graph algorithms', 'hard', 18, 40, '["DFS/BFS", "Shortest Path", "Minimum Spanning Tree", "Network Flow"]', '["Algorithm Design Patterns"]', 'bg-purple-500'),
('System Design Fundamentals', 'Learn how to design scalable systems and architectures', 'hard', 12, 30, '["Scalability", "Load Balancing", "Caching", "Database Design"]', '["Advanced Graph Algorithms"]', 'bg-orange-500');
