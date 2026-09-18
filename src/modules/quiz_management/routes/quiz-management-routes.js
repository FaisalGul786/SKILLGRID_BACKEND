import {Router} from "express";


import * as quizManagementController from "../controllers/quiz-management-controller.js"

import authenticate from "../../../shared/middleware/authenticate.js"

import authorize from "../../../shared/middleware/authorize.js"


const router = Router();

 router.post("/:courseId/quizzes", authenticate, authorize("quiz:create"),quizManagementController.addQuizToCourse)

 router.get("/:courseId/quizzes", authenticate, quizManagementController.listCourseQuizzes)

 router.get("/:courseId/quizzes/:quizId/attempt", authenticate, quizManagementController.fetchQuestionOptionForQuizAttempt)

 router.post("/:courseId/quizzes/:quizId/attempt", authenticate, quizManagementController.markQuizAttempt)

 // Add PATCH endpoint for Redis draft options sync
router.patch("/:courseId/quizzes/:quizId/attempt/draft", authenticate, quizManagementController.saveQuizDraft)

// # save quiz questions fully

 router.post("/:quizId", authenticate, authorize("quiz:question_manage"), quizManagementController.addQuizDataFull)


export default router;
