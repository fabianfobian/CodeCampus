
import { db } from "./db";
import { users } from "./shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  try {
    console.log("Seeding admin user...");
    
    const adminCredentials = {
      username: "codemaster",
      email: "codemaster@codecampus.com",
      password: await hashPassword("CodeMaster2024!"),
      displayName: "Code Master",
      role: "super_admin" as const
    };

    // Check if admin with this username already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.username, adminCredentials.username)
    });

    if (existingAdmin) {
      console.log(`Admin user '${adminCredentials.username}' already exists.`);
      return;
    }

    // Insert the admin user
    const [newAdmin] = await db.insert(users).values(adminCredentials).returning();
    
    console.log(`✅ Admin user created successfully!`);
    console.log(`Username: ${adminCredentials.username}`);
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: CodeMaster2024!`);
    console.log(`Role: ${adminCredentials.role}`);
    console.log(`User ID: ${newAdmin.id}`);
    
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
}

seedAdmin();
