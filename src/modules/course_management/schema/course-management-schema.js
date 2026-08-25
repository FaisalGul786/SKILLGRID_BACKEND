import { pgTable, text, varchar, decimal, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { users } from '../../authentication/schema/authentication-schema.js';

export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);
export const courseTypeEnum = pgEnum('course_type', ['free', 'paid']);

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  thumbnail: varchar('thumbnail', { length: 512 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  courseType: courseTypeEnum('course_type').notNull().default('free'),
  difficulty: difficultyEnum('difficulty').default('beginner'),
  category: varchar('category', { length: 100 }),
  instructorId: uuid('instructor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: courseStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});