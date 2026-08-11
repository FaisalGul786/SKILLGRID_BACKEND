import {Router} from "express";

import {registerController, verifyOTP } from "../controllers/auth-controller.js"

const router = Router()

router.post("/register", registerController)

router.post("/otp", verifyOTP)


export default router;