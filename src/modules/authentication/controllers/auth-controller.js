


import * as authService from "../services/auth-service.js";


import {logger} from "../../../shared/utils/logger.js"


import envConfig from "../../../shared/config_env/env-variables-config.js"

export const registerController = async(req,res) => {

	const registerKey = await authService.registerService(req.body)

	return res.status(201).json({
		success: true,
		message: "OTP send to your email !",
		registerKey
	})
}


/** verify otp **/

export const verifyOTP = async(req,res) => {

	const {otp, registerKey} = req.body

	logger(`otp from client ***  ${otp}`, registerKey)

	await authService.verifyOTPService(otp, registerKey)

	 return res.status(201).json({
	 	success: true,
	 	message: "Account verified 🥳"
	 })
}

//********** generate OTP ************//

export const generateOTP = async(req,res) => {
	const {registerKey} = req.body

	logger("key ****** "  , registerKey)

	await authService.generateOTPService(registerKey)

	return res.status(200).json({
		success:  true,
		message: "OTP resend !"
	})
}


/*
* LOGIN
*/

export const login = async(req,res) => {
	const { email, password } = req.body;

	const token = await authService.loginService(email, password)

	res.cookie("access_token", token, {
		httpOnly: true,
		secure: envConfig.NODE_ENV === "production",
		sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
		maxAge: 20 * 60 * 1000,
		path: "/",
	})

	return res.status(200).json({
		success: true,
		message: "Logged in successfully 🎊"
	})

}