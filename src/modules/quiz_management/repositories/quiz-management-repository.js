import { db } from "../../../shared/database/config/db-connection.js"
import {AppError} from "../../../shared/errors/app-error.js"
import { courses } from "../../course_management/schema/course-management-schema.js"
import { enrollments } from "../../enrollment/schema/enrollment-schema.js"
import { quizzes } from "../schema/quiz-management-schema.js"
import {quizAttempts} from "../schema/quiz-attempt-schema.js"
import { and, eq, asc, inArray,gt, lt, sql, isNull, isNotNull, or } from "drizzle-orm"
import {logger} from "../../../shared/utils/logger.js"
import {quizQuestions} from "../schema/quiz-question-schema.js"
import {quizQuestionOptions} from "../schema/quiz-question-option-schema.js"
import {quizAttemptAnswers} from "../schema/quiz-attempt-answer-schema.js"

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
* list quizzes for a course at student dashboard ( From quiz list to quiz attempt)
*/

export const StudentQuizRepository = {
  // Check if student is actively enrolled in this specific course
  async isStudentEnrolled(studentId, courseId) {
    const [enrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.courseId, courseId)
        )
      )
    .limit(1);

    return Boolean(enrollment);
  },

  // Counts for THIS course only
  async getQuizCounts(studentId, courseId) {
    const now = new Date();

    const [result] = await db
    .select({
      pending: sql`COUNT(CASE WHEN ${quizzes.dueDate} >= ${now} AND (${quizAttempts.id} IS NULL OR ${quizAttempts.status} = 'not_submitted') THEN 1 END)`,
      overdue: sql`COUNT(CASE WHEN ${quizzes.dueDate} < ${now} AND (${quizAttempts.id} IS NULL OR ${quizAttempts.status} = 'not_submitted') THEN 1 END)`,
      completed: sql`COUNT(CASE WHEN ${quizAttempts.status} = 'submitted' THEN 1 END)`,
    })
    .from(quizzes)
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.courseId, quizzes.courseId),
        eq(enrollments.studentId, studentId)
        )
      )
    .leftJoin(
      quizAttempts,
      and(
        eq(quizzes.id, quizAttempts.quizId),
        eq(quizAttempts.studentId, studentId)
        )
      )
    .where(
      and(
        eq(quizzes.courseId, courseId),
        eq(quizzes.isPublished, 'Published')
        )
      );

    logger(`\n\n\n result `, result)

    return {
      pending: Number(result?.pending || 0),
      overdue: Number(result?.overdue || 0),
      completed: Number(result?.completed || 0),
    };
  },

  // Quizzes for THIS course only
  async getQuizzesByStatus(studentId, status, courseId) {
    const now = new Date();

    let statusCondition;
    if (status === 'pending') {
      statusCondition = and(
        gt(quizzes.dueDate, now), 
        or(isNull(quizAttempts.id), eq(quizAttempts.status, 'not_submitted'))
      );
    } else if (status === 'overdue') {
      statusCondition = and(
        lt(quizzes.dueDate, now), 
        or(isNull(quizAttempts.id), eq(quizAttempts.status, 'not_submitted'))
      );
    } else if (status === 'completed') {
      statusCondition = and(
        eq(quizAttempts.status, 'submitted'),
        isNotNull(quizAttempts.id)
      );
    }

    return await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      duration: quizzes.durationMinutes,
      totalMarks: quizzes.totalMarks,
      passingScore: quizzes.passingScore,
      dueDate: quizzes.dueDate,
      course: courses.title,
      score: quizAttempts.obtainedMarks,
      submittedAt: quizAttempts.updatedAt,
    })
    .from(quizzes)
    .innerJoin(courses, eq(quizzes.courseId, courses.id))
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.courseId, quizzes.courseId),
        eq(enrollments.studentId, studentId)
        )
      )
    .leftJoin(
      quizAttempts,
      and(
        eq(quizzes.id, quizAttempts.quizId),
        eq(quizAttempts.studentId, studentId)
        )
      )
    .where(
      and(
        eq(quizzes.courseId, courseId),
        eq(quizzes.isPublished, 'Published'),
        statusCondition
        )
      );
  },

  // Check existing submission
  async getExistingAttempt(studentId, quizId) {
    const [attempt] = await db
    .select({ id: quizAttempts.id, status: quizAttempts.status })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.studentId, studentId),
        eq(quizAttempts.quizId, quizId)
        )
      )
    .limit(1);

    return attempt || null;
  },

  // Fetch single quiz header + questions + options securely
  async getQuizDetailsForAttempt(courseId, quizId) {
  // 1. Fetch Quiz Header (Filtered by Published status in SQL)
    const [quiz] = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      duration: quizzes.durationMinutes,
      totalMarks: quizzes.totalMarks,
      passingScore: quizzes.passingScore,
      dueDate: quizzes.dueDate,
    })
    .from(quizzes)
    .where(
      and(
        eq(quizzes.id, quizId),
        eq(quizzes.courseId, courseId),
        eq(quizzes.isPublished, 'Published') // <--- Filter directly in DB
        )
      )
    .limit(1);

    if (!quiz) return null;

  // 2. Fetch Questions
    const questions = await db
    .select({
      id: quizQuestions.id,
      text: quizQuestions.questionText,
      point: quizQuestions.questionPoint,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId));

    if (questions.length === 0) {
      return { ...quiz, questions: [] };
    }

    const questionIds = questions.map((q) => q.id);

  // 3. Fetch Options (Excluding isCorrect)
    const options = await db
    .select({
      id: quizQuestionOptions.id,
      questionId: quizQuestionOptions.quizQuestionId,
      text: quizQuestionOptions.optionText,
    })
    .from(quizQuestionOptions)
    .where(sql`${quizQuestionOptions.quizQuestionId} IN ${questionIds}`);

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      point: q.point,
      options: options
      .filter((opt) => opt.questionId === q.id)
      .map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    }));

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      totalMarks: Number(quiz.totalMarks),
      passingScore: Number(quiz.passingScore),
      dueDate: quiz.dueDate,
      questions: formattedQuestions,
    };
  },

  // Fetch data needed for auto-marking
  async getQuizMarkingData(quizId) {
    const [quiz] = await db
    .select({
      id: quizzes.id,
      totalMarks: quizzes.totalMarks,
      passingScore: quizzes.passingScore,
    })
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

    if (!quiz) return null;

    const questions = await db
    .select({
      id: quizQuestions.id,
      point: quizQuestions.questionPoint,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId));

    const questionIds = questions.map((q) => q.id);

    const correctOptions = questionIds.length
    ? await db
    .select({
      id: quizQuestionOptions.id,
      questionId: quizQuestionOptions.quizQuestionId,
    })
    .from(quizQuestionOptions)
    .where(
      and(
        inArray(quizQuestionOptions.quizQuestionId, questionIds),
        eq(quizQuestionOptions.isCorrect, true)
        )
      )
    : [];

    return { quiz, questions, correctOptions };
  },

  // Save attempt and answers inside a transaction
  async submitQuizAttempt(attemptData, evaluatedAnswers) {
    // db.transaction automatically rolls back if any error is thrown inside
    return await db.transaction(async (tx) => {
      // 1. Insert Attempt
      const [attempt] = await tx
      .update(quizAttempts)
      .set({
        status: attemptData.status,
        obtainedMarks: attemptData.obtainedMarks,
        isPassed: attemptData.isPassed,
      })
      .where(
        and(
          eq(quizAttempts.studentId, attemptData.studentId),
          eq(quizAttempts.quizId, attemptData.quizId)
          )
        )
      .returning();

      // 2. Map answers with the newly generated attempt ID
      const answersToInsert = evaluatedAnswers.map((ans) => ({
        ...ans,
        quizAttemptId: attempt.id,
      }));

      // 3. Insert Answers
      if (answersToInsert.length > 0) {
        await tx.insert(quizAttemptAnswers).values(answersToInsert);
      }

      return attempt;
    });
  },

  // 🪶 Initialize or fetch attempt record Upon fetch of quiz questions to get real time timer
  async startOrGetAttempt(studentId, quizId) {
    let [attempt] = await db
    .select({
      id: quizAttempts.id,
      status: quizAttempts.status,
      createdAt: quizAttempts.createdAt,
    })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.studentId, studentId),
        eq(quizAttempts.quizId, quizId)
        )
      )
    .limit(1);

    logger(`\n\n\n quiz attempt for continue quiz ---- `, attempt)

    if (!attempt) {
      [attempt] = await db
      .insert(quizAttempts)
      .values({
        studentId,
        quizId,
        status: 'not_submitted',
      })
      .returning({
        id: quizAttempts.id,
        status: quizAttempts.status,
        createdAt: quizAttempts.createdAt,
      });
    }

    logger(`\n first time draft data is created in quiz attempts `, attempt)

    return attempt;
  },
};

