import * as assignmentManagementService from "../services/assignment-management-service.js";

import {logger} from "../../../shared/utils/logger.js"

export const generateAssignmentSignature = async (req, res) => {
	const signatureData = await assignmentManagementService.generateAssignmentSignatureService();

	res.status(200).json({
		success: true,
		data: signatureData
	});
};

export const addAssignmentToCourse = async (req, res) => {
	const { courseId } = req.params;
  const instructorId = req.user.userId;
  const assignmentData = req.body;

  logger(`\n\n courseId >> ${courseId} \n\n instructorId >> ${instructorId} \n\n assignmentData >> `, req.body)

  const newAssignment = await assignmentManagementService.addAssignmentToCourseService(
  	courseId,
  	instructorId,
  	assignmentData
  	);

  res.status(201).json({
  	success: true,
  	message: "Assignment created successfully.",
  	data: newAssignment
  });
};