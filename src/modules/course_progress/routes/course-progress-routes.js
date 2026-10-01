import { Router } from 'express';
import {
  markLessonComplete,
  getCourseProgress
} from '../controllers/course-progress-controller.js';
import  authenticate  from '../../../shared/middleware/authenticate.js';

const router = Router();


router.post('/lessons/:lessonId/complete',authenticate, markLessonComplete);
router.get('/courses/:courseId',authenticate, getCourseProgress);

export default router;