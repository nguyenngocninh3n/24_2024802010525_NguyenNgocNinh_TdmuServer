import express from 'express'
import { chatGptController } from '~/controllers/chatGptController'
const router = express.Router()

router.use('/').get(chatGptController.getChatGptHistory).post(chatGptController.searchByChatGpt)

export const chatGptRoute = router
