import * as adminRepository from "../repositories/admin-repository.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { logger } from "../../../shared/utils/logger.js";
import { v2 as cloudinary } from "cloudinary";
import envConfig from "../../../shared/config_env/env-variables-config.js";

export const fetchPendingApplicationsService = async () => {
    return await adminRepository.getPendingApplications();
};

export const approveInstructorService = async (applicationId) => {
    const application = await adminRepository.getApplicationById(applicationId);

    if (!application) throw new AppError("Application not found.", 404);
    if (application.status !== "pending") throw new AppError(`Cannot approve. Application is already ${application.status}.`, 400);

    const instructorRoleId = await adminRepository.getInstructorRoleId();
    if (!instructorRoleId) throw new AppError("Instructor role not configured in database.", 500);

    await adminRepository.approveApplicationTransaction(applicationId, application.userId, instructorRoleId);
};

export const rejectInstructorService = async (applicationId) => {
    const application = await adminRepository.getApplicationById(applicationId);

    if (!application) throw new AppError("Application not found.", 404);
    if (application.status !== "pending") throw new AppError(`Cannot reject. Application is already ${application.status}.`, 400);

    await adminRepository.rejectApplication(applicationId);
};


cloudinary.config({
    cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
    api_key: envConfig.CLOUDINARY_API_KEY,
    api_secret: envConfig.CLOUDINARY_API_SECRET,
});

export const generateCertificateTemplateSignatureService = async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "certificate_templates"; 

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        envConfig.CLOUDINARY_API_SECRET
    );
    
    logger(`\n generated signature for certificate template upload `, signature);

    return { 
        signature, 
        timestamp, 
        folder, 
        apiKey: envConfig.CLOUDINARY_API_KEY, 
        cloudName: envConfig.CLOUDINARY_CLOUD_NAME 
    };
};

export const saveCertificateTemplateService = async (data) => {
    return await adminRepository.insertCertificateTemplate(data);
};