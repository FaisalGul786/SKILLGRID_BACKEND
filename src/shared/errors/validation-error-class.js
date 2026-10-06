import { AppError } from "./app-error.js";

export class ValidationError extends AppError {
  constructor(error) {
    if (error && error.errors) {
      // 1. Format clean field-level detail array
      const details = error.errors.map((err) => {
        const cleanPath = err.path
          .filter((segment) => !["body", "query", "params", "cookies"].includes(segment))
          .join(".");

        return {
          field: cleanPath || "payload",
          message: err.message,
        };
      });

      // 2. Create unified message string for res.data.message
      const message = details.map((d) => `${d.field}: ${d.message}`).join(", ");

      super(message, 400, "VALIDATION_ERROR");
      this.details = details;
    } else {
      super(error.message || "Invalid request payload", 400, "VALIDATION_ERROR");
      this.details = [];
    }
  }
}