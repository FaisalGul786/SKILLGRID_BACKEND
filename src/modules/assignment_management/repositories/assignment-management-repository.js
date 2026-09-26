import { db } from "../../../shared/database/config/db-connection.js";
import { assignments } from "../schema/assignment-schema.js";
import {assignmentSubmissions} from "../schema/assignment-submissions-schema.js";
import { eq, and } from "drizzle-orm";
import {users} from "../../authentication/schema/authentication-schema.js";
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


export const getSubmissionsForInstructor = async (courseId, instructorId) => {
    return await db
        .select({
            submission: assignmentSubmissions,
            student: {
                id: users.id,
                userName: users.userName,
                email: users.email
            },
            assignment: {
                id: assignments.id,
                assignmentMarks: assignments.assignmentMarks
            }
        })
        .from(assignmentSubmissions)
        .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
        .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
        .where(
            and(
                eq(assignments.courseId, courseId), 
                eq(assignments.instructorId, instructorId)
            )
        );
};


export const getSubmissionWithAssignmentById = async (submissionId) => {
    const [record] = await db
        .select({
            submission: assignmentSubmissions,
            assignment: assignments
        })
        .from(assignmentSubmissions)
        .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
        .where(eq(assignmentSubmissions.id, submissionId));
    
    return record;
};

export const getSubmissionsByCourseId = async (courseId, instructorId) => {
  return await db
    .select({
      submission: assignmentSubmissions,
      student: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      assignment: {
        id: assignments.id,
        assignmentMarks: assignments.assignmentMarks,
      },
    })
    .from(assignmentSubmissions)
    .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
    .where(
      and(
        eq(assignments.courseId, courseId),
        eq(assignments.instructorId, instructorId)
      )
    );
};

export const updateSubmissionGrade = async (submissionId, payload) => {
    const [updated] = await db
        .update(assignmentSubmissions)
        .set(payload)
        .where(eq(assignmentSubmissions.id, submissionId))
        .returning();
        
    return updated;
};