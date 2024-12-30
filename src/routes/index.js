const usersRouter = require('./users.route')
const conventionsRouter = require('./conventions.route')
const friendRouter = require('./friend.route')
const resourceRouter = require('./resource.route')
const postRouter = require('./post.route')
const commentRouter = require('./comment.route')
const reactionRouter = require('./reaction.route')
const groupRouter = require('./group.route')
const searchRouter = require('./search.route')
const pollRouter = require('./poll.route')
const postviewRouter = require('./postview.route')
const chatgptRouter = require('./chatgpt.route')
const notificationRouter = require('./notification.route')

function routes(app) {
  app.use('/convention', conventionsRouter)
  app.use('/user', usersRouter)
  app.use('/friend', friendRouter )
  app.use('/resource', resourceRouter)
  app.use('/post', postRouter)
  app.use('/comment', commentRouter)
  app.use('/reaction', reactionRouter)
  app.use('/group', groupRouter)
  app.use('/search', searchRouter)
  app.use('/poll', pollRouter )
  app.use('/postview', postviewRouter)
  app.use('/chatgpt', chatgptRouter)
  app.use('/notification', notificationRouter)
  app.get('/home', (req, res) => res.send('This home'))
  app.get('/', (req, res) => res.json({ state: 'success' }))

}

module.exports = routes
