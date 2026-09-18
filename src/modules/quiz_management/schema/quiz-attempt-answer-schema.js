import { 
  pgTable, 
  uuid,  
  timestamp,  
  boolean,
  unique 
} from 'drizzle-orm/pg-core';
import { users } from '../../authentication/schema/authentication-schema.js';
import { quizzes } from './quiz-management-schema.js';
import { quizQuestions } from './quiz-question-schema.js';
import { quizQuestionOptions } from './quiz-question-option-schema.js';
import {quizAttempts} from './quiz-attempt-schema.js'


export const quizAttemptAnswers = pgTable('quiz_attempt_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  quizAttemptId: uuid('quiz_attempt_id')
    .notNull()
    .references(() => quizAttempts.id, { onDelete: 'cascade' }),
    
  quizQuestionId: uuid('quiz_question_id')
    .notNull()
    .references(() => quizQuestions.id),
    
  quizQuestionOptionId: uuid('quiz_question_option_id')
    .notNull()
    .references(() => quizQuestionOptions.id),
    
  isCorrect: boolean('is_correct').default(false).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // CRUCIAL: Prevents multiple answers for the same question in a single attempt
  unqAnswer: unique('unique_attempt_question_answer').on(table.quizAttemptId, table.quizQuestionId),
}));