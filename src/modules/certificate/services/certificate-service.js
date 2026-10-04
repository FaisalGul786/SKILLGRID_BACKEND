import crypto from 'crypto';
import stream from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../../../shared/errors/app-error.js';
import { logger } from "../../../shared/utils/logger.js";
import {
  getCertificateRecord,
  getCertificateWithDetails,
  createCertificate,
  updateCertificateUrl,
  getActiveCertificateTemplate
} from '../repositories/certificate-repository.js';
import { generateCertificatePdfBuffer } from './pdf-generator-service.js';



export const issueCertificateService = async (studentId, courseId) => {
  const existingCert = await getCertificateRecord(studentId, courseId);
  
  if (existingCert) {
    return existingCert;
  }

  const certificateCode = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now()}`;
  return await createCertificate(studentId, courseId, certificateCode);
};

export const getCertificateUrlService = async (studentId, courseId) => {
  let certificate = await getCertificateWithDetails(studentId, courseId);
  logger(`certificate details >>`, certificate);
  
  if (!certificate) {
    await issueCertificateService(studentId, courseId);
    certificate = await getCertificateWithDetails(studentId, courseId);
  }

  if (!certificate) throw new AppError('Certificate not unlocked or course not completed', 404);

  // 1. Return cached URL if already generated
  if (certificate.certificateUrl) {
    logger('Returning existing Cloudinary certificate URL');
    return { url: certificate.certificateUrl };
  }

  // 2. Fetch Admin Template (with fallback)
  let templateImageBuffer = null;
  try {
    const activeTemplate = await getActiveCertificateTemplate();
    if (activeTemplate && activeTemplate.imageUrl) {
      const response = await fetch(activeTemplate.imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      templateImageBuffer = Buffer.from(arrayBuffer);
    }
  } catch (error) {
    logger('No admin template found or fetch failed. Falling back to scratch generation.', error);
  }

  // 3. Generate PDF Buffer
  logger('Generating new certificate PDF buffer');
  const pdfBuffer = await generateCertificatePdfBuffer({
    studentName: certificate.studentName,
    courseTitle: certificate.courseTitle,
    certificateCode: certificate.certificateCode,
    issuedAt: certificate.issuedAt,
    templateImageBuffer // Pass the fetched buffer (or null)
  });

  // 4. Upload Buffer to Cloudinary via Stream
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'nexora/certificates', 
        resource_type: 'raw', 
        format: 'pdf',
        public_id: `Certificate-${certificate.certificateCode}`
      },
      (error, result) => {
        if (error) reject(new AppError('Failed to upload certificate to Cloudinary', 500));
        else resolve(result);
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(pdfBuffer);
    bufferStream.pipe(uploadStream);
  });

  // 5. Save Cloudinary URL to the database
  await updateCertificateUrl(certificate.id, uploadResult.secure_url);

  return { url: uploadResult.secure_url };
};