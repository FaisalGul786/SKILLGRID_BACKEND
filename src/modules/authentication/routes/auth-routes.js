import {Router} from "express";


import * as authController from "../controllers/auth-controller.js"

import authenticate from "../../../shared/middleware/authenticate.js"

import {validate} from "../../../shared/middleware/validate-payload.js"

import {createUserSchema, loginSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, validateForgotPasswordOtpSchema, updatePasswordSchema, applyInstructorSchema} from "../validations/authentication-validation.js"

const router = Router()

router.post("/register", validate(createUserSchema), authController.registerController)

router.post("/otp", validate(verifyOtpSchema), authController.verifyOTP)

router.get("/otp",validate(resendOtpSchema), authController.generateOTP)

router.post("/login",validate(loginSchema), authController.login)

router.post("/forgot-password",validate(forgotPasswordSchema), authController.forgotPassword)

router.post("/verify/forgot-password", validate(validateForgotPasswordOtpSchema), authController.validateForgotPasswordOTP)

router.patch("/update-password",validate(updatePasswordSchema), authController.updatePassword)

router.post("/apply-instructor" ,authenticate, validate(applyInstructorSchema),  authController.applyForInstructorController);


export default router;