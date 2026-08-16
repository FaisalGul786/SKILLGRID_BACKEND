import express from "express";

import cookieParser from "cookie-parser";


import {errorHandler} from "./shared/middleware/global-error-handler.js";

import authRoutes from "./modules/authentication/routes/auth-routes.js"

const app = express();

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

/************* Global Error Handler Middleware **********/

app.use(errorHandler);

export default app;