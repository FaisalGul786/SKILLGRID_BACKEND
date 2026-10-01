import {
  markLessonAsComplete,
  getStudentProgress
} from '../services/course-progress-service.js';
import {logger} from "../../../shared/utils/logger.js"

export const markLessonComplete = async (req, res) => {
  
    const studentId = req.user.userId;
    const { lessonId } = req.params;

    const result = await markLessonAsComplete(studentId, lessonId);

    logger('\n\n\n\n\n lesson marked >> ', result)

    return res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: result,
    });
  
};

export const getCourseProgress = async (req, res) => {
  
    const studentId = req.user.userId;
    const { courseId } = req.params;

    const result = await getStudentProgress(studentId, courseId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  
};