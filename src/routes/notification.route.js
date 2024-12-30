const express = require('express')
const NotificationController = require('../controllers/NotificationController')
const router = express.Router()

router.get('/:userID', NotificationController.handleGetNotificationByUserID)

module.exports = router