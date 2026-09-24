import { Router } from "express";
import * as assignmentManagementController from "../controllers/assignment-management-controller.js";
import authenticate from "../../../shared/middleware/authenticate.js";
import authorize from "../../../shared/middleware/authorize.js";

const router = Router();

// --- Instructor Routes ---

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

/* 
*  --- Student Routes ---
*
*/

// Get all published assignments and current submission statuses
router.get(
  "/:courseId/assignments",
  authenticate,
  assignmentManagementController.getCourseAssignments
);

// Get signature to upload directly to Cloudinary
router.get(
  "/:courseId/assignments/:assignmentId/submissions/signature",
  authenticate,
  assignmentManagementController.generateStudentSubmissionSignature
);

// Save or Update submission record in Database
router.post(
  "/:courseId/assignments/:assignmentId/submissions",
  authenticate,
  assignmentManagementController.submitOrResubmitAssignment
);


export default router;