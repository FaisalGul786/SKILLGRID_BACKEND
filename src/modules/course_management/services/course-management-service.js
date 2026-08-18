
import { v2 as cloudinary } from "cloudinary";
import envConfig from "../../../shared/config_env/env-variables-config.js"
import {logger} from "../../../shared/utils/logger.js"

import {AppError } from "../../../shared/errors/app-error.js"

import * as courseManagementRepository from "../repositories/course-management-repository.js"


/*
* generate signature, upload cloudinary
*/

cloudinary.config({
	cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
	api_key: envConfig.CLOUDINARY_API_KEY,
	api_secret: envConfig.CLOUDINARY_API_SECRET,
});

export const generateMediaUploadSignatureService = async() => {

	const timestamp = Math.floor(Date.now() / 1000);

	logger("timestamp ********* ", timestamp)

	const folder = "course_assets";

	// ✅ generate Signature

	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder },
		cloudinary.config().api_secret
		);

	return { signature, timestamp, folder }
}


/*
* create course
*/
export const createCourseService = async(course, instructorId) => {

	// ✅ check thumbnail url format
	const expectedDomain = `https://res.cloudinary.com/${envConfig.CLOUDINARY_CLOUD_NAME}/`;

	if (!course.thumbnail || typeof course.thumbnail !== 'string' || !course.thumbnail.startsWith(expectedDomain)) {
		throw new AppError("Invalid or unauthorized image URL.", 400)
	}

	// ✅ create course in database
	const courseData = await courseManagementRepository.createCourse(course, instructorId)

	return courseData
}