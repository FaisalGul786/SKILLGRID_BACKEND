import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../authentication/schema/authentication-schema.js';
import { courses } from '../../course_management/schema/course-management-schema.js';

export const assignmentStatusEnum = pgEnum('assignment_status', ['Draft', 'Published']);

export const assignments = pgTable(
  'assignments',
  {
    id: uuid('assignment_id').defaultRandom().primaryKey(),
    instructorId: uuid('instructor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    attachmentUrl: text('attachment_url'),
    cloudinaryPublicId: text('cloudinary_public_id'),
    cloudinaryResourceType: varchar('cloudinary_resource_type', { length: 50 }),
    dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
    status: assignmentStatusEnum('status').default('Draft').notNull(),
    assignmentMarks: integer('assignment_marks').notNull().default(100),
    passingMarks: integer('passing_marks').notNull().default(40),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [

    // Check Constraints (Data integrity validation)
    check('chk_passing_marks_valid', sql`${table.passingMarks} <= ${table.assignmentMarks}`),
    check('chk_marks_positive', sql`${table.assignmentMarks} >= 0 AND ${table.passingMarks} >= 0`),
  ]
);