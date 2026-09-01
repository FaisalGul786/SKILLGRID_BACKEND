import * as enrollmentRepository from "../repositories/enrollment-repository.js"
import { AppError }from "../../../shared/errors/app-error.js"

/*
* enrollment service
*/

export const createEnrollment = async(courseId, userId) => {

	// ✅ check for enrollment
	const checkEnrollment = await enrollmentRepository.checkEnrollment(courseId,userId)

	if(checkEnrollment.length > 0) throw new AppError('Enrollment already exist 🤫',409)

	// ✅ create enrollment
	const  newEnrollment = await enrollmentRepository.createEnrollment(courseId, userId)

	return newEnrollment
}