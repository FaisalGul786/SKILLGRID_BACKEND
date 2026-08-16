import dotenv from "dotenv";

dotenv.config({ path: ".env.development" })

const envConfig = {
	SECRET_KEY: process.env.SECRET_KEY,
	NODE_ENV: process.env.NODE_ENV,
}

export default envConfig