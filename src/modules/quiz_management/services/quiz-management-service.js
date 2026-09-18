
import * as quizManagementRepository from "../repositories/quiz-management-repository.js"
import {logger} from "../../../shared/utils/logger.js"

import {AppError} from "../../../shared/errors/app-error.js"

import {QuizDraftService} from "../../../external_services/upstash_redis_service/upstash-redis-draft.js"


/*
* add quiz
*/

export const addQuizToCourseService = async(quiz, instructorId, courseId) => {

	if(!quiz?.title) {
		throw new AppError("Quiz title is required.", 400)
	}

	// ✅ check course ownerShip & create quiz as Draft
	const newQuiz = await quizManagementRepository.addQuiz(quiz, instructorId, courseId)

	logger("\n \n ****** ownership ", newQuiz)


	if(!newQuiz) {
		throw new AppError("Unauthorized: You do not own this course or it does not exist.", 403)
	}

	logger("\n \n ****** new quiz ", newQuiz)

	return newQuiz

}


/*
* add questions in quiz
*/

export const addQuizData = async(data, quizId, instructorId, courseId) =>{

	//  ✅ checking ownership & add  data left

	const isOwner = await quizManagementRepository.findOwnedCourse(courseId, instructorId)

	if(!isOwner) {
		throw new AppError("Unauthorized: You do not own this course or it does not exist", 403)
	}

	const fullQuiz = await quizManagementRepository.addFullQuizData(data, quizId, instructorId, courseId)


	return fullQuiz
}


/*
* list quizzes for a course
*/

export const listCourseQuizzesService = async(studentId, quizStatus, courseId) => {

	if (courseId) {
		const isEnrolled = await quizManagementRepository.StudentQuizRepository.isStudentEnrolled(studentId, courseId);

		logger(`\n\n isEnrolled`, isEnrolled)

		if (!isEnrolled) {
			throw new AppError('Access denied. You are not enrolled in this course.', 403)
		}
	}

	logger(`test line ***`)

	const [counts, quizzes] = await Promise.all([
		quizManagementRepository.StudentQuizRepository.getQuizCounts(studentId, courseId),
		quizManagementRepository.StudentQuizRepository.getQuizzesByStatus(studentId, quizStatus, courseId),
	]);


	return { counts, quizzes };
}


/*
* fetch 1 quiz with questions, calculate exact quiz timer, retrieve redis batch draft
*/

export const getQuizAttempt = async(studentId, courseId, quizId) => {
	
	// ✅ Verify Enrollment
	const isEnrolled = await quizManagementRepository.StudentQuizRepository.isStudentEnrolled(studentId, courseId);

	logger(`isEnrolled ---- `, isEnrolled)

	if (!isEnrolled) {
		throw new AppError('You are not enrolled in this course.', 403)
	}

	// ✅ Verify Duplicate Attempts
	const existingAttempt = await quizManagementRepository.StudentQuizRepository.getExistingAttempt(studentId, quizId);

	logger(`existingAttempt ---- `, existingAttempt)

	if (existingAttempt && existingAttempt.status === 'submitted') {
		throw new AppError('You have already submitted this quiz.', 400)
	}

	// ✅ Fetch Quiz Question - options for Attempt 
	const quiz = await quizManagementRepository.StudentQuizRepository.getQuizDetailsForAttempt(courseId, quizId);


	logger(`quiz data for attempt ----- `, quiz)

	if (!quiz) {
		throw new AppError('Quiz not found or unavailable.', 404)
	}

	// ✅ Check its dueDate < now

	if (new Date() > new Date(quiz.dueDate)) {
		throw new AppError('The deadline for this quiz has passed.', 400);
	}

	// ✅ Start or Fetch Attempt in PostgreSQL for timer or rejoin quiz attempt
	const attempt = await quizManagementRepository.StudentQuizRepository.startOrGetAttempt(studentId, quizId);
	logger(`\n\n\n Did person re-join quiz attempt ? \n reason 👉 `, attempt)

	if (attempt.status === 'submitted') {
		throw new AppError('You have already submitted this quiz.', 400);
	}

	// ✅ Server-Side Quiz Timer Calculation
	const now = new Date();
	const startTime = new Date(attempt.createdAt);
	const elapsedSeconds = Math.floor((now - startTime) / 1000);
	const totalDurationSeconds = quiz.duration * 60;
	const remainingSeconds = totalDurationSeconds - elapsedSeconds;

	logger(`\n now >>>> ${now} \n\n start-time >>>> ${startTime} \n\n elapsedTimeInSeconds >>>> ${elapsedSeconds} \n\n totalDurationSeconds >>>> ${totalDurationSeconds} \n\n remainingSeconds >>>> `, remainingSeconds)

	// ✅ Auto-expire if student returns after time limit
	if (remainingSeconds <= 0) {
		await quizManagementRepository.StudentQuizRepository.submitQuizAttempt(
		{
			studentId,
			quizId,
			status: 'submitted',
			obtainedMarks: '0',
			isPassed: 'failed',
		},
		[]
		);

		await QuizDraftService.clearDraft(studentId, quizId);
		throw new AppError('Quiz duration has expired. Attempt auto-submitted.', 400);

	}

	// ✅ Fetch temprary answers from Redis to send back as response
	const savedAnswers = await QuizDraftService.getDraft(studentId, quizId);

	return {
		...quiz,
		remainingSeconds,
		savedAnswers,
	};

}


/*
* quiz submit / mark & clear Redis
*/
export const evaluateAndSubmit = async(studentId, courseId, quizId, submittedAnswers) => {

	// ✅ Check if an attempt already exists (prevent double submission)
	const existingAttempt = await quizManagementRepository.StudentQuizRepository.getExistingAttempt(studentId, quizId);

	logger(`\n existingAttempt ---- `, existingAttempt)

	if (existingAttempt && existingAttempt.status === 'submitted') {

		throw new AppError('Quiz has already been submitted.', 400)

	}

	// ✅ Fetch Truth Data
	const markingData = await quizManagementRepository.StudentQuizRepository.getQuizMarkingData(quizId);

	logger('\n\n markingData --- ', markingData)

	if (!markingData) {
		throw new AppError('Quiz not found.', 404)
	}

	const { quiz, questions, correctOptions } = markingData;

	// Create lookup maps for fast access
	const correctMap = new Map(correctOptions.map((opt) => [opt.questionId, opt.id]));
	const pointMap = new Map(questions.map((q) => [q.id, q.point]));

	let obtainedMarks = 0;
	const evaluatedAnswers = [];

	//  Evaluate each answer
	for (const answer of submittedAnswers) {
		const correctOptionId = correctMap.get(answer.questionId);
		const isCorrect = correctOptionId === answer.selectedOptionId;
		const pointValue = pointMap.get(answer.questionId) || 0;

		if (isCorrect) {
			obtainedMarks += pointValue;
		}

		evaluatedAnswers.push({
			quizQuestionId: answer.questionId,
			quizQuestionOptionId: answer.selectedOptionId,
			isCorrect,
		});
	}

	// Validation: Ensure obtained marks do not exceed total marks
	const totalMarks = Number(quiz.totalMarks);
	if (obtainedMarks > totalMarks) {
		throw new AppError('Calculated score exceeds total quiz marks. Data inconsistency detected.', 500)

	}

	//  Calculate Pass/Fail Status
	const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
	const isPassed = percentage >= Number(quiz.passingScore) ? 'passed' : 'failed';

	//  ✅ Execute Transaction
	const attemptData = {
		studentId,
		quizId,
		status: 'submitted',
		obtainedMarks: obtainedMarks.toString(),
		isPassed,
	};

	const savedAttempt = await quizManagementRepository.StudentQuizRepository.submitQuizAttempt(
		attemptData,
		evaluatedAnswers
		);
	
	// Clear temporary Redis key after successful SQL commit
	await QuizDraftService.clearDraft(studentId, quizId);

	 // Return summary for the frontend
	return {
		obtained: Number(savedAttempt.obtainedMarks),
		total: totalMarks,
		isPassed: savedAttempt.isPassed,
		passingScore: Number(quiz.passingScore),
	};


}


/*
* Save temporary batch answers to Redis
*/
export const saveDraftBatch = async (studentId, quizId, answers) => {
	const existingAttempt = await quizManagementRepository.StudentQuizRepository.getExistingAttempt(studentId, quizId);
	if (existingAttempt && existingAttempt.status === 'submitted') {
		return;
	}
	await QuizDraftService.saveDraft(studentId, quizId, answers);
};