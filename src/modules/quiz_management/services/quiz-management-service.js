
import * as quizManagementRepository from "../repositories/quiz-management-repository.js"
import {logger} from "../../../shared/utils/logger.js"

import {AppError} from "../../../shared/errors/app-error.js"


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

export const listCourseQuizzesService = async(courseId, userId) => {
	const ownedCourse = await quizManagementRepository.findOwnedCourse(courseId, userId)

	if(ownedCourse) {
		const quizzesData = await quizManagementRepository.listCourseQuizzes(courseId, false)

		return {
			isOwner: true,
			quizzes: quizzesData
		}
	}

	const isEnrolled = await quizManagementRepository.findEnrollment(courseId, userId)

	if(!isEnrolled) {
		throw new AppError("Unauthorized: Enroll in this course to view quizzes.", 403)
	}

	const quizzesData = await quizManagementRepository.listCourseQuizzes(courseId, true)

	return {
		isOwner: false,
		quizzes: quizzesData
	}
}


/*
* fetch one quiz with questions
*/

export const fetchQuizService = async(quizId, userId) => {
	const quiz = await quizManagementRepository.findQuizById(quizId)

	if(!quiz) {
		throw new AppError("Quiz does not exist.", 404)
	}

	const ownedCourse = await quizManagementRepository.findOwnedCourse(quiz.courseId, userId)
	const isOwner = Boolean(ownedCourse)

	if(!isOwner) {
		const isEnrolled = await quizManagementRepository.findEnrollment(quiz.courseId, userId)

		if(!isEnrolled) {
			throw new AppError("Unauthorized: Enroll in this course to view this quiz.", 403)
		}

		if(!quiz.isPublished) {
			throw new AppError("Quiz is not published yet.", 403)
		}
	}

	const questions = await quizManagementRepository.findQuizQuestionsWithOptions(quizId)

	const safeQuestions = isOwner
		? questions
		: questions.map((question) => ({
			...question,
			options: question.options.map(({ isCorrect, ...option }) => option)
		}))

	return {
		isOwner,
		quiz,
		questions: safeQuestions
	}
}


/*
* submit quiz attempt
*/

export const submitQuizAttemptService = async(quizId, userId, answers) => {
	if(!Array.isArray(answers) || answers.length < 1) {
		throw new AppError("Answers are required.", 400)
	}

	const quiz = await quizManagementRepository.findQuizById(quizId)

	if(!quiz) {
		throw new AppError("Quiz does not exist.", 404)
	}

	if(!quiz.isPublished) {
		throw new AppError("Quiz is not published yet.", 403)
	}

	const isEnrolled = await quizManagementRepository.findEnrollment(quiz.courseId, userId)

	if(!isEnrolled) {
		throw new AppError("Unauthorized: Enroll in this course to attempt this quiz.", 403)
	}

	const questions = await quizManagementRepository.findQuizQuestionsWithOptions(quizId)

	if(questions.length < 1) {
		throw new AppError("Quiz has no questions yet.", 400)
	}

	const answersByQuestionId = new Map(
		answers.map((answer) => [answer.questionId, answer.optionId])
	)

	let score = 0

	for (const question of questions) {
		const selectedOptionId = answersByQuestionId.get(question.id)
		const selectedOption = question.options.find((option) => option.id === selectedOptionId)

		if(selectedOption?.isCorrect) {
			score += 1
		}
	}

	const attempt = await quizManagementRepository.createQuizAttempt(
		quizId,
		userId,
		score,
		questions.length
	)

	return attempt
}
