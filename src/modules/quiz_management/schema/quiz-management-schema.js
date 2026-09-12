import { 
    pgTable, 
    uuid, 
    varchar, 
    text, 
    integer, 
    decimal, 
    timestamp, 
    pgEnum 
  } from 'drizzle-orm/pg-core';
  import { users } from '../../authentication/schema/authentication-schema.js';
  import { courses } from '../../course_management/schema/course-management-schema.js';
  
  // Create custom ENUM type
  export const quizStatusEnum = pgEnum('quiz_status', [
    'Draft', 
    'Published', 
    'Discarded'
  ]);
  
  // Quizzes table schema
  export const quizzes = pgTable('quizzes', {
    id: uuid('id').defaultRandom().primaryKey(),
    instructorId: uuid('instructor_id')
      .notNull()
      .references(() => users.id),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id),
      
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    durationMinutes: integer('duration_minutes').notNull(),
    totalMarks: decimal('total_marks', { precision: 5, scale: 2 }),
    passingScore: decimal('passing_score', { precision: 5, scale: 2 }),
    
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),

    isPublished: quizStatusEnum('is_published').notNull().default('Draft'),
    
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  });