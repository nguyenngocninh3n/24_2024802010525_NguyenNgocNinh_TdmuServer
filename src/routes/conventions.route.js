

const express = require('express')
const ConventionController = require('../controllers/ConventionController')
const router = express.Router()

router.get('/conventionID', ConventionController.getConventionID)
router.post('/:conventionID/message/:messageID', ConventionController.updateMessage )

router.get('/conventionIDs', ConventionController.getConventionIDs)
router.get('/owner/:id', ConventionController.getConventions)
router.get('/:id', ConventionController.getConventionByID)
router.post('/store', ConventionController.storeConvention)

router.post('/group/store', ConventionController.storeGroupConvention)
router.post('/group/:conventionID/add', ConventionController.addMemberToGroup)
router.post('/group/:conventionID/logout/:userID', ConventionController.logOutGroup)

router.post('/:conventionID/notify', ConventionController.updateNotifySettings)
router.post('/:id', ConventionController.storeMessage)



module.exports = router
