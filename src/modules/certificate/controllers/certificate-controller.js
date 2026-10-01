import { getCertificateUrlService } from '../services/certificate-service.js';
import { logger } from "../../../shared/utils/logger.js"

export const downloadCertificate = async (req, res) => {
  const studentId = req.user.userId;
  const { courseId } = req.params;

  logger(`studentId >> courseId ${studentId} `, courseId);

  // Fetch the secure Cloudinary URL
  const { url } = await getCertificateUrlService(studentId, courseId);

  return res.status(200).json({
    success: true,
    url: url
  });
};