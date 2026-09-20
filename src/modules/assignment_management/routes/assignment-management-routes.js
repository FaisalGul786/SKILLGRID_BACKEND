import { Router } from "express";
import * as assignmentManagementController from "../controllers/assignment-management-controller.js";
import authenticate from "../../../shared/middleware/authenticate.js";
import authorize from "../../../shared/middleware/authorize.js";

const router = Router();

// Route to get Cloudinary signature for assignment PDF uploads
router.get(
  "/:courseId/assignments/signature",
  authenticate,
  authorize("assignment:create"),
  assignmentManagementController.generateAssignmentSignature
);

// Route to save the assignment data to the database
router.post(
  "/:courseId/assignments",
  authenticate,
  authorize("assignment:create"),
  assignmentManagementController.addAssignmentToCourse
);

export default router;