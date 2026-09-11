import { 
  pgTable, 
  uuid, 
  text, 
  boolean,
  timestamp 
} from 'drizzle-orm/pg-core';
import { quizQuestions } from './quiz-question-schema.js';

export const quizQuestionOptions = pgTable('quiz_question_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  quizQuestionId: uuid('quiz_question_id')
    .notNull()
    .references(() => quizQuestions.id, { onDelete: 'cascade' }),
    
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});