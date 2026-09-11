import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import envConfig from "../../config_env/env-variables-config.js"
const pool = new Pool({ connectionString: envConfig.DATABASE_URL });

export const db = drizzle(pool);