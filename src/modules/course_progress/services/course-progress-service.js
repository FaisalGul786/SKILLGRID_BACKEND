import crypto from 'crypto';
import { AppError } from '../../../shared/errors/app-error.js';
import {
  getCourseTotalsAndCompleted,
  updateEnrollmentProgress,
  getLessonById,
  upsertLessonProgress
} from '../repositories/course-progress-repository.js';

import { issueCertificateService } from '../../certificate/services/certificate-service.js';

import {logger} from '../../../shared/utils/logger.js'

export const recalculateCourseProgress = async (studentId, courseId) => {
  const stats = await getCourseTotalsAndCompleted(studentId, courseId);
  
  const totalItems = stats.lessons.total + stats.quizzes.total + stats.assignments.total;
  const completedItems = stats.lessons.completed + stats.quizzes.passed + stats.assignments.passed;

  if (totalItems === 0) {
    await updateEnrollmentProgress(studentId, courseId, 0, false);
    return { progressPercentage: 0, isCompleted: false, stats };
  }

  const progressPercentage = (completedItems / totalItems) * 100;
  const isCompleted = progressPercentage >= 100 && completedItems === totalItems;

  await updateEnrollmentProgress(studentId, courseId, progressPercentage, isCompleted);

  let certificate = null;
  if (isCompleted) {
    
    certificate = await issueCertificateService(studentId, courseId); 
  }

  return {
    progressPercentage: Number(progressPercentage.toFixed(2)),
    isCompleted,
    certificate,
    stats,
  };
};

export const markLessonAsComplete = async (studentId, lessonId) => {
  const lesson = await getLessonById(lessonId);
  logger(`lesson \n`, lesson)
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  const lessonProgress = await upsertLessonProgress(studentId, lessonId);
  logger(`lesson progress marked \n\n `, lessonProgress)

  return await recalculateCourseProgress(studentId, lesson.courseId);
};

export const getStudentProgress = async (studentId, courseId) => {
  return await recalculateCourseProgress(studentId, courseId);
};