import {AppError} from "../../../shared/errors/app-error.js"


import {emailCheckRepository, storeDataInUpstash, getDataFromUpstash, storeRegisteredUser, cleanRedis } from "../repositories/auth-repository.js"

import bcrypt from "bcryptjs"

import {otp} from "../../../shared/utils/create-otp.js"

import  {sendTestOtp} from "../../../external_services/email_service/send-email.js"

import {logger} from "../../../shared/utils/logger.js"

export const registerService = async(registerationData) => {
	
	const isEmailExist = await emailCheckRepository(registerationData.email)

	if(!isEmailExist.length === 0) throw new AppError("Email already exist!!", 409)

		const hashPassword = await bcrypt.hash(registerationData.password, 10)

	logger("*** password hash *** ", hashPassword)

	

	// ✅ Set data in upstash
	const {response, tempUserKey} = await storeDataInUpstash(registerationData, otp, hashPassword)
	if(!response) {
		throw new AppError("data not store in upsatah database")
	}

	// ✅ send otp to email
	try {
		await sendTestOtp(registerationData.email, otp)

	}
	catch(error) {
		logger("OTP sending issue **** ", error)

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
	const data = await getDataFromUpstash(registerKey)

	if(!data) {
		throw new AppError("Session expired due to inactivity. Please sign up again.", 400, "REGISTRATION_EXPIRED")
	}


	// ✅ check OTP time
	if (Date.now() > data.otpExpiresAt) {

    throw new Error("OTP has expired. Click resend to get a new code.", 400, "OTP_EXPIRED")
  }

	// ✅ validate OTP

	if (data.otp !== otp) {
		

		throw new AppError("Invalid OTP code.", 400)
	}

	// ✅ remove data from redis / store in database

	await storeRegisteredUser(data);

	// ✅ Clean up Redis

	await cleanRedis(registerKey)

	// ✅ account register email 

	return;
}