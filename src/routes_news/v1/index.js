import express from 'express'
import { userRoute } from './userRoute'
import { chatGptRoute } from './chatGptRoute'
const router = express.Router()

router.use('/users', userRoute)
router.use('/chatgpts', chatGptRoute)

export const v1Router = router
