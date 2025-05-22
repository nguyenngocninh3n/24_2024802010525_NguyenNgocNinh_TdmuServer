class ApiError extends Error {
  constructor(message, statusCode, error) {
    super(message)
    this.name = 'ApiError'
    this.message = message
    this.statusCode = statusCode
    this.originError = error
    Error.captureStackTrace(this, this.contructor)
  }
}
export default ApiError
