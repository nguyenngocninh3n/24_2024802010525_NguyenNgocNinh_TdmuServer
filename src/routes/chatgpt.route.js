const express = require('express')
const ChatGptController = require('../controllers/ChatGptController')
const router = express.Router()

router.get('/:userID', ChatGptController.handleGetChatGPTByUserID)
router.post('/:userID', ChatGptController.handlePostNewChat)

module.exports = router