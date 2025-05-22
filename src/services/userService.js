const { userModel } = require('~/models/userModel')

const loginWithEmail = async email => {
  const user = await userModel.loginWithEmail(email)
  if (user) return user
  throw new ApiError('Not regiter', StatusCodes.NOT_FOUND)
}

const loginWithUserId = async userId => {
  const user = await userModel.loginWithUserId(userId)
  if (user) return user
  throw new ApiError('Not regiter', StatusCodes.NOT_FOUND)
}

const login = async reqBody => {
  const { _id, email } = reqBody
  if (_id) return await userModel.loginWithUserId(_id)
  if (email) return await userModel.loginWithEmail(email)
  return await register(reqBody)
}

const register = async userInfo => {
  console.log('🚀 ~ userInfo:', userInfo)
  return {}
}

const getUserById = async userId => {
  const user = await userModel.getUserById(userId)
  if (user) return user
  throw new ApiError('Not found', StatusCodes.NOT_FOUND)
}

const update = async (userId, updateData) => {
  const updatedUser = await userModel.update(userId, updateData)
  if (updatedUser) return updatedUser
  throw new ApiError('Not found', StatusCodes.NOT_FOUND)
}

export const userService = {
  loginWithEmail,
  loginWithUserId,
  login,
  register,
  getUserById,
  update
}
