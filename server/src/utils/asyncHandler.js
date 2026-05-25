/**
 * Wraps async route handlers to forward errors to the error middleware.
 * Eliminates try/catch boilerplate in every controller.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// const getUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);
//   res.json(new ApiResponse(200, user, "User fetched"));
// });

export { asyncHandler };