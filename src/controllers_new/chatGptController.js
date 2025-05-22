import { StatusCodes } from 'http-status-codes'
import { chatGptService } from '~/services/chatGptService'
import ApiError from '~/utils/ApiError'

const getChatGptHistory = async (req, res, next) => {
  try {
    const { _id: userId } = req.jwtDecoded
    const history = await chatGptService.getChatGptHistory(userId)
    res.status(StatusCodes.OK).json(history)
  } catch (error) {
    next(new ApiError(error.message, error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR, error))
  }
}

const searchByChatGpt = async (req, res, next) => {
  try {
    const { _id: userId } = req.jwtDecoded
    const { question } = req.body
    const result = await chatGptService.searchByChatGpt(userId, question)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(error.message, error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR, error))
  }
}

export const chatGptController = {
  getChatGptHistory,
  searchByChatGpt
}
