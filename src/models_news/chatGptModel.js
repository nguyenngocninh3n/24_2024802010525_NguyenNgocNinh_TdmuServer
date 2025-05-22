import mongoose from 'mongoose'
import OpenAI from 'openai'
const Schema = mongoose.Schema

const chatGPTSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId },
    question: { type: String },
    answer: { type: String }
  },
  { timestamps: true }
)
const chatGptModelInstance = mongoose.model('Chatgpt', chatGPTSchema)

const queryChatGPT = async question => {
  const openai = new OpenAI({ apiKey: env.CHATGPT_API_KEY })
  const completion = await openai.chat.completions
    .create({
      model: 'gpt-4o-mini',
      store: true,
      messages: [{ role: 'user', content: question }]
    })
    .then(result => result.choices[0].message.content)
  return completion
}

const getChatGptHistory = async userId => {
  const history = await chatGptModelInstance.find({ userId })
  return history
}

const searchByChatGpt = async (userId, question) => {
  const answer = await queryChatGPT(question)
  const insertItem = await chatGptModelInstance.create({ userId, question, answer })
  return insertItem
}

export const chatGptModel = {
  chatGptModelInstance,
  getChatGptHistory,
  searchByChatGpt
}
