import express from "express";

import cookieParser from "cookie-parser";

import cors from "cors";

import {errorHandler} from "./shared/middleware/global-error-handler.js";

import authRoutes from "./modules/authentication/routes/auth-routes.js"

import courseManagementRoutes from "./modules/course_management/routes/course-management-routes.js"

import lessonManagementRoutes from "./modules/lesson_management/routes/lesson-management-routes.js"

import enrollmentRoutes from "./modules/enrollment/routes/enrollment-routes.js"

import envConfig from "./shared/config_env/env-variables-config.js"

const app = express();
app.set("trust proxy", 1);

const reqOrigin = envConfig.NODE_ENV === 'development' ? "http://localhost:3000" : envConfig.clientURL

app.use(cors({
	origin: reqOrigin,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	credentials: true
}))

app.use(express.json());

app.use(cookieParser());

app.get("/check", (req,res) => {
	res.status(200).json({"message": "route is working..."});
});

// register
app.use("/api/auth", authRoutes);

// verify otp for registeration
app.use("/api/auth/verify", authRoutes);

// OTP resend
app.use("/api/auth/resend", authRoutes);

//  Login
app.use("/api/auth", authRoutes)

// Forgot Password
app.use("/api/auth", authRoutes)

// verify otp for forgot password
app.use("/api/auth/otp", authRoutes)

// update password 
app.use("/api/auth", authRoutes)

// COURSE-MANAGEMENT____________________________________________________________________________________________________________________________________________

// Instructor gets signature to directly upload media
app.use("/api/media/upload", courseManagementRoutes)

// Instructor create course
app.use("/api/course", courseManagementRoutes)

// get all courses cataloge
app.use("/api/courses", courseManagementRoutes)

// fetch course lessons
app.use("/api/courses", courseManagementRoutes)

// Instructor adds lessons to created course before publishing course like title/notes
app.use("/api/courses", lessonManagementRoutes)

// Instructor gets signature to upload video / pdf directly
app.use("/api/lessons/media", lessonManagementRoutes) 

// save data to lesson
app.use("/api/lessons", lessonManagementRoutes)

// Enrollment____________________________________________________________________________________________________________________________________________________________________

app.use('/api/courses', enrollmentRoutes)


/************* Global Error Handler Middleware **********/

app.use(errorHandler);

export default app;