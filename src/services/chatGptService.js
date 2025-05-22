import OpenAI from 'openai'
import { env } from '~/config/environment'
import { chatGptModel } from '~/models/chatGptModel'

const getChatGptHistory = async userId => {
  const history = await chatGptModel.getChatGptHistory(userId)
  return history
}

const searchByChatGpt = async (userId, question) => {
  const history = await chatGptModel.searchByChatGpt(userId, question)
  return history
}

export const chatGptService = {
  getChatGptHistory,
  searchByChatGpt
}
