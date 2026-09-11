import { 
  pgTable, 
  uuid, 
  text, 
  integer,  
  timestamp 
} from 'drizzle-orm/pg-core';
import { quizzes } from './quiz-management-schema.js';

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  quizId: uuid('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
    
  questionText: text('question_text').notNull(),
  
  questionPoint: integer('question_point').default(1).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});