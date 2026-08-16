import { pgTable, integer, timestamp, primaryKey } from "drizzle-orm/pg-core"
import {roles} from "./roles-schema.js"
import {permissions} from "./permissions-schema.js"

export const rolePermissions = pgTable("role_permissions", {
	roleId: integer("role_id")
	.notNull()
	.references(() => roles.id, { onDelete: "cascade" }),
	permissionId: integer("permission_id")
	.notNull()
	.references(() => permissions.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()

}, (table) => ({
  // Composite primary key ensures a role cannot have duplicate permission entries
	pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));