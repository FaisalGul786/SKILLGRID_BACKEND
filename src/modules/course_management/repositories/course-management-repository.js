

import {logger} from "../../../shared/utils/logger.js"
import {db} from "../../../shared/database/config/db-connection.js"
import {courses} from "../schema/course-management-schema.js"
/*
* create course
*/

export const createCourse = async(course, instructorId) => {

	const [courseData] = await db.insert(courses).values({
		title: course.title,
		description: course.description,
		thumbnail: course.thumbnail,
		price: course.price,
		difficulty: course.difficulty,
		category: course.category,
		status: course.status,
		instructorId
	}).returning()

	logger("\n ******* course data ", courseData)

	return courseData
}