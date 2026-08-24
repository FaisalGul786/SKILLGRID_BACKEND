
import { pgTable, uuid, text, integer, boolean, timestamp, varchar , unique } from 'drizzle-orm/pg-core';


import { courses } from '../../course_management/schema/course-management-schema.js'; 

export const lessons = pgTable('lessons', {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').references(() => courses.id).notNull(),
    notes: text('notes'),
    duration: integer('duration'), // Stored in minutes or seconds
    title: varchar('title', { length: 255 }).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    attachementUrl: text('attachement_url'),
    mainUrl: text('main_url'),
    lessonNo: integer('lesson_no'),
    lessonType: varchar('lesson_type', { length: 50 }) 
}, (table) => {
    return {
    // Ensures no two lessons in the same course share the same lesson number
        courseOrderUnique: unique().on(table.courseId, table.lessonNo)
    };
});