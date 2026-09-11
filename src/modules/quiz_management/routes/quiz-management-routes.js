import {Router} from "express";


import * as quizManagementController from "../controllers/quiz-management-controller.js"

import authenticate from "../../../shared/middleware/authenticate.js"

import authorize from "../../../shared/middleware/authorize.js"


const router = Router();

 router.post("/:courseId/quizzes", authenticate, authorize("quiz:create"),quizManagementController.addQuizToCourse)

 router.get("/:courseId/quizzes", authenticate, quizManagementController.listCourseQuizzes)

// # save quiz questions fully

 router.post("/:quizId", authenticate, authorize("quiz:question_manage"), quizManagementController.addQuizDataFull)

 router.get("/:quizId", authenticate, quizManagementController.fetchQuiz)

 router.post("/:quizId/attempts", authenticate, quizManagementController.submitQuizAttempt)

export default router;
