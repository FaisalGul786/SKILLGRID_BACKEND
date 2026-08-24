import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

import path from "path"

import envConfig  from "./src/shared/config_env/env-variables-config.js"

// dotenv.config({path: ".env.development"})
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });

console.log("database direct for migrations: ", envConfig.DATABASE_URL_DIRECT);

export default defineConfig({
  schema: ["./src/modules/**/*-schema.js", "./src/shared/access_control/schema/*.js"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: envConfig.DATABASE_URL_DIRECT,
  },
});
