import {Router} from "express";


import * as authController from "../controllers/auth-controller.js"


const router = Router()

router.post("/register",authController.registerController)

router.post("/otp", authController.verifyOTP)

router.get("/otp", authController.generateOTP)

router.post("/login", authController.login)

router.post("/forgot-password", authController.forgotPassword)

router.post("/verify/forgot-password", authController.validateForgotPasswordOTP)

router.patch("/update-password", authController.updatePassword)


export default router;