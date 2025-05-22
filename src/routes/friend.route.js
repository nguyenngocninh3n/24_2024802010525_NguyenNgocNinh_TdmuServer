const express = require('express')
const FriendController = require('../controllers/FriendController')
const friendRouter = express.Router()

friendRouter.get('/list/:id', FriendController.getListFriend)
friendRouter.get('/status', FriendController.getStatusFriend)
friendRouter.get('/suggest/:userID', FriendController.getSuggestFriend)
friendRouter.get('/accepting/:userID', FriendController.getRequestFriends)
friendRouter.get('/pending/:userID', FriendController.getPendingFriends)
friendRouter.post('/suggest/:ownerID/remove/:userID', FriendController.removeSuggestFriend)
friendRouter.post('/status/update', FriendController.updateStatusFriend)
module.exports = friendRouter
