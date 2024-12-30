const { Socket } = require('socket.io')
const commentModel = require('../../models/comment.model')
const groupModel = require('../../models/group.model')
const postModel = require('../../models/post.model')
const userModel = require('../../models/user.model')
const fcmNotify = require('../../notify/fcmNotify')
const SocketServer = require('../../socket')
const { RESPONSE_STATUS, TYPE_SCREEN, NOTIFICATION_TYPE } = require('../../utils/constants')
const notificationHelper = require('../NotificationController/notificationHelper')

class CommentController {
  async handleGetComments(req, res) {
    const postID = req.params.postID
    commentModel
      .find({ postID: postID })
      .sort({ createdAt: 'asc' })
      .then(data => {
        res.status(200).json(data)
      })
      .catch(error => {
        console.log('Error when get post comments: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }

  async handleStoreComment(req, res) {
    const newComment = req.body
    commentModel
      .create(newComment)
      .then(async data => {
        res.status(200).json(data)
        SocketServer.instance.emitAddComment(data.postID, data)
        console.log('recieve data comment: ', newComment)
        if(newComment?.rootParentID) {
          await commentModel.findByIdAndUpdate(newComment.rootParentID, {$inc: {commentChildCount: 1}})
        } 
        const post = await postModel.findByIdAndUpdate(data.postID, {$inc: {commentsCount: 1}}, {returnDocument:'after'}).then(response => {
        SocketServer.instance.emitCommentPostChange(response._id, response)
        return response
        })
        if (data.userID !== post.userID) {
          const parentComment = data.parentID ? await commentModel.findById(data.parentID) : null
          const postOwner = await userModel.findById(post.userID)
          const group = post.groupID ? await groupModel.findById(post.groupID) : null

          if (parentComment) {
            const parentCommentOwner = await userModel.findById(parentComment.userID)
            const preMessage =
              parentCommentOwner._id === postOwner._id  ? 'bạn' : parentCommentOwner._id === data.userID
                ? 'chính họ' : parentCommentOwner.userName
            const midMessage =
                data.userID === postOwner._id 
                ? 'chính họ'
                : parentCommentOwner._id === postOwner._id || parentCommentOwner._id === data.userID
                ? 'bạn'
                : postOwner.userName
            const customMessage = group ? ' trong nhóm ' + group.name : ''
            const bodyMessage = `${data.userName} đã trả lời bình luận của ${preMessage} về  bài viết của ${midMessage} ${customMessage} `
            const customData = fcmNotify.createNotifyData({
              channelID: data.postID + 'COMMENT',
              senderID: data.userID,
              senderName: data.userName,
              senderAvatar: data.avatar,
              body: bodyMessage,
              title: 'Bình luận mới!',
              type: TYPE_SCREEN.POST
            })
            console.log('customData: ', customData)
            const targetToken =
              data.userID === parentComment.userID
                ? postOwner.fcmToken
                : parentCommentOwner.fcmToken
            fcmNotify.sendNotification(targetToken, customData)
            notificationHelper.addNotification(postOwner._id, newComment.postID,newComment.userID, NOTIFICATION_TYPE.POST_COMMENT, bodyMessage)
          } else if (!parentComment || parentComment.userID !== postOwner._id) {
            const customMessage = group ? 'trong nhóm ' + group.name : ''
            const customData = fcmNotify.createNotifyData({
              channelID: data.postID + 'COMMENT',
              senderID: data.userID,
              senderName: data.userName,
              senderAvatar: data.avatar,
              body: `${data.userName} đã bình luận về bài viết của bạn ${customMessage}`,
              title: 'Bình luận mới!',
              type: TYPE_SCREEN.POST
            })
            fcmNotify.sendNotification(postOwner.fcmToken, customData)
            notificationHelper.addNotification(postOwner._id, newComment.postID,newComment.userID, NOTIFICATION_TYPE.POST_COMMENT, `${data.userName} đã bình luận về bài viết của bạn ${customMessage}`)
          }
        }
      })
      .catch(error => {
        console.log('Error when store comment: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }

  async handleUpdateComment(req, res) {
    const commentID = req.params.id
    console.log('update comment: ', commentID, ' ', req.body.value)
    commentModel
      .findByIdAndUpdate(commentID, { content: req.body.value }, {returnDocument:'after'})
      .then( data => {
        res.status(200).json(RESPONSE_STATUS.SUCCESS)
        SocketServer.instance.emitEditComment(data.postID, data)
      })
      .catch(error => {
        console.log('Error when edit comment: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }

  async handleDeleteComment(req, res) {
    const commentID = req.params.id
    commentModel
      .findByIdAndDelete(commentID)
      .then(async data => {
        res.status(200).json(RESPONSE_STATUS.SUCCESS)
        
        if(data.rootParentID) {
          await commentModel.findByIdAndUpdate(data.rootParentID, {$inc: {commentChildCount: -1}})
        }
        SocketServer.instance.emitDeleteComment(data.postID, commentID)
        await postModel.findByIdAndUpdate(data.postID, {$inc: {commentsCount: -1}}, {returnDocument:'after'}).then(response => {
          SocketServer.instance.emitCommentPostChange(response._id, response)

        })

      })
      .catch(error => {
        console.log('Error when delete comment: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }

  async handleReactComment(req, res) {
    const commentID = req.params.id
    const userID = req.body.userID
    commentModel
      .findById(commentID)
      .then(data => {
        const reactions = data.reactions
        const newReactions = reactions.filter(item => item !== userID)
        const isExist = newReactions.length < reactions.length
        if (isExist) {
          commentModel
            .findByIdAndUpdate(commentID, { reactions: newReactions }, { returnDocument: 'after' })
            .then(data => SocketServer.instance.emitReactionComment(data.postID, commentID,data.reactions))
        } else {
          commentModel
            .findByIdAndUpdate(
              commentID,
              { reactions: [...reactions, userID] },
              { returnDocument: 'after' }
            )
            .then(data => SocketServer.instance.emitReactionComment(data.postID, commentID,data.reactions))
        }
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: !isExist })
      })
      .catch(error => {
        console.log('Error when react comment: ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: 'ERROR' })
      })
  }
}

module.exports = new CommentController()
