import express from 'express'
import conventionsRouter from './conventions.route'
import usersRouter from './users.route'
import friendRouter from './friend.route'
import resourceRouter from './resource.route'
import postRouter from './post.route'
import commentRouter from './comment.route'
import reactionRouter from './reaction.route'
import groupRouter from './group.route'
import searchRouter from './search.route'
import pollRouter from './poll.route'
import postviewRouter from './postview.route'
import chatgptRouter from './chatgpt.route'
import notificationRouter from './notification.route'
const router = express.Router()

router.use('/convention', conventionsRouter)
router.use('/user', usersRouter)
router.use('/friend', friendRouter)
router.use('/resource', resourceRouter)
router.use('/post', postRouter)
router.use('/comment', commentRouter)
router.use('/reaction', reactionRouter)
router.use('/group', groupRouter)
router.use('/search', searchRouter)
router.use('/poll', pollRouter)
router.use('/postview', postviewRouter)
router.use('/chatgpt', chatgptRouter)
router.use('/notification', notificationRouter)
router.get('/home', (req, res) => res.send('This home'))
router.get('/', (req, res) => res.json({ state: 'success' }))

export default router
