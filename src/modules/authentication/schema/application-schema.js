import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./authentication-schema.js";

export const applicationStatusEnum = pgEnum("application_status", ["pending", "approve", "rejected"]);

export const instructorApplications = pgTable("instructor_applications", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	status: applicationStatusEnum("status").default("pending").notNull(),
	applicationNotes: text("application_notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});