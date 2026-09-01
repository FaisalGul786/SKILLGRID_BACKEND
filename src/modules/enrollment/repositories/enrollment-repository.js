import {db} from "../../../shared/database/config/db-connection.js"
import {enrollments} from "../schema/enrollment-schema.js"
import {eq,and} from "drizzle-orm"
import {logger} from "../../../shared/utils/logger.js"

/*
* check enrollment
*/

export const checkEnrollment = async(courseId,userId) => {

	const existing = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, userId),
        eq(enrollments.courseId, courseId)
      )
    )
    .limit(1);


    logger(`enrollment existing check ********* `, existing)

    return existing
}


/*
* create enrollment
*/

export const createEnrollment = async(courseId,userId) => {

	const [newEnrollment] = await db
    .insert(enrollments)
    .values({
      studentId: userId,
      courseId,
      courseType: 'free'
    })
    .returning();

    logger(`\n\n\n enrollment ******* `, newEnrollment)

    return newEnrollment
	
}