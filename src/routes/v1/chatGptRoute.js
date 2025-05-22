import ChatGptController from '~/controllers/ChatGptController'
import express from 'express'
const router = express.Router()

router.use('/:userId').get(ChatGptController.handleGetChatGPTByUserID).post(ChatGptController.handlePostNewChat)

export const chatGptRoute = router
