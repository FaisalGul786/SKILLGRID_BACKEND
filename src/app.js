import express from "express";


import {errorHandler} from "./shared/middleware/global-error-handler.js";

import authRoutes from "./modules/authentication/routes/auth-routes.js"

const app = express();

app.use(express.json());

app.get("/check", (req,res) => {
	res.status(200).json({"message": "route is working..."});
});

// register
app.use("/api/auth", authRoutes);

// verify otp for registeration
app.use("/api/auth/verify", authRoutes);

/************* Global Error Handler Middleware **********/

app.use(errorHandler);

export default app;