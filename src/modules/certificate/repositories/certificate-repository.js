// import { eq, and } from 'drizzle-orm';
// import { db } from '../../../shared/database/config/db-connection.js';
// import { certificates } from '../schema/certificate-schema.js';

// export const getCertificateRecord = async (studentId, courseId) => {
//   const [certificate] = await db
//     .select()
//     .from(certificates)
//     .where(
//       and(
//         eq(certificates.studentId, studentId),
//         eq(certificates.courseId, courseId)
//       )
//     );
//   return certificate;
// };

// export const createCertificate = async (studentId, courseId, certificateCode) => {
//   const [newCert] = await db
//     .insert(certificates)
//     .values({
//       studentId,
//       courseId,
//       certificateCode,
//     })
//     .onConflictDoNothing()
//     .returning();

//   return newCert;
// };


import { eq, and } from 'drizzle-orm';
import { db } from '../../../shared/database/config/db-connection.js';
import { certificates } from '../schema/certificate-schema.js';
import { users } from '../../authentication/schema/authentication-schema.js';
import { courses } from '../../course_management/schema/course-management-schema.js';
import {logger} from "../../../shared/utils/logger.js"
export const getCertificateWithDetails = async (studentId, courseId) => {
  const [record] = await db
    .select({
      id: certificates.id,
      certificateCode: certificates.certificateCode,
      certificateUrl: certificates.certificateUrl,
      issuedAt: certificates.issuedAt,
      studentName: users.userName,
      studentEmail: users.email,
      courseTitle: courses.title,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.studentId, users.id))
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(
      and(
        eq(certificates.studentId, studentId),
        eq(certificates.courseId, courseId)
      )
    );

    logger(`certificate data >>`, record)

  return record;
};

export const getCertificateRecord = async (studentId, courseId) => {
  const [certificate] = await db
    .select()
    .from(certificates)
    .where(
      and(
        eq(certificates.studentId, studentId),
        eq(certificates.courseId, courseId)
      )
    );
  return certificate;
};

export const createCertificate = async (studentId, courseId, certificateCode) => {
  const [newCert] = await db
    .insert(certificates)
    .values({
      studentId,
      courseId,
      certificateCode,
    })
    .onConflictDoNothing()
    .returning();

  return newCert;
};

export const updateCertificateUrl = async (id, certificateUrl) => {
  const [updated] = await db
    .update(certificates)
    .set({ certificateUrl })
    .where(eq(certificates.id, id))
    .returning();

  return updated;
};