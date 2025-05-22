const express = require('express')
const PostViewController = require('../controllers/PostViewController')
const router = express.Router()

router.post('/add/:userID/:postID', PostViewController.addPostview)
router.delete('/remove/:userID/:postID', PostViewController.removePostView)

module.exports = router