
/*
*  authorize user role permission against database  
*/

import {AppError} from "../errors/app-error.js";


import {permissions} from "../access_control/schema/permissions-schema.js"

import {rolePermissions} from "../access_control/schema/role-permissions-schema.js"

import {users} from "../../modules/authentication/schema/authentication-schema.js"

import {logger} from "../utils/logger.js"

import {db} from "../database/config/db-connection.js"

import {eq,and} from "drizzle-orm"

const authorize =  (requiredPermission) => {
	return async(req,res,next) => {

		logger("***** permission to check ", requiredPermission)

		logger(" user id ********* ", req.user?.userId)

		const id = req.user?.userId;

		if(!id) throw new AppError("Unauthorized 🚫", 401);

		// Query permissions assigned to the user via roles

		let foundPermission;
		try {

			foundPermission = await db
			.select({ actionPermission: permissions.actionPermission })
			.from(permissions)
			.innerJoin(
				rolePermissions,
				eq(permissions.id, rolePermissions.permissionId)
				)
			.innerJoin(users, eq(rolePermissions.roleId, users.roleId))
			.where(
				and(
					eq(users.id, id),
					eq(permissions.actionPermission, requiredPermission)
					)
				)
			.limit(1);
		} catch(error) {
			logger("*** failed to fetch permissions ", error.message)
			throw new AppError("Failed to verify user permissions from database", 500);
		}

		logger(`** permissions assigned  to certain role with userId ${req.user?.userId}`, foundPermission)
		if (foundPermission.length === 0) {
			throw new AppError("Forbidden: Insufficient permissions 🚫", 403);
		}

		next()
	}

}

export default authorize