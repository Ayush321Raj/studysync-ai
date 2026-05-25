import { ApiError } from "../utils/ApiError.js";

/**
 * Generic Zod validation middleware
 * Usage: router.post('/login', validate(loginSchema), loginController)
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // Replace with sanitized data
    next();
  } catch (error) {
    const errors = error.errors?.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }
};