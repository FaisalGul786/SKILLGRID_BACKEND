import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import app from "./app.js";

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`server is running at PORT ${port}`);
});