const { env } =require('../config/environment')

const { StatusCodes } = require('http-status-codes')

export const errorHandler = (error, req, res, next) => {
  const customError = {
    statusCode: error?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
    message: error.message ?? StatusCodes[error.statusCode],
    stack: error.originError.stack ?? error.stack
  }
  if (env.BUILD_MODE !== 'dev') {
    delete customError.stack
  }
  res.status(customError.statusCode).json(customError)
}
