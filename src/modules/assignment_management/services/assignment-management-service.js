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


export const getCourseAssignmentsForStudentService = async (courseId, studentId) => {
    const results = await assignmentManagementRepository.getAssignmentsWithStudentSubmission(courseId, studentId);

    return results.map(row => {
        return {
            ...row.assignment,
            attachmentUrl: row.assignment.attachmentUrl,
            submission: row.submission || null
        };
    });
};

export const generateStudentSubmissionSignatureService = async (courseId, assignmentId, studentId) => {
    const assignment = await assignmentManagementRepository.getAssignmentById(assignmentId);
    
    if (!assignment || assignment.status !== 'Published') {
        throw new AppError("Assignment not found or not available.", 404);
    }

    if (assignment.dueDate && new Date(assignment.dueDate).getTime() <= Date.now()) {
        throw new AppError("Due date has passed. Submissions are closed.", 403);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "assignment_submissions";
    const public_id = `${courseId}_${assignmentId}_${studentId}`; // Deterministic mapping for overwrite

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder, public_id, overwrite: true },
        envConfig.CLOUDINARY_API_SECRET
    );

    return { 
        signature, 
        timestamp, 
        folder, 
        public_id,
        apiKey: envConfig.CLOUDINARY_API_KEY, 
        cloudName: envConfig.CLOUDINARY_CLOUD_NAME 
    };
};

export const submitOrResubmitAssignmentService = async (courseId, assignmentId, studentId, data) => {
    const assignment = await assignmentManagementRepository.getAssignmentById(assignmentId);
    
    if (!assignment || assignment.status !== 'Published') {
        throw new AppError("Assignment not found or not available.", 404);
    }

    if (assignment.dueDate && new Date(assignment.dueDate).getTime() <= Date.now()) {
        throw new AppError("Due date has passed. Submissions are closed.", 403);
    }

    const payload = {
        assignmentId,
        studentId,
        assignmentUrl: data.assignmentUrl,
        cloudinaryPublicId: data.cloudinaryPublicId,
        cloudinaryResourceType: data.cloudinaryResourceType // Mapping the new field
    };

    return await assignmentManagementRepository.upsertStudentSubmission(payload);
};


export const getInstructorSubmissionsService = async (courseId, instructorId) => {
    const records = await assignmentManagementRepository.getSubmissionsForInstructor(courseId, instructorId);

    logger(`record submissions >> `, records)
    
    // Flatten structure for the frontend UI
    return records.map(record => ({
        id: record.submission.id,
        student: record.student,
        assignmentUrl: record.submission.assignmentUrl,
        status: record.submission.status,
        obtainedMarks: record.submission.obtainedMarks || 0,
        feedback: record.submission.feedback || '',
        isPassed: record.submission.isPassed || false,
        submittedAt: record.submission.submittedAt,
        gradedAt: record.submission.gradedAt,
        totalMarks: record.assignment.assignmentMarks
    }));
};





export const gradeStudentSubmissionService = async (submissionId, instructorId, data) => {
    
    const record = await assignmentManagementRepository.getSubmissionWithAssignmentById(submissionId);

    if (!record) {
        throw new AppError("Submission not found.", 404);
    }
    
    if (record.assignment.instructorId !== instructorId) {
        throw new AppError("Unauthorized. You do not own this assignment.", 403);
    }

    if (data.obtainedMarks < 0 || data.obtainedMarks > record.assignment.assignmentMarks) {
        throw new AppError(`Marks must be between 0 and ${record.assignment.assignmentMarks}.`, 400);
    }

    const payload = {
        obtainedMarks: data.obtainedMarks,
        feedback: data.feedback,
        isPassed: data.isPassed,
        status: 'graded',
        gradedAt: new Date()
    };

    return await assignmentManagementRepository.updateSubmissionGrade(submissionId, payload);
};



