import { db } from "../../../shared/database/config/db-connection.js";
import { users } from "../../authentication/schema/authentication-schema.js";
import { instructorApplications } from "../../authentication/schema/application-schema.js";
import { roles } from "../../../shared/access_control/schema/roles-schema.js";
import { eq } from "drizzle-orm";
import { logger } from "../../../shared/utils/logger.js";
import { certificateTemplates } from "../schema/certificate-template-schema.js";

// Fetch all pending applications with user details
export const getPendingApplications = async () => {
    return await db.select({
        applicationId: instructorApplications.id,
        userId: instructorApplications.userId,
        userName: users.userName,
        email: users.email,
        notes: instructorApplications.applicationNotes,
        createdAt: instructorApplications.createdAt
    })
    .from(instructorApplications)
    .innerJoin(users, eq(instructorApplications.userId, users.id))
    .where(eq(instructorApplications.status, "pending"));
};

// Fetch specific application to validate state
export const getApplicationById = async (applicationId) => {
    const [application] = await db.select().from(instructorApplications).where(eq(instructorApplications.id, applicationId)).limit(1);
    return application;
};

// Fetch Instructor Role ID
export const getInstructorRoleId = async () => {
    const [role] = await db.select().from(roles).where(eq(roles.roleName, "instructor")).limit(1);
    return role?.id;
};

// Reject Application (Only updates application status)
export const rejectApplication = async (applicationId) => {
    return await db.update(instructorApplications)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(instructorApplications.id, applicationId))
        .returning();
};

// Approve Application (Transaction: updates application AND user role)
export const approveApplicationTransaction = async (applicationId, userId, instructorRoleId) => {
    return await db.transaction(async (tx) => {
        // 1. Update application status
        const [updatedApp] = await tx.update(instructorApplications)
            .set({ status: "approve", updatedAt: new Date() })
            .where(eq(instructorApplications.id, applicationId))
            .returning();

        // 2. Update user role
        await tx.update(users)
            .set({ roleId: instructorRoleId, updatedAt: new Date() })
            .where(eq(users.id, userId));

        logger(`Transaction complete: User ${userId} upgraded to Instructor.`);
        return updatedApp;
    });
};



export const insertCertificateTemplate = async (data) => {
    const [template] = await db.insert(certificateTemplates).values(data).returning();
    return template;
};
