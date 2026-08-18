
import * as courseManagementService from "../services/course-management-service.js"
import envConfig from "../../../shared/config_env/env-variables-config.js"

import {logger} from "../../../shared/utils/logger.js" 




/*
* genearte signature to allow upload directly => CLOUDINARY
*/

export const getMediaUploadSignature = async(req,res) => {
	const {signature, timestamp, folder} = await courseManagementService.generateMediaUploadSignatureService();

	logger(`signature => ${signature} ------ timestamp => ${timestamp} ------- \n folder => `, folder)

	res.status(200).json({
		success: true,
		message: "media upload signature generated 🎉",
		signature,
		timestamp,
		folder,
		apiKey: envConfig.CLOUDINARY_API_KEY,
		cloudName: envConfig.CLOUDINARY_CLOUD_NAME
	})
} 


/*
* create course
*/

export const createCourse  = async(req,res) => {

	const { title, description, thumbnail, price, difficulty, category, status } = req.body;
	logger(`** course data \n `, req.body)

	const instructor = req.user?.userId;

	logger("\n instructor id for course ", instructor)

	const course = await courseManagementService.createCourseService(req.body, instructor)

	return res.status(201).json({
		success:  true,
		message: "Course is created 🎉",
		course: {
			courseId: course.id,
			courseName: course.title
		}
	})
}