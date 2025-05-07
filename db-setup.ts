import { db } from "./db";
import * as schema from "./shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { Pool } from 'pg';
import fs from 'fs';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function setup() {
  try {
    console.log("Setting up database...");
    
    // Create a direct connection to run the SQL migration
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Read and execute the migration file
    const migrationSql = fs.readFileSync('./drizzle/0000_initial.sql', 'utf8');
    
    console.log("Running migrations...");
    await pool.query(migrationSql);
    
    // Seed admin user
    console.log("Seeding admin user...");
    const adminData = {
      username: "admin",
      email: "admin@example.com",
      password: await hashPassword("admin123"),
      displayName: "Admin User",
      role: "super_admin"
    };
    
    // Check if admin already exists
    const existingAdminResult = await pool.query('SELECT * FROM users WHERE username = $1', ["admin"]);
    
    if (existingAdminResult.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (username, email, password, display_name, role) VALUES ($1, $2, $3, $4, $5)',
        [adminData.username, adminData.email, adminData.password, adminData.displayName, adminData.role]
      );
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists, skipping creation.");
    }

    // Create a test user too
    const testUserData = {
      username: "test",
      email: "test@example.com",
      password: await hashPassword("test123"),
      displayName: "Test User",
      role: "learner"
    };

    const existingTestResult = await pool.query('SELECT * FROM users WHERE username = $1', ["test"]);
    
    if (existingTestResult.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (username, email, password, display_name, role) VALUES ($1, $2, $3, $4, $5)',
        [testUserData.username, testUserData.email, testUserData.password, testUserData.displayName, testUserData.role]
      );
      console.log("Test user created successfully!");
    } else {
      console.log("Test user already exists, skipping creation.");
    }
    
    await pool.end();
    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

setup();