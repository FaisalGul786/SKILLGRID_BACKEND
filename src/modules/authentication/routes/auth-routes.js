import {Router} from "express";

import {registerController, verifyOTP, generateOTP } from "../controllers/auth-controller.js"

const router = Router()

router.post("/register", registerController)

router.post("/otp", verifyOTP)

router.get("/otp", generateOTP)


export default router;