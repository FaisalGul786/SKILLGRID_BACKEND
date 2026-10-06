import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({

    userName: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .trim()
    .regex(/^[^<>]*$/, "HTML tags are not allowed in the username"),

    email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

    password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  })
  
});

// Payload schema for user login
export const loginSchema = z.object({
  body: z.object({

    email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

    password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty")
  })
});

// Verify OTP Schema
export const verifyOtpSchema = z.object({
  body: z.object({
    otp: z
      .string({ required_error: "OTP is required" })
      .trim()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),

    registerKey: z
      .string({ required_error: "Register key is required" })
      .trim()
      .min(1, "Register key cannot be empty")
  })
});

// Resend / Generate OTP Schema
export const resendOtpSchema = z.object({
  body: z.object({
    registerKey: z
      .string({ required_error: "Register key is required" })
      .trim()
      .min(1, "Register key cannot be empty")
  })
});

// Forgot Password Request Schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .trim()
      .toLowerCase()
  })
});


// Validate Forgot Password OTP Schema
export const validateForgotPasswordOtpSchema = z.object({
  body: z.object({
    otp: z
      .string({ required_error: "OTP is required" })
      .trim()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
  }),
  cookies: z.object({
    forgot_key: z
      .string({ required_error: "Password reset session missing or expired" })
      .trim()
      .min(1, "Key cannot be empty")
  })
});


// Update Password Schema

export const updatePasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
  cookies: z.object({
    forgot_key: z
      .string({ required_error: "Password reset cookie session missing or expired" })
      .trim()
      .min(1, "Reset key cannot be empty"),
  }),
});


// Apply for Instructor Schema
export const applyInstructorSchema = z.object({
  body: z.object({
    applicationNotes: z
      .string()
      .trim()
      .max(1000, "Application notes cannot exceed 1000 characters")
      .optional()
  })
});