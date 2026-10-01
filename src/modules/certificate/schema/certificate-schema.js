import { pgTable, uuid, varchar, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from '../../authentication/schema/authentication-schema.js';
import { courses } from '../../course_management/schema/course-management-schema.js';

export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    certificateCode: varchar('certificate_code', { length: 100 }).notNull().unique(),
    certificateUrl: text('certificate_url'),
    issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    unqStudentCourseCertificate: unique('uq_student_course_certificate').on(table.studentId, table.courseId),
  })
);