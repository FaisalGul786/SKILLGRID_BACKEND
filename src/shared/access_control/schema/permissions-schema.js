import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
	id: serial("id").primaryKey(),
	actionPermission: varchar("action_permission", {length: 100}).notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
})