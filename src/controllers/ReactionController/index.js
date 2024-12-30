const postModel = require('../../models/post.model')
const reactionModel = require('../../models/reaction.model')
const fcmNotify = require('../../notify/fcmNotify')
const SocketServer = require('../../socket')
const { RESPONSE_STATUS, REACTION_TYPE, TYPE_SCREEN, NOTIFICATION_TYPE } = require('../../utils/constants')
const notificationHelper = require('../NotificationController/notificationHelper')
const userHelper = require('../UserController/userHelper')

class ReactionController {
  async getReactionsByTargetID(req, res) {
    const { targetID } = req.params
    reactionModel
      .find({ targetID })
      .then(data => {
        res.status(200).json({status:RESPONSE_STATUS.SUCCESS, data: data})
      })
      .catch(error => {
        console.log('Error when get reactions by target id: ', error)
        res.status(500).json({status: RESPONSE_STATUS.ERROR, data: error})
      })
  }

  a

  async getReactionOfUserByTargetID(req, res) {
    const { targetID, userID } = req.params
    console.log('into get reaction of user by targetID: ', targetID, ' ', userID)
    reactionModel
      .findOne({ targetID, userID })
      .then(data => {
        res.status(200).json(data)
      })
      .catch(error => {
        console.log('Error when get reaction of user by target id: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }

  async updateReactionOfUserByTargetID(req, res) {
    const { targetID, userID, userName, avatar, status } = req.body
    const type = req.body?.type ?? REACTION_TYPE.POST
    console.log('into update reaction: ', targetID)
    reactionModel
      .findOne({ targetID, userID })
      .then(data => {
        if (data) {
          data
            .updateOne({ status: !status }, { returnDocument: 'before' })
            .then(data => {
                res.status(200).json({ ...data, status: !status })
                if (type === REACTION_TYPE.POST && !status) {
                  console.log('like post')
                  
                    postModel.findByIdAndUpdate(targetID, {$inc: {reactionsCount: 1}}, {returnDocument: 'after'}).then(response => {
                      SocketServer.instance.emitReactionPostChange(targetID, response)
                      if (response.userID !== userID) {
                        userHelper.getUserDataById(response.userID).then( userInfo => {
                            const data = fcmNotify.createNotifyData({
                                channelID: targetID + 'REACTION',
                                senderID: userID,
                                senderName: userName,
                                senderAvatar: avatar,
                                body: `${userName} đã thích bài viết của bạn`,
                                title: 'Một lượt thích mới!',
                                type: TYPE_SCREEN.POST,
                                ownerID: response.userID,
                                targetID: targetID
                              })
                              fcmNotify.sendNotification(userInfo.fcmToken, data)
                        })
                      }
                      notificationHelper.addNotification(response.userID, targetID, userID, NOTIFICATION_TYPE.POST_REACTION)
                    })
                  } else if(type === REACTION_TYPE.POST && status) {
                    console.log('unlike post')
                    postModel.findByIdAndUpdate(targetID, {$inc: {reactionsCount: -1}}, {returnDocument: 'after'}).then(response => {
                      SocketServer.instance.emitReactionPostChange(targetID, response)
                      notificationHelper.updatePostReactionNotification(NOTIFICATION_TYPE.POST_REACTION, targetID, -1)
                    })
                  }
        })
        } else {
          console.log('not having: create')
          reactionModel
            .create({
              targetID,
              userID,
              userName,
              avatar,
              status: true,
              type: type ?? REACTION_TYPE.POST
            })
            .then(data => {
              res.status(200).json(data)
              SocketServer.instance.emitReactionPostChange(data._id, data)
              if (data.type === REACTION_TYPE.POST) {
                postModel.findByIdAndUpdate(targetID, {$inc: {reactionsCount: 1}}, {returnDocument: 'after'}).then(response => {
                    if (response.userID !== userID) {
                        userHelper.getUserDataById(response.userID).then( userInfo => {
                            const data = fcmNotify.createNotifyData({
                                channelID: targetID + 'REACTION',
                                senderID: userID,
                                senderName: userName,
                                senderAvatar: avatar,
                                body: `${userName} đã thích bài viết của bạn`,
                                title: 'Một lượt thích mới!',
                                type: TYPE_SCREEN.POST
                              })
                              fcmNotify.sendNotification(userInfo.fcmToken, data)
                        })
                        notificationHelper.addNotification(response.userID, response._id,userID, NOTIFICATION_TYPE.POST_REACTION )

                      }
                })
              }
            })
        }
      })
      .catch(error => {
        console.log('Error when update reaction of user by target id: ', error)
        res.status(200).json(RESPONSE_STATUS.ERROR)
      })
  }
}

module.exports = new ReactionController()