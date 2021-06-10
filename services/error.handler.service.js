exports.errorHandler = (error, req, res, next) => {
  const {
    statusCode = 500,
    status,
    message = 'Something went wrong',
    data,
    validation,
  } = error;

  res.status(status || statusCode).json({
    message,
    data,
    validation,
  });
};
