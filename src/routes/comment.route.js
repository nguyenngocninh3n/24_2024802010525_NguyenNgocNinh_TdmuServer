const express = require('express')
const CommentController = require('../controllers/CommentController')
const router = express.Router()

router.get('/post/:postID', CommentController.handleGetComments)
router.post('/store', CommentController.handleStoreComment)
router.put('/:id/react', CommentController.handleReactComment)

router.put('/:id/update', CommentController.handleUpdateComment)
router.delete('/:id/delete', CommentController.handleDeleteComment)

module.exports = router