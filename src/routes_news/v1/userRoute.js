import express from 'express'
import { userController } from '~/controllers/userController'
const router = express.Router()

router.use('/:userID').get(userController.getUserById).put(userController.update)
router.use('/').post(userController.login)

// router.post('/create', userController.createUser)
// router.put('/active/:id', userController.activeUser)
// router.put('/inactive/:id', userController.inActiveUser)
// router.put('/:id/bio/update', userController.handleUpdateBio)
// router.put('/:id/avatar/update', userController.handleUpdateAvatar)
// router.put('/:id/background/update', userController.handleUpdateAvatar)
// router.get('/conventionUserFriend/:id', userController.conventionUserInfor)
// router.get('/all', userController.getAllUser)
// router.get('/:id', userController.getUser)

export const userRoute = router
