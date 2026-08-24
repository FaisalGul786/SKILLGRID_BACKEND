import { db } from "../../../shared/database/config/db-connection.js"
import { courses } from "../../course_management/schema/course-management-schema.js"
import { lessons } from "../schema/lesson-management-schema.js"
import { and, eq } from "drizzle-orm"
import {logger} from "../../../shared/utils/logger.js"

/*
* create lesson as Draft
*/

export const addLessons = async(lesson,instructorId, courseId) => {
	
	const record = await db
	.select()
	.from(courses)
	.where(
		and(
			eq(courses.id, courseId),
			eq(courses.instructorId, instructorId)
			)
		)
	.limit(1);

	logger("\n \n \n ******** checking course ownership ", record)

	if(record.length < 1) {
		return null
	}

	// create lesson

	const [newLesson] = await db
      .insert(lessons)
      .values({
        title: lesson.title,
        notes: lesson.notes,
        courseId
      })
      .returning();

      return newLesson

}

/*
* add full data to lesson
*/

export const addFullLessonData = async(data, lessonId, instructorId)  => {

	logger("\n\n\n\n\n ********** lesson complete data ", {
		lessonNo: data.lessonNo,
		publicId: data.publicId,
		resourceType:data.resourceType,
		mainUrl: data.mainUrl,
		duration: data.duration,
		lessonId,
		courseId: data.courseId,
		instructorId
	})

	const record = await db
	.select()
	.from(courses)
	.where(
		and(
			eq(courses.id, data.courseId),
			eq(courses.instructorId, instructorId)
			)
		).limit(1);

	logger("\n\n\n\n\n ********* ownership ", record)

	if(record.length < 1) {

		return null
	}

	const completeLessonData = await db
    .update(lessons)
    .set({
      duration: Math.round(data.duration),
      mainUrl: data.mainUrl,
      lessonNo: data.lessonNo,
      isPublished: true,
      lessonType: data.resourceType
    })
    .where(eq(lessons.id, lessonId))
    .returning();

    logger("\n\n\n\n\ ******** full lesson ", completeLessonData)

    return completeLessonData

}

/*
* video data
*/

// {
//     "asset_id": "0232b5872dddfc602022c08391ce7055",
//     "public_id": "course_assets/videos/ajlonh0rwvbwt5ns7bzf",
//     "version": 1787205982,
//     "version_id": "3c4987b26d106a5625b1bb84a7bc759e",
//     "signature": "c2292d9f6c403f4db2507383064e95436027fc6d",
//     "width": 640,
//     "height": 360,
//     "format": "mp4",
//     "resource_type": "video",
//     "created_at": "2026-08-20T06:06:22Z",
//     "tags": [],
//     "pages": 0,
//     "bytes": 3238895,
//     "type": "upload",
//     "etag": "a49eb057e7c74e8e1c30a1b6a1895651",
//     "placeholder": false,
//     "url": "http://res.cloudinary.com/n4emsnyi/video/upload/v1787205982/course_assets/videos/ajlonh0rwvbwt5ns7bzf.mp4",
//     "secure_url": "https://res.cloudinary.com/n4emsnyi/video/upload/v1787205982/course_assets/videos/ajlonh0rwvbwt5ns7bzf.mp4",
//     "playback_url": "https://res.cloudinary.com/n4emsnyi/video/upload/sp_auto/v1787205982/course_assets/videos/ajlonh0rwvbwt5ns7bzf.m3u8",
//     "asset_folder": "course_assets/videos",
//     "display_name": "ajlonh0rwvbwt5ns7bzf",
//     "audio": {
//         "codec": "aac",
//         "bit_rate": "127999",
//         "frequency": 44100,
//         "channels": 2,
//         "channel_layout": "stereo"
//     },
//     "video": {
//         "pix_format": "yuv420p",
//         "codec": "h264",
//         "level": 30,
//         "profile": "Main",
//         "bit_rate": "381975",
//         "dar": "16:9",
//         "time_base": "1/15360"
//     },
//     "is_audio": false,
//     "frame_rate": 30.0,
//     "bit_rate": 517339,
//     "duration": 50.085442,
//     "rotation": 0,
//     "nb_frames": 1501,
//     "original_filename": "Intro to JavaScript _360p",
//     "api_key": "583958294999773"
// }