import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const login = async (req, res, next) => {
  try {
    const user = await userModel.login(reqBody)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(new ApiError(error.message, error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR, error))
  }
}

const register = async (req, res, next) => {
  try {
    const userInfo = req.body
    const newUser = await userService.register(userInfo)
    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    next(new ApiError(error.message, error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR, error))
  }
}

const update = async (req, res, next) => {
  try {
    const userInfo = req.body
    const newUser = await userService.register(userInfo)
    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    next(new ApiError(error.message, error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR, error))
  }
}

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params
    const user = await userService.getUserById(userId)
    res.status(StatusCodes.CREATED).json(user)
  } catch (error) {
    next(new ApiError(error.message, error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR, error))
  }
}

export const userController = {
  login,
  register,
  update,
  getUserById
}
