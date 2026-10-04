import * as adminService from "../services/admin-service.js";
import { logger } from "../../../shared/utils/logger.js";

export const getPendingInstructors = async (req, res) => {
    const applications = await adminService.fetchPendingApplicationsService();
    
    return res.status(200).json({
        success: true,
        data: applications
    });
};

export const approveInstructor = async (req, res) => {
    const { applicationId } = req.params;
    
    logger(`Admin approving application: ${applicationId}`);
    
    await adminService.approveInstructorService(applicationId);

    return res.status(200).json({
        success: true,
        message: "Instructor application approved successfully. User role updated."
    });
};

export const rejectInstructor = async (req, res) => {
    const { applicationId } = req.params;
    
    logger(`Admin rejecting application: ${applicationId}`);
    
    await adminService.rejectInstructorService(applicationId);

    return res.status(200).json({
        success: true,
        message: "Instructor application has been rejected."
    });
};


export const getCertificateSignature = async (req, res, next) => {
    try {
        const signatureData = await adminService.generateCertificateTemplateSignatureService();
        return res.status(200).json({
            success: true,
            data: signatureData
        });
    } catch (error) {
        next(error);
    }
};

export const createCertificateTemplate = async (req, res, next) => {
    try {
        const { title, imageUrl, cloudinaryPublicId } = req.body;
        
        const template = await adminService.saveCertificateTemplateService({ 
            title, 
            imageUrl, 
            cloudinaryPublicId 
        });

        return res.status(201).json({
            success: true,
            message: "Certificate template saved successfully.",
            data: template
        });
    } catch (error) {
        next(error);
    }
};