import { AppError } from "../errors/app-error.js";

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}