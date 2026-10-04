import { Router } from "express";
import * as adminController from "../controllers/admin-controller.js";
import authenticate from "../../../shared/middleware/authenticate.js";
import authorize from "../../../shared/middleware/authorize.js";

const router = Router();

router.use(authenticate);

// --- Instructor Application Routes ---
router.get("/applications/pending", authorize("admin:manage_instructor_applications"), adminController.getPendingInstructors);
router.patch("/applications/:applicationId/approve", authorize("admin:manage_instructor_applications"), adminController.approveInstructor);
router.patch("/applications/:applicationId/reject", authorize("admin:manage_instructor_applications"), adminController.rejectInstructor);

// --- Certificate Template Routes ---
// Endpoint for admin to get secure Cloudinary signature for template image
router.get("/certificate-templates/signature", authorize("admin:manage_certificates"), adminController.getCertificateSignature);

// Endpoint to save the uploaded image URL and public ID to the database
router.post("/certificate-templates", authorize("admin:manage_certificates"), adminController.createCertificateTemplate);

export default router;