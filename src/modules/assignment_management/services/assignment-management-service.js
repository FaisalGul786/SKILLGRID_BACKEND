import * as assignmentManagementRepository from "../repositories/assignment-management-repository.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { v2 as cloudinary } from "cloudinary";
import envConfig from "../../../shared/config_env/env-variables-config.js";

import {logger} from "../../../shared/utils/logger.js"

cloudinary.config({
	cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
	api_key: envConfig.CLOUDINARY_API_KEY,
	api_secret: envConfig.CLOUDINARY_API_SECRET,
});

export const generateAssignmentSignatureService = async () => {
	const timestamp = Math.floor(Date.now() / 1000);
	const folder = "assignments"; 

	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder },
		envConfig.CLOUDINARY_API_SECRET
		);
	logger(`\n generated signature for raw data upload `, signature)

	return { signature, timestamp, folder, apiKey: envConfig.CLOUDINARY_API_KEY, cloudName: envConfig.CLOUDINARY_CLOUD_NAME };
};

export const addAssignmentToCourseService = async (courseId, instructorId, data) => {
	const {
		title,
		description,
		assignmentMarks,
		passingMarks,
		dueDate,
		attachmentUrl,
		cloudinaryPublicId,
		cloudinaryResourceType
	} = data;


	if (passingMarks > assignmentMarks) {
		throw new AppError("Passing marks cannot exceed total assignment marks.", 400);
	}

	if (dueDate && new Date(dueDate).getTime() <= Date.now()) {
		throw new AppError("Due date must be in the future.", 400);
	}

	const payload = {
		courseId,
		instructorId,
		title,
		description,
		assignmentMarks,
		passingMarks,
		dueDate: dueDate ? new Date(dueDate) : null,
		attachmentUrl,
		cloudinaryPublicId,
		cloudinaryResourceType,
		status: "Published", 
	};

	logger(`\n payload for assignment creation`, payload)

	return await assignmentManagementRepository.addAssignment(payload);
};