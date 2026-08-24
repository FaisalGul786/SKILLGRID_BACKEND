


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


	logger("****** generated token ******** ", token)


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


/*
* Forgot Password
*/

export const forgotPassword = async(req,res) => {
	const {email} = req.body

	const key = await authService.generateForgotPasswordOTP(email)
	logger(`key **********`,key)

	res.cookie("forgot_key", key, {
		httpOnly: true,
		secure: envConfig.NODE_ENV === "production",
		sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
		maxAge: 10 * 60 * 1000,
		path: "/api/auth",
	})

	return res.status(200).json({
		success: true,
		message: "If an account associated with that email exists, we have sent a verification code to your inbox.",
		// remove key latter when frontend is ready
		forgotPasswordKey: key
	})
}


/*
* validate Forgot Password OTP
*/
export const validateForgotPasswordOTP = async(req,res) => {
	const { otp, forgotPasswordKey } = req.body

	logger(`\n\n\n ****** Is there attched key `, req.user);

	logger(`**************\n \n ${otp}`, forgotPasswordKey)

	await authService.validateForgotPasswordOTPService(otp, forgotPasswordKey)

	return res.status(200).json({
		success: true,
		message: "OTP Verified !",
		forgotPasswordKey
	})
}


/*
* update password
*/
export const updatePassword = async(req,res) => {
	const { newPassword, forgotPasswordKey } = req.body

	await authService.updatePasswordService(newPassword, forgotPasswordKey)

	return res.status(200).json({
		success: true,
		message: "password set successfully 🎊"
	})
}