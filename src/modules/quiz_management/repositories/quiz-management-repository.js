import { db } from "../../../shared/database/config/db-connection.js"
import {AppError} from "../../../shared/errors/app-error.js"
import { courses } from "../../course_management/schema/course-management-schema.js"
import { enrollments } from "../../enrollment/schema/enrollment-schema.js"
import { quizzes } from "../schema/quiz-management-schema.js"
import { and, eq, asc, inArray } from "drizzle-orm"
import {logger} from "../../../shared/utils/logger.js"
import {quizQuestions} from "../schema/quiz-question-schema.js"
import {quizQuestionOptions} from "../schema/quiz-question-option-schema.js"

/*
* check course ownership
*/

export const findOwnedCourse = async(courseId, instructorId) => {
  const record = await db
  .select()
  .from(courses)
  .where(
    and(
      eq(courses.id, courseId),
      eq(courses.instructorId, instructorId)
      )
    )
  .limit(1);

  logger("\n \n \n ******** checking course ownership ", record)

  return record[0] || null
}

/*
* create quiz as Draft
*/

export const addQuiz = async(quiz, instructorId, courseId) => {
  const ownedCourse = await db.select({id: courses.id})
  .from(courses)
  .where(and(
    eq(courses.id, courseId),
    eq(courses.instructorId, instructorId)
    )).limit(1)

  logger(`**** ownedCourse in addQuiz `, ownedCourse)

  if(ownedCourse.length < 1) {
    return null
  }

  const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title: quiz.title,
        description: quiz.description,
        durationMinutes: quiz.duration,
        dueDate: new Date(quiz.dueDate),
        totalMarks: quiz.totalMarks,
        passingScore: quiz.passingScore,
        courseId,
        instructorId
      })
      .returning();


      return newQuiz
}

/*
* find quiz by id
*/

export const findQuizById = async(quizId) => {
  const record = await db
  .select()
  .from(quizzes)
  .where(eq(quizzes.id, quizId))
  .limit(1);

  return record[0] || null
}

/*
* add questions / options and publish quiz
*/

export const addFullQuizData = async (questions, quizId, instructorId, courseId) => {
  return await db.transaction(async (tx) => {
    // 1. Fetch quiz total marks
    const [quiz] = await tx
      .select({ totalMarks: quizzes.totalMarks })
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    logger(`\n\n\n quiz `, quiz)

    if (!quiz) {
      // THROWING aborts transaction and triggers ROLLBACK
      throw new AppError("Quiz does not exist.", 404);
    }

    // 2. Validate question points
    const totalIncomingPoints = questions.reduce((sum, q) => sum + q.points, 0);

    if (totalIncomingPoints > Number(quiz.totalMarks)) {
      // THROWING aborts transaction and triggers ROLLBACK
      throw new AppError(
        `Validation Error: Total question points (${totalIncomingPoints}) exceed quiz total marks (${quiz.totalMarks}).`,
        400
      );
    }

    // 3. Insert questions and map options
    const allOptionsToInsert = [];

    for (const q of questions) {
      const [insertedQuestion] = await tx
        .insert(quizQuestions)
        .values({
          quizId: quizId,
          questionText: q.text,
          questionPoint: q.points,
        })
        .returning({ id: quizQuestions.id });

      const mappedOptions = q.options.map((opt) => ({
        quizQuestionId: insertedQuestion.id,
        optionText: opt.text,
        isCorrect: opt.correct,
      }));

      allOptionsToInsert.push(...mappedOptions);
    }

    // 4. Bulk insert options
    if (allOptionsToInsert.length > 0) {
      await tx.insert(quizQuestionOptions).values(allOptionsToInsert);
    }

    // 5. Update status & return updated quiz
    const [updatedQuiz] = await tx
      .update(quizzes)
      .set({ isPublished: 'Published' })
      .where(eq(quizzes.id, quizId))
      .returning();

      logger(`\n\n\n updatedQuiz `, updatedQuiz)

    return updatedQuiz;
  });
};

/*
* list quizzes for a course
*/

export const listCourseQuizzes = async(courseId, publishedOnly = false) => {
  const filters = [eq(quizzes.courseId, courseId)]

  if(publishedOnly) {
    filters.push(eq(quizzes.isPublished, true))
  }

  const quizzesData = await db
  .select()
  .from(quizzes)
  .where(and(...filters))
  .orderBy(asc(quizzes.createdAt));

  logger("\n\n ******** course quizzes ", quizzesData)

  return quizzesData
}

/*
* check enrollment
*/

export const findEnrollment = async(courseId, userId) => {
  const record = await db
  .select({ studentId: enrollments.studentId })
  .from(enrollments)
  .where(
    and(
      eq(enrollments.courseId, courseId),
      eq(enrollments.studentId, userId)
      )
    )
  .limit(1);

  logger(`\n\n\n ****** enrollment `, record)

  return record.length > 0
}

/*
* quiz questions with options
*/

export const findQuizQuestionsWithOptions = async(quizId) => {
  const questions = await db
  .select()
  .from(quizQuestions)
  .where(eq(quizQuestions.quizId, quizId))
  .orderBy(asc(quizQuestions.orderNo));

  if(questions.length < 1) {
    return []
  }

  const questionIds = questions.map((question) => question.id)

  const options = await db
  .select()
  .from(quizOptions)
  .where(inArray(quizOptions.questionId, questionIds));

  return questions.map((question) => ({
    ...question,
    options: options.filter((option) => option.questionId === question.id)
  }))
}

/*
* create quiz attempt
*/

export const createQuizAttempt = async(quizId, studentId, score, totalQuestions) => {
  const [attempt] = await db
  .insert(quizAttempts)
  .values({
    quizId,
    studentId,
    score,
    totalQuestions
  })
  .returning();

  logger(`\n\n\n quiz attempt ******* `, attempt)

  return attempt
}