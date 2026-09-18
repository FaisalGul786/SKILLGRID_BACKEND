import { 
  pgTable, 
  uuid, 
  decimal, 
  timestamp, 
  pgEnum, 
  unique 
} from 'drizzle-orm/pg-core';
import { users } from '../../authentication/schema/authentication-schema.js';
import { quizzes } from './quiz-management-schema.js';
import { quizQuestions } from './quiz-question-schema.js';
import { quizQuestionOptions } from './quiz-question-option-schema.js';


export const attemptStatusEnum = pgEnum('attempt_status', [
  'submitted', 
  'not_submitted'
]);

export const attemptPassedEnum = pgEnum('attempt_passed_status', [
  'passed', 
  'failed', 
  'pending'
]);


export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  studentId: uuid('student_id')
    .notNull()
    .references(() => users.id),
    
  quizId: uuid('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
    
  status: attemptStatusEnum('status').default('not_submitted').notNull(),
  
  obtainedMarks: decimal('obtained_marks', { precision: 5, scale: 2 }),
  
  isPassed: attemptPassedEnum('is_passed'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => ({
  // student can only take a quiz once
  unqAttempt: unique('unique_student_quiz_attempt').on(table.studentId, table.quizId),
}));