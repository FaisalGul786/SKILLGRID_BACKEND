
import { v2 as cloudinary } from "cloudinary";
import * as lessonManagementRepository from "../repositories/lesson-management-repository.js"
import {logger} from "../../../shared/utils/logger.js"

import {AppError} from "../../../shared/errors/app-error.js"


import envConfig from "../../../shared/config_env/env-variables-config.js"

/*
* add lesson
*/

export const addLessonsToCourseService = async(lesson, instructorId, courseId) => {

	// ✅ check course ownerShip & create lesson as Draft
	const newLesson = await lessonManagementRepository.addLessons(lesson, instructorId, courseId)

	logger("\n \n ****** ownership ", newLesson)


	if(!newLesson) {
		throw new AppError("Unauthorized: You do not own this course or it does not exist.", 403)
	}

	logger("\n \n ****** new lesson ", newLesson)

	return newLesson

}


/*
* generate signature to upload video / pdf
*/

export const generateSignature = async(fileType, targetField) => {

	
	const timestamp = Math.floor(Date.now() / 1000);
  
  // 1. Separate folders by target
  const folder = targetField === "main_media" 
    ? "course_assets/videos" 
    : "course_assets/attachments";

  // 2. Map resource_type for Cloudinary ("video" or "raw")
  const resourceType = fileType === "video" ? "video" : "raw";

  // 3. Generate signature
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    envConfig.CLOUDINARY_API_SECRET
  );

  return { signature, timestamp, folder, resourceType, apiKey: envConfig.CLOUDINARY_API_KEY, cloudName: envConfig.CLOUDINARY_CLOUD_NAME };

}


/*
* add data in lesson like video url
*/

export const addLessonData = async(data, lessonId, instructorId) =>{

	//  ✅ checking ownership & add  data left
	const fullLesson = await lessonManagementRepository.addFullLessonData(data, lessonId, instructorId)

	if(!fullLesson) {
		throw new AppError("Unauthorized: You do not own this course or it does not exist", 403)
	}

	return fullLesson
}