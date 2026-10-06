// src/shared/middleware/validate-payload.js

import { ValidationError } from "../errors/validation-error-class.js";

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies, // Added to pass req.cookies to Zod
      });

      // Reassign sanitized body
      req.body = validatedData.body || {};

      // Mutate req.query
      if (req.query) {
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, validatedData.query || {});
      }

      // Mutate req.params
      if (req.params) {
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, validatedData.params || {});
      }

      // Mutate req.cookies
      if (req.cookies) {
        Object.keys(req.cookies).forEach((key) => delete req.cookies[key]);
        Object.assign(req.cookies, validatedData.cookies || {});
      }

    } catch (error) {
      return next(new ValidationError(error));
    }

    next();
  };
};