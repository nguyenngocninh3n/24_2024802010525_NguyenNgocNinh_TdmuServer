const express = require('express')
const ReactionController = require('../controllers/ReactionController')
const router = express.Router()

router.get('/:targetID', ReactionController.getReactionsByTargetID)
router.get('/:targetID/:userID', ReactionController.getReactionOfUserByTargetID)
router.post('/update', ReactionController.updateReactionOfUserByTargetID)

module.exports = router
