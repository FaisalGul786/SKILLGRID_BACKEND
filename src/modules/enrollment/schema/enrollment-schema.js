import { pgTable, uuid, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core'
import { users } from '../../authentication/schema/authentication-schema.js'
import { courses } from '../../course_management/schema/course-management-schema.js'

export const courseTypeEnum = pgEnum('course_type', ['free', 'paid'])
export const isPaidEnum = pgEnum('is_paid_status', ['unpaid', 'paid'])

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
    courseType: courseTypeEnum('course_type').notNull(),
    isPaid: isPaidEnum('is_paid').default('unpaid').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  },
  (table) => ({
    // Prevents duplicate enrollment records for the same student and course
    uniqueEnrollment: unique().on(table.studentId, table.courseId),
  })
  )