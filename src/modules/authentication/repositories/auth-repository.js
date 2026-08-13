import {db} from "../../../shared/database/config/db-connection.js"

import {users} from "../schema/authentication-schema.js"

import {eq, and} from "drizzle-orm"

import {logger} from "../../../shared/utils/logger.js"

import {redis} from "../../../shared/redis_database/upstash-client.js"

import crypto  from "crypto"

export const emailCheckRepository = async(email) => {
    const isEmailExistDb = await db.select().from(users).where(eq(users.email, email))
    logger("****** check email **** ", isEmailExistDb)

    return isEmailExistDb;
}

/* *********** Upstash data save ******** */
export const storeDataInUpstash = async(data, otp, hashPassword) => {
    const tempUserKey = `user_key: ${crypto.randomUUID()}`
    logger("*** temp-key before storing *** ", tempUserKey)

    const response = await redis.set(tempUserKey, {

        userName: data.userName,
        email: data.email,
        password: hashPassword,
        role: data.role || "user",
        otp,
        otpExpiresAt: Date.now() + 2 * 60 * 1000, // 5-min OTP
    }, { ex: 600})

    return {response, tempUserKey};
}



//******************** get data from Upstash ********** **//

export const getDataFromUpstash = async(key) => {
    const data = await redis.get(key)

    logger("data from upstash **** ", data)

    return data
}

//************************** store register data in database *****//

export const storeRegisteredUser = async(data) => {

    await db.insert(users).values({

        userName: data.userName,
        email: data.email,
        password: data.password,
        role: data.role || "user",
        isVerified: true
    })

    return;
}


//*************** clean redis *********************//
export const cleanRedis = async(key) => {
    await redis.del(key);

    return;
}


//*********** check data in Upstash for OTP again generation ********************************************************************************************************************************************//

export const checkDataInUpstash = async(keyToken) => {
    const data = await redis.get(keyToken)
    logger("***** data in Upstash  ********** ", data)

    return data
}

//*************** setting new OTP after generating new OTP ******************************************************************************************************************************************************************************************************//

export const updateOTPInUpstash = async(newDataWithNewOTP, upstashKey) => {
    logger(" *************** checking new otp before storing in Upstash ************ ", newDataWithNewOTP);

    await redis.set(upstashKey, newDataWithNewOTP);


}




/*
* Login Querries
*/

export const findUser = async(email) => {
    const isUserExist = await db.select().from(users)
    .where(
        and(
            eq(users.email, email),
            eq(users.isVerified, true)
        )
    )
    return isUserExist;


}