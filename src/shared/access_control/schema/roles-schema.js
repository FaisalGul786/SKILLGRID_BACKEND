/*
* roles table
*/

import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
	id: serial("id").primaryKey(),
	roleName: varchar("role_name", { length: 50 }).notNull().unique(),
	description:  text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
})