import { pgTable, uuid, text, pgEnum, timestamp, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["user", "admin", "instructor"]);

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	userName: text("user_name").notNull(),
	email: text("email").notNull().unique(),
	password:  text("hash_password").notNull(),
	role: roleEnum("role").default("user").notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull()
})