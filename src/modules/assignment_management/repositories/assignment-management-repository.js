import { db } from "../../../shared/database/config/db-connection.js";
import { assignments } from "../schema/assignment-schema.js";
import {logger} from "../../../shared/utils/logger.js";

export const addAssignment = async (assignmentPayload) => {
	const [newAssignment] = await db
	.insert(assignments)
	.values(assignmentPayload)
	.returning();

	logger(`\n assignment added `, newAssignment)

	return newAssignment;
};