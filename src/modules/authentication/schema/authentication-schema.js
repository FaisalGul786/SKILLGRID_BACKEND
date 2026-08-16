import { pgTable, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import {roles} from "../../../shared/access_control/schema/roles-schema.js"

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	userName: text("user_name").notNull(),
	email: text("email").notNull().unique(),
	password:  text("hash_password").notNull(),
	roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "restrict" }),
	isVerified: boolean("is_verified").default(false).notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
})