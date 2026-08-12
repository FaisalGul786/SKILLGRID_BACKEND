
import {registerService, verifyOTPService, generateOTPService} from "../services/auth-service.js";

import {logger} from "../../../shared/utils/logger.js"

export const registerController = async(req,res) => {

	const registerKey = await registerService(req.body)

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

	await verifyOTPService(otp, registerKey)

	 return res.status(201).json({
	 	success: true,
	 	message: "Account verified 🥳"
	 })
}

//********** generate OTP ************//

export const generateOTP = async(req,res) => {
	const {registerKey} = req.body

	logger("key ****** "  , registerKey)

	await generateOTPService(registerKey)

	return res.status(200).json({
		success:  true,
		message: "OTP resend !"
	})
}