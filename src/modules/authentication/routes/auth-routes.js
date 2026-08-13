import {Router} from "express";


import * as authController from "../controllers/auth-controller.js"


const router = Router()

router.post("/register",authController.registerController)

router.post("/otp", authController.verifyOTP)

router.get("/otp", authController.generateOTP)

router.post("/login", authController.login)


export default router;