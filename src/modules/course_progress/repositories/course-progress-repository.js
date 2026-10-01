import { eq, and, sql, count } from 'drizzle-orm';
import { db } from '../../../shared/database/config/db-connection.js';
import { lessonProgress } from '../schema/lesson-progress-schema.js';
import { certificates } from '../../certificate/schema/certificate-schema.js';
import { enrollments } from '../../enrollment/schema/enrollment-schema.js';
import { lessons } from '../../lesson_management/schema/lesson-management-schema.js';
import { assignments } from '../../assignment_management/schema/assignment-schema.js';
import { assignmentSubmissions } from '../../assignment_management/schema/assignment-submissions-schema.js';
import { quizzes } from '../../quiz_management/schema/quiz-management-schema.js';
import { quizAttempts } from '../../quiz_management/schema/quiz-attempt-schema.js';

export const getLessonById = async (lessonId) => {
  const [lesson] = await db
    .select({ id: lessons.id, courseId: lessons.courseId })
    .from(lessons)
    .where(eq(lessons.id, lessonId));
  return lesson;
};

export const upsertLessonProgress = async (studentId, lessonId) => {
  return await db
    .insert(lessonProgress)
    .values({
      studentId,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.studentId, lessonProgress.lessonId],
      set: {
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();
};

export const getCourseTotalsAndCompleted = async (studentId, courseId) => {
  const [lessonsData] = await db
    .select({
      total: count(lessons.id),
      completed: sql`COUNT(CASE WHEN ${lessonProgress.isCompleted} = true THEN 1 END)::int`,
    })
    .from(lessons)
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, lessons.id),
        eq(lessonProgress.studentId, studentId)
      )
    )
    .where(and(eq(lessons.courseId, courseId), eq(lessons.isPublished, true)));

  const [quizzesData] = await db
    .select({
      total: count(quizzes.id),
      passed: sql`COUNT(CASE WHEN ${quizAttempts.status} = 'submitted' AND ${quizAttempts.isPassed} = 'passed' THEN 1 END)::int`,
    })
    .from(quizzes)
    .leftJoin(
      quizAttempts,
      and(
        eq(quizAttempts.quizId, quizzes.id),
        eq(quizAttempts.studentId, studentId)
      )
    )
    .where(eq(quizzes.courseId, courseId));

  const [assignmentsData] = await db
    .select({
      total: count(assignments.id),
      passed: sql`COUNT(CASE WHEN ${assignmentSubmissions.status} = 'graded' AND ${assignmentSubmissions.isPassed} = true THEN 1 END)::int`,
    })
    .from(assignments)
    .leftJoin(
      assignmentSubmissions,
      and(
        eq(assignmentSubmissions.assignmentId, assignments.id),
        eq(assignmentSubmissions.studentId, studentId)
      )
    )
    .where(
      and(
        eq(assignments.courseId, courseId),
        eq(assignments.status, 'Published')
      )
    );

  return {
    lessons: { total: Number(lessonsData?.total || 0), completed: Number(lessonsData?.completed || 0) },
    quizzes: { total: Number(quizzesData?.total || 0), passed: Number(quizzesData?.passed || 0) },
    assignments: { total: Number(assignmentsData?.total || 0), passed: Number(assignmentsData?.passed || 0) },
  };
};

export const updateEnrollmentProgress = async (studentId, courseId, progressPercentage, isCompleted) => {
  const updateData = {
    progressPercentage: progressPercentage.toFixed(2),
    isCompleted,
    updatedAt: new Date(),
  };

  if (isCompleted) {
    updateData.completedAt = new Date();
  }

  return await db
    .update(enrollments)
    .set(updateData)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.courseId, courseId)
      )
    )
    .returning();
};