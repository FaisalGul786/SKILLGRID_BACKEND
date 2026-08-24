import {Router} from "express";


import * as lessonManagementController from "../controllers/lesson-management-controller.js"

import authenticate from "../../../shared/middleware/authenticate.js"

import authorize from "../../../shared/middleware/authorize.js"


const router = Router();

 router.post("/:courseId/lessons", authenticate, authorize("lesson:create"),lessonManagementController.addLessonsToCourse)

 router.get("/upload/signature", authenticate, authorize("media:upload"), lessonManagementController.getMediaUploadSignature)

// # save lesson data fully

 router.patch("/:lessonId", authenticate, authorize("lesson:patch"), lessonManagementController.addLessonDataFull)

export default router;