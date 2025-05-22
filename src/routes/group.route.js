const express = require('express')
const GroupController = require('../controllers/GroupController')
const router = express.Router()

router.get('/all', GroupController.handleGetAllgroup)
router.get('/user/:userID', GroupController.handleGetGroupsByUserID)
router.get('/:groupID/post/member/:userID', GroupController.handleGetGroupPostsOfUser)
router.get('/:groupID/post', GroupController.handleGetGroupPostsOfGroup)
router.get('/:groupID/member/pending', GroupController.handleGetPendingGroupMembersByID)
router.get('/:groupID/member/blocking', GroupController.handleGetBlockingGroupMembersByID)
router.get('/:groupID/member/:userID', GroupController.handleGetGroupMemberByUserID)
router.get('/:groupID/member', GroupController.handleGetGroupMembersByID)
router.get('/:groupID', GroupController.handleGetgroupByID)
// getGoupImagesByID
//getGroupVideosByID

router.post('/:groupID/member/:userID/join', GroupController.handleRequestJoinGroup)
router.post('/:groupID/member/:userID/cancel', GroupController.handleCancelRequestJoinGroup)
router.post('/:groupID/member/:userID/accept', GroupController.handleAcceptMember)
router.post('/:groupID/member/:userID/block', GroupController.handleBlockMember)
router.post('/:groupID/member/:userID/unblock', GroupController.handleUnBlockMember)
router.delete('/:groupID/member/:userID/exit', GroupController.handleExitGroup)
router.delete('/:groupID/member/:userID/delete', GroupController.handleDeleteMember)

router.post('/create', GroupController.handleCreateGroup)
router.put('/:groupID/update/name', GroupController.handleUpdateGroupName)
router.put('/:groupID/update/avatar', GroupController.handleUpdateGroupAvatar)
router.put('/:groupID/update/bio', GroupController.handleUpdateGroupBio)

module.exports = router