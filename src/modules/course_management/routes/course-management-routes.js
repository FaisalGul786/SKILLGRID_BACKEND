import {Router} from "express";


import * as courseManagementController from "../controllers/course-management-controller.js"
import authenticate from "../../../shared/middleware/authenticate.js"

import authorize from "../../../shared/middleware/authorize.js"


const router = Router()

router.get("/signature", authenticate, authorize("media:upload"), courseManagementController.getMediaUploadSignature)

router.post("/create", authenticate, authorize("course:create"), courseManagementController.createCourse)

export default router;