import { db } from "../../../shared/database/config/db-connection.js";
import { assignments } from "../schema/assignment-schema.js";
import {assignmentSubmissions} from "../schema/assignment-submissions-schema.js";
import { eq, and } from "drizzle-orm";
import {logger} from "../../../shared/utils/logger.js";

export const addAssignment = async (assignmentPayload) => {
	const [newAssignment] = await db
	.insert(assignments)
	.values(assignmentPayload)
	.returning();

	logger(`\n assignment added `, newAssignment)

	return newAssignment;
};


export const getAssignmentsWithStudentSubmission = async (courseId, studentId) => {

    logger(`\n\n repo >>`, '')
    return await db
        .select({
            assignment: assignments,
            submission: assignmentSubmissions
        })
        .from(assignments)
        .leftJoin(
            assignmentSubmissions,
            and(
                eq(assignments.id, assignmentSubmissions.assignmentId),
                eq(assignmentSubmissions.studentId, studentId)
            )
        )
        .where(
            and(
                eq(assignments.courseId, courseId),
                eq(assignments.status, 'Published')
            )
        );
};

export const getAssignmentById = async (assignmentId) => {
    const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, assignmentId));
    return assignment;
};

export const upsertStudentSubmission = async (payload) => {
    const [submission] = await db
        .insert(assignmentSubmissions)
        .values(payload)
        .onConflictDoUpdate({
            target: [assignmentSubmissions.studentId, assignmentSubmissions.assignmentId],
            set: {
                assignmentUrl: payload.assignmentUrl,
                cloudinaryPublicId: payload.cloudinaryPublicId,
                cloudinaryResourceType: payload.cloudinaryResourceType, // Captures resource type on resubmit
                submittedAt: new Date(),
                status: 'not_graded',
                obtainedMarks: null,
                feedback: null,
                isPassed: null,
                gradedAt: null
            }
        })
        .returning();
    return submission;
};