import {Router} from "express";


import * as enrollmentController from "../controllers/enrollment-controller.js"
import authenticate from "../../../shared/middleware/authenticate.js"

import authorize from "../../../shared/middleware/authorize.js"


const router = Router()

router.post('/:courseId/enrollments', authenticate, enrollmentController.createEnrollment)

export default router;