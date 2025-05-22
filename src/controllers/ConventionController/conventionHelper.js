const conventionModel = require("../../models/convention.model")
const userModel = require("../../models/user.model")
const fcmNotify = require("../../notify/fcmNotify")
const { createNotifyData } = require("../../notify/fcmNotify")
const { RESPONSE_STATUS } = require("../../utils/constants")

const handleStoreTextMessage = ({ conventionID, data, res }) => {
    conventionModel
      .findByIdAndUpdate(
        conventionID,
        {
          $push: { data: { ...data } }
        },
        {
          returnDocument: 'after'
        }
      )
      .then(newData => {
        res.json(newData.data.at(-1))
        const senderInfo = newData.members.find(item => item._id === data.senderID)
        const customTitle = newData.name.trim() || senderInfo.aka.trim() || senderInfo.userName
        const customName = senderInfo.aka || senderInfo.userName
        
        // NOTIFICATION
        const newNotify = createNotifyData({
          targetID: conventionID,
          title: 'Tin nhắn mới từ ' + customTitle,
          body: customName + ': ' + data.message,
          senderID: senderInfo._id,
          senderName: customName,
          channelID: conventionID,
          type: TYPE_SCREEN.CONVENTION
        })
        newData.members.forEach(item => {
          const checkAllowNotify =
            item.notify === NOTIFY_CONVENTION_STATUS.ALLOW ||
            (item.notify === NOTIFY_CONVENTION_STATUS.CUSTOM && Date.now() > Date.parse(item.upto))
          console.log('check allow notify: ', item._id, ' ', checkAllowNotify)
          if (checkAllowNotify && item._id !== data.senderID) {
            console.log('notify to: ', item.userName)
            userModel.findById(item._id).then(response => {
              newNotify.ownerID = item._id
              newNotify.senderAvatar = response.avatar
              fcmNotify.sendNotification(response.fcmToken, newNotify)
            })
          }
        })
  
  
        // POLL
      })
      .catch(error => {
        console.log('error when store text message: ', error)
        res.json({ error })
      })
  }
  
  const handleStoreUploadFileMessage = ({ conventionID, data, res }) => {
    conventionModel
      .findByIdAndUpdate(
        conventionID,
        {
          $push: { data: { senderID: data.senderID, type: data.type, message: data.message } }
        },
        {
          returnDocument: 'after'
        }
      )
      .then(newData => {
        const { senderID, _id, userName, type, message, createdAt, updatedAt } = newData.data.at(-1)
        res.status(200).json({
          senderID,
          _id,
          userName,
          message,
          createdAt,
          updatedAt,
          type,
          notify: data?.notify
        })
  
        const senderInfo = newData.members.find(item => item._id === data.senderID)
        const customTitle = newData.name.trim() || senderInfo.aka.trim() || senderInfo.userName
        const customName = senderInfo.aka || senderInfo.userName
        console.log('customName: ', customName)
  
        const customType = newData.data.at(-1).type === 'IMAGE' ? ' hình ảnh' : ' video'
        const newNotify = createNotifyData({
          targetID: conventionID,
          title: 'Tin nhắn mới từ ' + customTitle,
          body:
            customName +
            ': ' +
            'Đã gửi ' +
            newData.data.at(-1).message.split(',').length +
            customType,
          senderName: customName,
          senderID: data.senderID,
          senderAvatar: senderInfo.avatar,
          channelID: conventionID,
          type: TYPE_SCREEN.CONVENTION
        })
        newData.members.forEach(item => {
          const checkAllowNotify =
            item.notify === NOTIFY_CONVENTION_STATUS.ALLOW ||
            (item.notify === NOTIFY_CONVENTION_STATUS.CUSTOM && Date.now() > Date.parse(item.upto))
          checkAllowNotify &&
            item._id !== data.senderID &&
            userModel.findById(item._id).then(response => {
              newNotify.ownerID = item._id
              fcmNotify.sendNotification(response.fcmToken, newNotify)
            })
        })
      })
  
      .catch(error => {
        console.log('error when store notify message: ', error)
        res.json({ error })
      })
  }
  
  const handleUpdateAvatarConvention = ({ conventionID, path }) => {
    conventionModel
      .findByIdAndUpdate(conventionID, {
        avatar: path
      })
      .then(newData => {})
      .catch(error => {
        console.log('error when update avatar convention: ', error)
      })
  }
  
  const handleUpdateNickName = ({ conventionID, userID, newState }) => {
    conventionModel
      .updateOne(
        { _id: conventionID, 'members._id': userID },
        {
          $set: {
            'members.$.aka': newState
          }
        }
      )
      .then(value => console.log('update biệt danh thành công'))
      .catch(error => {
        console.log('error when update avatar convention: ', error)
      })
  }

  const handleGetConventionIDs = async ownerID => {
    return await conventionModel
      .find({ uids: ownerID })
      .then(data => {
        if (data) {
          const uids = data.map(item => item._id.toString())
          const customData = { data: uids, status: RESPONSE_STATUS.SUCCESS }
          return customData
        } else {
          const customData = { data: [], status: RESPONSE_STATUS.SUCCESS }
          return customData
        }
      })
      .catch(error => {
        console.log('error get convention ids: ', error)
        return { data: [], status: RESPONSE_STATUS.ERROR }
      })
  }
  
  
const conventionHelper = {
    handleStoreTextMessage,
    handleStoreUploadFileMessage,
    handleUpdateAvatarConvention,
    handleUpdateNickName,
    handleGetConventionIDs
}
module.exports = conventionHelper