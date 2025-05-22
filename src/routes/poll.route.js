const express = require('express')
const PollController = require('../controllers/PollController')
const router = express.Router()


router.get('/:pollID', PollController.getPoll )
router.post('/create', PollController.createPoll)
router.post('/:pollID/close', PollController.closePoll)
router.post('/:pollID/option/add', PollController.updateOption)
router.post('/:pollID/polling/add', PollController.addPolling)
router.post('/:pollID/polling/update', PollController.updatePolling)


module.exports = router