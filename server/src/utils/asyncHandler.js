/**
 * Wraps async route handlers to forward errors to the error middleware.
 * Eliminates try/catch boilerplate in every controller.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };