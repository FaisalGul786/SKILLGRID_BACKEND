import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

import path from "path"

// dotenv.config({path: ".env.development"})
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });

console.log("database direct for migrations: ", process.env.DATABASE_URL_DIRECT);

export default defineConfig({
  schema: ["./src/modules/**/*-schema.js", "./src/shared/access_control/schema/*.js"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT,
  },
});
