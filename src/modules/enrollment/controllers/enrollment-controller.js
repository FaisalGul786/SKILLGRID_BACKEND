import * as enrollmentService from "../services/enrollment-service.js"

/*
* create enrollment
*/

export const createEnrollment = async(req,res) => {
	const courseId = req.params.courseId
	const userId = req.user.userId

	const newEnrollment = await enrollmentService.createEnrollment(courseId,userId)

	return res.status(201).json({
		success: true,
		message: `Enrollment created 🎉`,
		newEnrollment
	})
}