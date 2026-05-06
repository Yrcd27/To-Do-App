// Central error handler — must have 4 parameters for Express to treat it as error middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose CastError — invalid MongoDB ObjectId in the URL params
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID: "${err.value}" is not a valid resource ID`;
  }

  // Mongoose ValidationError — schema-level field validation failures
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // MongoDB duplicate key error — e.g. registering with an already-used email
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Expose stack trace only in development — never in production
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
