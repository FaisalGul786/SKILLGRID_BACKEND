import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, check, unique, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../authentication/schema/authentication-schema.js';
import { assignments } from './assignment-schema.js';

export const submissionStatusEnum = pgEnum('submission_status', ['not_graded', 'graded']);

export const assignmentSubmissions = pgTable(
  'assignment_submissions',
  {
     id: uuid('assignment_submission_id').defaultRandom().primaryKey(),
    assignmentId: uuid('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    
    assignmentUrl: text('assignment_url').notNull(),
    cloudinaryPublicId: text('cloudinary_public_id').notNull(),
    cloudinaryResourceType: varchar('cloudinary_resource_type', { length: 50 }),

    obtainedMarks: integer('obtained_marks'),
    feedback: text('feedback'), 
    status: submissionStatusEnum('status').default('not_graded').notNull(),
    isPassed: boolean('is_passed'),
    
    submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    gradedAt: timestamp('graded_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [

    //  Unique Constraint: Ensures a student can only submit one time per assignment
    unique('uq_student_assignment_submission').on(table.studentId, table.assignmentId),

    //  Check Constraint: Ensures obtained marks are not negative
    check('chk_obtained_marks_positive', sql`${table.obtainedMarks} >= 0`),
  ]
);