
import {AppError} from "../errors/app-error.js"

import jwt from "jsonwebtoken"

import envConfig from "../config_env/env-variables-config.js"

import {logger} from "../utils/logger.js"

const authenticate = async(req,res,next) => {
	// const token = req.headers.authorization.split(" ")[1]; // For Postman
	const accessToken = req.cookies.access_token; // automatic attach

	if(!accessToken) throw new AppError("Access denied 🚫, Try to login first", 401);

	try{
		const verified = jwt.verify(accessToken, envConfig.SECRET_KEY);
		logger("********* Is user authenticated \n", verified)

		req.user = verified

		next()

	} catch(error) {
		logger("error while authentication ******** \n ", error.message);
		throw new AppError("Invalid or expired token", 403, "AuthenticationError")
	}

}

export default authenticate;