const express = require('express')
const userController = require('../controllers/UserController')
const router = express.Router()

router.post('/create', userController.createUser)
router.put('/active/:id', userController.activeUser)
router.put('/inactive/:id', userController.inActiveUser)
router.put('/:id/bio/update', userController.handleUpdateBio)
router.put('/:id/avatar/update', userController.handleUpdateAvatar)
router.put('/:id/background/update', userController.handleUpdateAvatar)
router.get('/conventionUserFriend/:id', userController.conventionUserInfor)
router.get('/all', userController.getAllUser)
router.get('/:id', userController.getUser)

module.exports = router
