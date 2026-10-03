import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });

const databaseUrl = process.env.DATABASE_URL_DIRECT;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_DIRECT is missing in .env.development");
}

console.log("Database direct URL for migrations loaded successfully.");

export default defineConfig({
  schema: [
    "./src/modules/**/*-schema.js",
    "./src/shared/access_control/schema/*.js",
  ],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: true,
  },
});