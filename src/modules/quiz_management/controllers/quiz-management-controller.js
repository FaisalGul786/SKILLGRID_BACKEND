

import * as quizManagementService  from "../services/quiz-management-service.js"

import {logger} from "../../../shared/utils/logger.js"

/*
* create draft quiz
*/

export const addQuizToCourse = async(req,res) => {
	const {courseId} = req.params;

	logger("\n course ID ******** ", courseId)

	const {title, description, duration, totalMarks, passingScore, dueDate} = req.body;
	
	logger(`\n title ******** ${title} \n \n ******** description ${description}******** duration ${duration} ******** totalMarks ${totalMarks} passingScore ******** ${passingScore} \n\n ******** dueDate`, dueDate)

	const InstructorId = req.user.userId;

	logger("\n \n ****** Instructor ID ", InstructorId)

	const newQuiz = await quizManagementService.addQuizToCourseService(req.body, InstructorId, courseId)

	return res.status(201).json({
		success: true,
		message: "quiz added as Draft",
		id: newQuiz.id
	})

}


/*
* add quiz questions
*/

export const addQuizDataFull = async(req,res) => {
	const { quizId } = req.params;


	const instructorId = req.user.userId;

	const { courseId, questions }  = req.body

	logger("\n\n\n\n\n ********** quiz complete data ", {
		quizId,
		instructorId,
		courseId
	})

	console.dir(questions, { depth: null });


	const fullQuiz = await quizManagementService.addQuizData(questions, quizId, instructorId, courseId);

	logger("\n\n\n\n\n\n ****** response ", fullQuiz)

	res.status(200).json({
		success: true,
		message: "quiz added fully ☺️",
		quizId: fullQuiz
	})
}


/*
* list quizzes for a course
*/

export const listCourseQuizzes = async(req,res) => {
	const { courseId } = req.params;
	const userId = req.user.userId;

	const { isOwner, quizzes } = await quizManagementService.listCourseQuizzesService(courseId, userId)

	return res.status(200).json({
		success: true,
		message: "Quizzes data ...",
		isOwner,
		quizzes
	})
}


/*
* fetch one quiz
*/

export const fetchQuiz = async(req,res) => {
	const { quizId } = req.params;
	const userId = req.user.userId;

	const { isOwner, quiz, questions } = await quizManagementService.fetchQuizService(quizId, userId)

	return res.status(200).json({
		success: true,
		message: "Quiz data ...",
		isOwner,
		quiz,
		questions
	})
}


/*
* submit quiz attempt
*/

export const submitQuizAttempt = async(req,res) => {
	const { quizId } = req.params;
	const userId = req.user.userId;
	const { answers } = req.body;

	const attempt = await quizManagementService.submitQuizAttemptService(quizId, userId, answers)

	return res.status(201).json({
		success: true,
		message: "Quiz attempt submitted 🎉",
		attempt
	})
}
