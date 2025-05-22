const notificationModel = require('../../models/notification.model')
const { NOTIFICATION_TYPE, RESPONSE_STATUS } = require('../../utils/constants')
const userHelper = require('../UserController/userHelper')

const getNotificationByUserID = async userID => {
  const response = await notificationModel
    .find({ userID })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('Error when get Notification by userID: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: error }
    })
  return response
}

const addNotification = async (userID, targetID, senderID, type, customMessage) => {
  const response = await notificationModel.findOne({ type, targetID }).then(data => data)
  const sender = await userHelper.getUserDataById(senderID)
  const senderName = sender.userName
  const notificationID = response?._id
  switch (type) {
    case NOTIFICATION_TYPE.COMMENT_REACTION: {
      if (!notificationID) {
        const message = `${sender.userName} đã thích bình luận của bạn`
        notificationModel.create({
          _id: type + targetID,
          userID,
          targetID,
          senderID,
          senderAvatar: sender.avatar,
          senderName: sender.userName,
          message: message,
          number: 1,
          uids: [senderID],
          type
        })
      } else {
        const customNumber = response.number > 1 ? ` và ${response.number - 1} người khác` : ''
        const message = `${sender.userName}${customNumber} đã thích bình luận của bạn`
        if (!response.uids.includes(senderID)) {
          notificationModel.findByIdAndUpdate(notificationID, {
            message: message,
            senderID: sender._id,
            senderName: sender.userName,
            senderAvatar: sender.avatar,
            $inc: { number: 1 },
            $push: {uids: userID}
          })
        } else {
            updateCommentReactionNotification(notificationID, userID, targetID, 1)
        }
      }
      break
    }
    case NOTIFICATION_TYPE.COMMENT_REPLY: {
      if (!notificationID) {
        const message = `${sender.userName} đã trả lời bình luận của bạn`
        notificationModel.create({
          _id: type + targetID,
          userID,
          targetID,
          senderID,
          senderAvatar: sender.avatar,
          senderName: sender.userName,
          message: message,
          number: 1
        })
      } else {
        const customNumber = response.number > 1 ? ` và ${response.number -1} người khác` : ''
        const message = `${sender.userName}${customNumber} đã trả lời bình luận của bạn`
        notificationModel.findByIdAndUpdate(notificationID, {
          message: message,
          senderID: sender._id,
          senderName: sender.userName,
          senderAvatar: sender.avatar,
          $inc: { number: 1 },
          $push: {uids: userID}
        })
      }
      break
    }
    case NOTIFICATION_TYPE.COMMENT_TAG: {
      break
    }
    case NOTIFICATION_TYPE.FRIEND_REQUEST: {
      if (notificationID) {
        const message = `${sender.userName} đã gửi yêu cầu kết bạn`
        notificationModel.create({
          _id: type + targetID,
          userID,
          targetID,
          senderID,
          senderAvatar: sender.avatar,
          senderName: sender.userName,
          message: message
        })
      } else {
        // KHÔNG CÓ TRƯỜNG HỢP ELSE
      }
      break
    }
    case NOTIFICATION_TYPE.FRIEND_ACCEPT: {
      if (notificationID) {
        const message = `${sender.userName} đã chấp nhận yêu cầu kết bạn`
        notificationModel.create({
          _id: type + targetID,
          userID,
          targetID,
          senderID,
          senderAvatar: sender.avatar,
          senderName: sender.userName,
          message: message
        })
      } else {
        // KHÔNG CÓ TRƯỜNG HỢP ELSE
      }
      break
    }
    case NOTIFICATION_TYPE.GROUP_REQUEST: {
      if (response) {
      } else {
      }
      break
    }
    case NOTIFICATION_TYPE.GROUP_ACCEPT: {
      if (response) {
      } else {
      }
      break
    }
    case NOTIFICATION_TYPE.POST_REACTION: {
      console.log('into notification - post reaction')
      if (!notificationID) {
        console.log('create new notification')
        const message = `${sender.userName} đã thích bài viết của bạn`
        notificationModel.create({
          _id: type + targetID,
          userID,
          targetID,
          senderID,
          senderAvatar: sender.avatar,
          senderName: sender.userName,
          message: message,
          number: 1,
          uids: [senderID],
          type
        })
      } else {
        const customNumber = response.number > 0 ? ` và ${response.number} người khác` : ''
        const message = `${sender.userName}${customNumber} đã thích bài viết của bạn`
        if (!response.uids.includes(senderID)) {
          console.log(`having notification:  don't react before`)
          await notificationModel.findByIdAndUpdate(notificationID, {
            message: message,
            senderID: sender._id,
            senderName: sender.userName,
            senderAvatar: sender.avatar,
            $inc: { number: 1 },
            $push: { uids: senderID }
          })
        } else {
          console.log(`having notification:  reacted before`)
          updatePostReactionNotification(type, targetID, 1)
        }
      }
      break
    }
    case NOTIFICATION_TYPE.POST_COMMENT: {
      console.log('into notification - post-comment: ', notificationID)
      if (!notificationID) {
        console.log('create new notification')
        notificationModel.create({
          _id: type + targetID,
          userID,
          targetID,
          senderID,
          senderAvatar: sender.avatar,
          senderName: sender.userName,
          message: customMessage,
          number: 0,
          uids: [senderID],
          type
        })
      } else {
        if (!response.uids.includes(senderID)) {
          console.log(`having notification: don't commented before`)
          await notificationModel.findByIdAndUpdate(notificationID, {
            message: customMessage,
            senderID: sender._id,
            senderName: sender.userName,
            senderAvatar: sender.avatar,
            $inc: { number: 1 },
            $push: { uids: senderID }
          })
         }else {
          console.log(`having notification:  commented before`)
          await notificationModel.findByIdAndUpdate(notificationID, {
            message: customMessage,
            senderID: sender._id,
            senderName: sender.userName,
            senderAvatar: sender.avatar,
          })
        }
      }
      break
    }
    case NOTIFICATION_TYPE.POST_TAG: {
      // CHƯA CÓ
    }
    default:
      throw new Error('Notification Type is invalid')
  }
}

const updatePostReactionNotification = async ( type, targetID, number) => {
  console.log('update post reaction notification number: ', number)
  return await notificationModel
    .findOneAndUpdate({ type, targetID }, { $inc: { number: number } })
    .then(data => data)
}

const updateCommentReactionNotification = async (type, targetID, number) => {
  return await notificationModel
    .findOneAndUpdate({ type, targetID }, { $inc: { number: number } })
    .then(data => data)
}

const checkNotification = async _id => {
  return await notificationModel
    .findByIdAndUpdate(_id)
    .then(response => {
      return { status: RESPONSE_STATUS.SUCCESS, data: true }
    })
    .catch(error => {
      console.log('Error when check All notification: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
}

const checkAllNotification = async userID => {
  return await notificationModel
    .findOneAndUpdate(
      { userID },
      {
        status: true
      }
    )
    .then(response => {
      return { status: RESPONSE_STATUS.SUCCESS, data: true }
    })
    .catch(error => {
      console.log('Error when check All notification: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
}

const notificationHelper = {
  getNotificationByUserID,
  addNotification,
  checkNotification,
  checkAllNotification,
  updatePostReactionNotification,
  updateCommentReactionNotification
}

module.exports = notificationHelper
