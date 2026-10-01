import { Router } from 'express';
import {
  downloadCertificate
} from '../controllers/certificate-controller.js';
import authenticate from '../../../shared/middleware/authenticate.js';

const router = Router();

router.get('/courses/:courseId/certificate',authenticate, downloadCertificate);

export default router;