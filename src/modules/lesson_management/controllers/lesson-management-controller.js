

import * as lessonManagementService  from "../services/lesson-management-service.js"

import {logger} from "../../../shared/utils/logger.js"

/*
* create draft lesson
*/

export const addLessonsToCourse = async(req,res) => {
	const {courseId} = req.params;

	logger("\n course ID ******** ", courseId)

	const {title, notes} = req.body;
	logger(`\n title ******** ${title} \n \n ******** notes`, notes)

	const InstructorId = req.user.userId;

	logger("\n \n ****** Instructor ID ", InstructorId)

	const newlesson = await lessonManagementService.addLessonsToCourseService(req.body, InstructorId, courseId)

	return res.status(201).json({
		success: true,
		message: "lesson added as Draft",
		lessonId: newlesson.id
	})

}

/*
* video / pdf upload signature
*/
export const getMediaUploadSignature = async(req,res) => {

	const { fileType, targetField } = req.body;

	const { signature, timestamp, folder, resourceType, apiKey, cloudName } = await lessonManagementService.generateSignature(fileType, targetField)

	return res.status(200).json({
		success: true,
		message: "signature generated 🙂",
		signature,
		timestamp,
		folder,
		resourceType,
		apiKey,
		cloudName
	})

}


/*
* add lesson data left 
*/

export const addLessonDataFull = async(req,res) => {
	const { publicId, resourceType, mainUrl, duration, lessonNo, courseId } = req.body
	const { lessonId } = req.params;


	const instructorId = req.user.userId;

	logger("\n\n\n\n\n ********** lesson complete data ", {
		lessonNo,
		publicId,
		resourceType,
		mainUrl,
		duration,
		lessonId,
		courseId,
		instructorId
	})

	const fullLesson = await lessonManagementService.addLessonData(req.body, lessonId, instructorId);

	logger("\n\n\n\n\n\n ****** response ", fullLesson)

	res.status(200).json({
		success: true,
		message: "lesson add fully ☺️",
		lessonId: fullLesson[0].id
	})
}