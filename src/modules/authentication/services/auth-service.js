import {AppError} from "../../../shared/errors/app-error.js"


import * as authRepository from "../repositories/auth-repository.js"


import bcrypt from "bcryptjs"

import {generateVerificationOTP} from "../../../shared/utils/create-otp.js"

import  {sendTestOtp} from "../../../external_services/email_service/send-email.js"

import {logger} from "../../../shared/utils/logger.js"

import jwt from "jsonwebtoken"

import envConfig from "../../../shared/config_env/env-variables-config.js"

/*
* User Register
*/

export const registerService = async(registerationData) => {
	// ✅ check email exist in database

	const isEmailExist = await authRepository.emailCheckRepository(registerationData.email)

	if(isEmailExist.length > 0) throw new AppError("Email already exist!!", 409)

		const hashPassword = await bcrypt.hash(registerationData.password, 10)

	logger("*** password hash *** ", hashPassword)

	
	const otp = generateVerificationOTP()
	logger("generated ***** OTP ********* ", otp)

	// ✅ get default roleId of student
	const defaultId = await authRepository.getDefaultId()
	logger("***** student Id ********** ", defaultId)

	// ✅ Set data in upstash
	const {response, tempUserKey} = await authRepository.storeDataInUpstash(registerationData, otp, hashPassword, defaultId)
	if(!response) {
		throw new AppError("data not store in upsatah database")
	}

	// ✅ send otp to email
	try {
		await sendTestOtp(registerationData.email, otp)

	}
	catch(error) {
		logger("OTP sending issue **** ", error.message)

		throw new AppError(
			"Unable to send OTP",
			500
			);
	}

	return tempUserKey;
}


//**************** verify OTP Service *************** **//

export const verifyOTPService = async(otp, registerKey) => {

	// ✅ get data
	const data = await authRepository.getDataFromUpstash(registerKey)

	if(!data) {
		throw new AppError("Session expired due to inactivity. Please sign up again.", 400, "REGISTRATION_EXPIRED")
	}


	// ✅ check OTP time
	if (Date.now() > data.otpExpiresAt) {

		logger(`date.now ************${Date.now()}`, data.otpExpiresAt)
		logger(`Date.now() > data.otpExpiresAt ******* `, Date.now() > data.otpExpiresAt)

		throw new AppError("OTP has expired. Click resend to get a new code.", 400, "OTP_EXPIRED")
	}

	// ✅ validate OTP

	if (data.otp !== otp) {
		

		throw new AppError("Invalid OTP code.", 400)
	}

	// ✅ remove data from redis / store in database

	await authRepository.storeRegisteredUser(data);

	// ✅ Clean up Redis

	await authRepository.cleanRedis(registerKey)

	// ✅ account register email 

	return;
}


//************** generate OTP Service ***********//

export const generateOTPService = async(token) => {

	const isPresent = await authRepository.checkDataInUpstash(token)

	if(isPresent === null) {
		throw new AppError("Session expired due to inactivity. Please sign up again.", 400, "REGISTRATION_EXPIRED")
	}

	// ✅ send otp to email
	const otp = generateVerificationOTP()

	logger("new OTP *********", otp)

	// ✅ update otp in Upstash
	logger("fetch data  upsatah ***** ", isPresent);
	logger("\n", null)
	isPresent.otp = otp;
	isPresent.otpExpiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
	logger("after update ****** ", isPresent)
	await authRepository.updateOTPInUpstash(isPresent, token)

	try {
		await sendTestOtp(isPresent.email, otp)

	}
	catch(error) {
		logger("OTP sending issue **** ", error)

		throw new AppError(
			"Unable to send OTP",
			500
			);
	}

	return;
}


/*
* LOGIN SERVICE
*/

export const loginService = async(email, password) => {

	// ✅ check User exist in database , is_verified

	const user = await authRepository.findUser(email)

	logger("******** User in database ", user);

	if(user < 1) throw new AppError("User not Exist 🙅🏻‍♂️", 404)

	// ✅ validate password

		const isPsswordMatched = await bcrypt.compare(password, user[0]?.password)
	logger("***** password bcrypt ********* ", isPsswordMatched)

	if(!isPsswordMatched) throw new AppError("Email or Password are no correct 🚫", 401)


	//✅ sign jwt token
		const signToken = await jwt.sign(
		{
			userId: user[0]?.id,
			userName: user[0]?.userName
		},
		envConfig.SECRET_KEY,
		{expiresIn: "20m"})

	return signToken;
}

/*
* Forgot Password service
*/

export const generateForgotPasswordOTP = async(email) => {

	// ✅ check email exist before generating OTP for forgot password

	const isUserExist = await authRepository.findUser(email)

	logger("******** User in database ", isUserExist);

	if(isUserExist < 1) throw new AppError("If an account associated with that email exists, we have sent a verification code to your inbox.", 200);


	// ✅ store email, OTP , varified === false in Upstash 

	const otp = generateVerificationOTP()
	logger("generated otp ********* ", otp)

	// ✅ store in redis
	const key = await authRepository.storeUpstash(otp, email)

	logger("**** key", key)

	// ✅ email OTP


	try {
		await sendTestOtp(email, otp)

	}
	catch(error) {
		logger("OTP sending issue **** ", error)

		throw new AppError(
			"Unable to send OTP",
			500
			);
	}

	return key;

}


/*
* validate forgot password
*/
export const validateForgotPasswordOTPService = async(otp, key) => {
	
	// ✅ fetch data from redis
	const data = await authRepository.getDataFromUpstash(key)

	if(!data) {
		throw new AppError("Session expired due to inactivity. Please sign up again.", 400, "REGISTRATION_EXPIRED")
	}

	// ✅ compare OTP time

	if (Date.now() > data.otpExpiresAt) {

		logger(`date.now ************${Date.now()}`, data.otpExpiresAt)
		logger(`Date.now() > data.otpExpiresAt ******* `, Date.now() > data.otpExpiresAt)

		throw new AppError("OTP has expired.", 400, "OTP_EXPIRED")
	}

	// ✅ validate OTP

	if (data.otp !== otp) {
		

		throw new AppError("Invalid OTP code.", 400)
	}

	// ✅ update stash varified => true

	data.verified = true;

	await authRepository.updateOTPInUpstash(data, key)

	return;


}


/*
* update password
*/


export const updatePasswordService = async(newPassword, key) => {

	// ✅ get data
	const data = await authRepository.getDataFromUpstash(key);
	logger("**** upstash data ", data)

	if(data.verified !== true) throw new AppError("Invalid or expired reset session. Please request a new OTP.", 400)

	// ✅ set new password

		const hashPassword = await bcrypt.hash(newPassword, 10)

	await authRepository.setNewPassword(data.email, hashPassword)

	// ✅  clean redis
	await authRepository.cleanRedis(key)

	return;
}