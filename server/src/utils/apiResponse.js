/**
 * Standard API Success Response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any} [data=null]
 * @param {number} [statusCode=200]
 */
export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  const responsePayload = {
    success: true,
    message,
    ...(data !== null && { data }),
  };
  return res.status(statusCode).json(responsePayload);
};

/**
 * Standard API Error Response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {any} [errors=null]
 */
export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const responsePayload = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };
  return res.status(statusCode).json(responsePayload);
};
