const successResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, statusCode, message = 'Error') => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = { successResponse, errorResponse };
