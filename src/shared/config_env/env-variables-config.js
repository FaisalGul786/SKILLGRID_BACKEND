import dotenv from "dotenv";

dotenv.config({ path: ".env.development" })

const envConfig = {
	SECRET_KEY: process.env.SECRET_KEY,
	NODE_ENV: process.env.NODE_ENV,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

export default envConfig