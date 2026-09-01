

import {logger} from "../../../shared/utils/logger.js"
import {db} from "../../../shared/database/config/db-connection.js"
import {courses} from "../schema/course-management-schema.js"
import { count, eq, asc, and } from 'drizzle-orm';
import {lessons} from "../../lesson_management/schema/lesson-management-schema.js"
import {enrollments} from "../../enrollment/schema/enrollment-schema.js"


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

/*
* Total courses count
*/
export const coursesCount = async() => {

    const totalCount = await db.select({ count: count() })
    .from(courses)
    .where(
        eq(courses.status, 'published')
        )

    logger(`\n\n **** courses count total `, totalCount)

    return totalCount[0]?.count
}


/*
* fetch courses
*/

export const fetchCoursesData = async(skip, limit) => {
    // Fetch only the sliced 4 courses

    const coursesData = await db
    .select()
    .from(courses)
  .orderBy(asc(courses.id))  // ⚠️ CRITICAL: Always order for consistent pagination
  .limit(limit)
  .offset(skip);  

  return coursesData
}


/*
* fetch course lessons
*/

export const fetchCourseLessons = async(courseId, userId) => {
    let isEnrolled = false;

    if (userId) {
        const record = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .where(
            and(
              eq(enrollments.courseId, courseId),
              eq(enrollments.studentId, userId)
              )
            )
        .limit(1);

        logger(`\n\n\n ****** enrollment `, record)

        isEnrolled = record.length > 0;
    }

  // ✅ Enrolled: Return full lesson objects including video & attachments
    if (isEnrolled) {
        const fullLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, courseId))
        .orderBy(asc(lessons.lessonNo));

        logger(`\n\n\n******** fullLessons `, fullLessons)

        return { isEnrolled: true, lessons: fullLessons };
    }

  // ✅ Not Enrolled send without video | attachements
    const publicLessons = await db
    .select({
      id: lessons.id,
      courseId: lessons.courseId,
      title: lessons.title,
      duration: lessons.duration,
      lessonNo: lessons.lessonNo,
      lessonType: lessons.lessonType,
      notes: lessons.notes,
  })
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(asc(lessons.lessonNo));

    logger(`\n\n public lessosn **** `, publicLessons)
    return { isEnrolled: false, lessons: publicLessons };


}