

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
	const status  = ( req.query.status || pending).toLowerCase();

	logger(`\n\n\n course_id: ${courseId} \n\n\n student_id:${userId} \n status: ${status}`)


	const data = await quizManagementService.listCourseQuizzesService(userId, status, courseId)
	logger(`\n\n\n [counts, quizzes] ---- `, data)

	return res.status(200).json({
		success: true,
		message: "Quizzes data ...",
		quizList: data
	})
}

/*
* fetch one quiz question / options
*/

export const fetchQuestionOptionForQuizAttempt = async(req,res) => {

	const studentId = req.user?.userId;
	const { courseId, quizId } = req.params;

	logger(`\n\n\n --- studentId * ${studentId} ---- courseId * ${courseId} --- quizId * `, quizId)

	const quizData = await quizManagementService.getQuizAttempt(studentId, courseId, quizId);

	logger(`\n\n quiz attempt data ----- `, '')
	console.dir(quizData, { depth: null, colors: true });

	return res.status(200).json({
		success: true,
		message: 'Quiz attempt data . . .',
		quizAttemptData: quizData
	})
}


/*
* mark quiz submitted
*/
export const markQuizAttempt = async(req,res) => {
	const studentId = req.user?.userId;
    const { courseId, quizId } = req.params;
    const { answers } = req.body;

    logger(`\n\n\n --- studentId * ${studentId} \n ---- courseId * ${courseId} \n--- quizId * ${quizId} \n----- answers * `, answers)

    const result = await quizManagementService.evaluateAndSubmit(
      studentId, 
      courseId, 
      quizId, 
      answers
    );

    logger(`quiz Marked --- `, result)

    return res.status(200).json({ success: true, message: 'Quiz submitted successfully',  result});
}


/*
* sync options in redis -- temporary -- autsave
*/

export const saveQuizDraft = async (req, res) => {
  const studentId = req.user?.userId;
  const { quizId } = req.params;
  const { answers } = req.body;

  logger(`\n\n\n --- studentId * ${studentId} \n \n--- quizId * ${quizId} \n----- answers * `, answers)

  await quizManagementService.saveDraftBatch(studentId, quizId, answers);
  return res.status(200).json({ success: true, message: 'Draft batch synced.' });
};