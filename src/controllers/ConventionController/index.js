const conventionModel = require('../../models/convention.model')
const UserController = require('../UserController')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const { type } = require('os')
const {
  MESSAGE_TYPE,
  MESSAGE_NOTIFY_TYPE,
  MESSAGE_ACTION,
  RESPONSE_STATUS,
  MEMBER_CONVENTION_STATUS,
  FOLDER_NAME,
  POST_ATTACHMENT,
  TYPE_SCREEN,
  NOTIFY_CONVENTION_STATUS,
  POLL_STATUS
} = require('../../utils/constants')
const { error } = require('console')
const helper = require('../../helper')
const { obj } = require('../../models/chatData.convention.model')
const { createNotifyData } = require('../../notify/fcmNotify')
const userModel = require('../../models/user.model')
const fcmNotify = require('../../notify/fcmNotify')
const pollModel = require('../../models/poll.model')
const SocketServer = require('../../socket')

const handleConventionChange = () => {
  conventionModel.watch().on('change', data => {})
}

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
      const customTitle = newData?.name?.trim() || senderInfo?.aka?.trim() || senderInfo.userName
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
      const customTitle = newData?.name?.trim() || senderInfo?.aka?.trim() || senderInfo.userName
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
    .then(newData => {
      SocketServer.instance.emitChangeConventionAvatar(conventionID, path)
    })
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
    .then(value => {
      SocketServer.instance.emitChangeConventionAka(conventionID,userID, newState)
    })
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

class ConventionController {
  helper = {
    handleGetConventionIDs
  }

  createConventionHistory = async (ownerID, userID) => {
    const ownerData = await UserController.helper.getUserDataById(ownerID)
    const userData = await UserController.helper.getUserDataById(userID)
    const newConvention = new conventionModel({
      avatar
    })
    conventionModel.create()
  }

  getConventionID(req, res) {
    const { ownerID, userID } = req.query

    conventionModel
      .findOne({ $or: [{ uids: [userID, ownerID] }, { uids: [ownerID, userID] }] })
      .then(data => {
        if (data) res.json(data._id)
        else res.json(null)
      })
      .catch(error => {
        console.log('error get convention id: ', error)
        res.status(500).json({ error })
      })
  }

  async getConventionIDs(req, res) {
    const { ownerID } = req.query
    await handleGetConventionIDs(ownerID).then(data => {
      if (data.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(data.data)
      } else {
        res.status(500).json('error')
      }
    })
  }

  getConventionByID = (req, res) => {
    const _id = req.params.id
    if (_id !== 'null') {
      conventionModel
        .findById(_id)
        .then(data => {
          console.log('get convention successfully')
          res.json(data)
        })
        .catch(error => {
          console.log('error when get convention by id: ', error)
          res.status(500).json({ error })
        })
    } else {
      res.status(200).json(null)
    }
  }

  getConvention = () => {}

  getConventions = (req, res) => {
    const { id } = req.params
    conventionModel
      .find({ uids: id })
      .sort({ updatedAt: 'desc' })
      .then(data => {
        res.json(data)
      })
      .catch(error => {
        console.log('error when get conventions: ', error)
        res.status(500).json({ error })
      })
  }

  storeGroupConvention = async (req, res) => {
    const data = req.body
    const objectId = new mongoose.Types.ObjectId()
    console.log('object id: ', objectId)
    const [relativePath, dirPath] = helper.getUploadFolderPath(
      __dirname,
      FOLDER_NAME.CONVENTIONS,
      objectId.toString()
    )
    console.log('dirpath: ', dirPath + FOLDER_NAME.IMAGE + '/')

    const relativeRawFilePath = '/uploads/static/groupchat.png'
    const staticRawFilePath = path.join(__dirname, '../../public/' + relativeRawFilePath)
    const fileName = Math.random().toString() + '.png'
    const customTailPath = FOLDER_NAME.IMAGE + '/' + fileName

    await fs.mkdir(dirPath + FOLDER_NAME.IMAGE + '/', { recursive: true }, error => {
      if (error) {
        console.log('Folder was existed ', error)
        return
      }
      console.log('create folder successfully')
      fs.copyFile(staticRawFilePath, dirPath + customTailPath, error => {
        if (error) {
          console.log('Lỗi khi copy file avatar group: ', error)
          return
        }
        console.log('copy avatar group successfully')
      })
    })

    conventionModel
      .create({
        _id: objectId,
        uids: data.uids,
        members: data.members,
        data: [data.message],
        type: data.type,
        name: data.name,
        avatar: relativePath + customTailPath
      })
      .then(data => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: data })
      //Send notification to members
      const lastChat = data.data[0]
      const senderData = data.members.at(-1)
      const newNotify = createNotifyData({
        targetID: data._id,
        title: 'Tin nhắn mới từ ' + senderData.userName,
        body: senderData.userName + ': ' + lastChat.message,
        senderID: senderData._id,
        senderName: senderData.userName,
        senderAvatar: senderData.avatar,
        channelID: data._id,
        type: TYPE_SCREEN.CONVENTION,

      })
      console.log('data before send notify when create convention: ', newNotify)
      data.members.forEach(item => {
         if( item._id !== senderData._id) {
          userModel.findById(item._id).then(response => {
            newNotify.ownerID = item._id
            console.log('create convention: send notify to: ', item.userName)
            fcmNotify.sendNotification(response.fcmToken, newNotify)
          })
         }
          
      })
      })
      .catch(error => {
        console.log('error when store group convention: ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: error })
      })
  }

  addMemberToGroup = async (req, res) => {
    const conventionID = req.params.conventionID
    const { uids, members, message } = req.body
    // console.log('data received in add member to group: ', req.body)
    console.log('MEMBERs: ', members)
    console.log('uids: ', uids)
    console.log('message: ', message)

    await conventionModel.updateOne(
      { _id: conventionID },
      {
        $pull: { members: { _id: { $in: uids } } }
      }
    )

    conventionModel
      .updateOne(
        { _id: conventionID },
        {
          $push: { members: { $each: members }, uids: { $each: uids }, data: message }
        },
        { returnDocument: 'after' }
      )
      .then(data => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: data })
      })
      .catch(error => {
        console.log('error when add member to group: ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: error })
      })
  }

  logOutGroup = async (req, res) => {
    const { conventionID, userID } = req.params
    const member = req.body
    console.log('into logout group: ', conventionID, ' ', userID)
    conventionModel
      .findByIdAndUpdate(conventionID, { $pull: { uids: userID } })
      .updateOne(
        { _id: conventionID, 'members._id': userID }, // Tìm tài liệu và đối tượng trong mảng
        { $set: { 'members.$.status': MEMBER_CONVENTION_STATUS.INACTIVE } } // Cập nhật thuộc tính
      )
      .then(data => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: data })
      })
      .catch(error => {
        console.log('error when logout group: ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: error })
      })
  }

  storeConvention = async (req, res) => {
    /* req.body: {
        senderID,
        userID,
        message,
        type
    }*/
    const { senderID, userID, message, type } = req.body
    const senderPromise = UserController.helper.getUserDataById(senderID)
    const userPromise = UserController.helper.getUserDataById(userID)
    Promise.all([senderPromise, userPromise]).then(data => {
      const [senderData, userData] = data
      const newConvention = new conventionModel({
        avatar: '',
        name: '',
        uids: [senderID, userID],
        members: [
          {
            _id: senderID,
            aka: null,
            userName: senderData.userName,
            avatar: senderData.avatar
          },
          {
            _id: userID,
            aka: null,
            userName: userData.userName,
            avatar: userData.avatar
          }
        ],
        data: [
          {
            senderID,
            message,
            type
          }
        ]
      })
      newConvention
        .save()
        .then(data => {
          res.json(data)
          //Send notification to members
          const newNotify = createNotifyData({
            targetID: data._id,
            title: 'Tin nhắn mới từ ' + senderData.userName,
            body: senderData.userName + ': ' + message,
            senderID: senderData._id,
            senderName: senderData.userName,
            senderAvatar: senderData.avatar,
            channelID: data._id,
            type: TYPE_SCREEN.CONVENTION,

          })
          console.log('data before send notify when create convention: ', newNotify)
          data.members.forEach(item => {
             if( item._id !== senderID) {
              userModel.findById(item._id).then(response => {
                newNotify.ownerID = item._id
                console.log('create convention: send notify to: ', item.userName)
                fcmNotify.sendNotification(response.fcmToken, newNotify)
              })
             }
              
          })
          
        })
        .catch(error => {
          console.log(error)
          res.status(500).json({ error })
        })
    })
  }

  handleWriteFile = (dirPath, filePath, fileData) => {
    fs.mkdir(dirPath, { recursive: true }, err => {
      if (err) {
        console.error('Lỗi khi tạo thư mục:', err.message)
        return
      }

      // Lưu file vào đường dẫn đã tạo
      fs.writeFileSync(filePath, fileData, err => {
        if (err) {
          console.error('Lỗi khi lưu file:', err.message)
        } else {
          console.log('File đã được lưu thành công tại:', filePath)
        }
      })
    })
  }

  updateMessage = async (req, res) => {
    const { conventionID, messageID } = req.params
    const { type, message } = req.body.data
    switch (type) {
      case MESSAGE_ACTION.EDIT:
      case MESSAGE_ACTION.REMOVE: {
        conventionModel
          .updateOne(
            { _id: conventionID, 'data._id': messageID },
            {
              $set: {
                'data.$.message': message
              }
            }
          )
          .then(data => {
            console.log('update message successfully: ')
            res.status(200).json(RESPONSE_STATUS.SUCCESS)
          })
          .catch(error => {
            console.log('error when update message: ', error)
            res.status(500).json({ error })
          })
        break
      }
      case MESSAGE_ACTION.DELETE: {
        conventionModel
          .updateOne(
            { _id: conventionID },
            {
              $pull: { data: { _id: messageID } }
            },
            {}
          )
          .then(data => {
            console.log('delete message successfully: ')
            res.status(200).json(RESPONSE_STATUS.SUCCESS)
          })
          .catch(error => {
            console.log('error when delete message: ', error)
            res.status(500).json({ error })
          })
        break
      }
      default: {
        console.log('update action failure: ')
        res.status(500).json(RESPONSE_STATUS.ERROR)
      }
    }
  }

  storeMessage = async (req, res) => {
    const data = req.body
    const { senderID, message } = data
    const conventionID = req.params.id
console.log('data into store message: ', data)
    if (data.type === MESSAGE_TYPE.TEXT ||data.type === MESSAGE_TYPE.POLL) {
      handleStoreTextMessage({ conventionID, data, res })
    } 
    else if (
      data.type === MESSAGE_TYPE.NOTIFY &&
      data?.notify?.type === MESSAGE_NOTIFY_TYPE.CHANGE_AKA
    ) {
      const customData = {
        senderID: data.senderID,
        type: data.type,
        message: data.customMessage
      }
      const { userID, newState } = req.body
      handleUpdateNickName({ conventionID, userID, newState })
      handleStoreTextMessage({ conventionID, data: customData, res })
    }
    else if (
      data.type === MESSAGE_TYPE.NOTIFY &&
      data?.notify?.type === MESSAGE_NOTIFY_TYPE.POLL
    ) {
      const customData = {
        senderID: data.senderID,
        type: data.type,
        message: data.customMessage
      }
    
      handleStoreTextMessage({ conventionID, data: customData, res })
    }

    else if (
      data.type === MESSAGE_TYPE.NOTIFY &&
      data?.notify?.type === MESSAGE_NOTIFY_TYPE.CHANGE_CONVENTION_NAME
    ) {
      const customData = {
        senderID: data.senderID,
        type: data.type,
        message: data.customMessage
      }
      await conventionModel
        .findByIdAndUpdate(conventionID, { name: data.notify.value })
        .then(response => {
          SocketServer.instance.emitChangeConventionName(conventionID, data.notify.value )

        })
      handleStoreTextMessage({ conventionID, data: customData, res })
    } else {
      const imagePath = []
      let fileNameType = ''
      let pathFolderType = ''
      switch (data.type) {
        case MESSAGE_TYPE.IMAGE:
          fileNameType = '.png'
          pathFolderType = 'image'
          break
        case MESSAGE_TYPE.VIDEO:
          fileNameType = '.mp4'
          pathFolderType = 'video'
          break
        case MESSAGE_TYPE.NOTIFY:
          fileNameType = '.png'
          pathFolderType = 'image'
          break
        default:
          fileNameType = '.png'
          pathFolderType = 'image'
          break
      }
      for (const item of message) {
        const fileName = Math.random().toFixed(10) + fileNameType
        const relativePath = `uploads/conventions/${conventionID}/${pathFolderType}/`
        const dirPath = path.join(__dirname, '../../public/' + relativePath)
        const uploadPath = dirPath + fileName
        imagePath.push(relativePath + fileName)

        // Xóa header Base64 (nếu có) và chuyển đổi thành Buffer
        const fileBuffer = Buffer.from(item, 'base64') // Chuyển base64 thành buffer

        // Lưu file bằng fs.writeFile
        this.handleWriteFile(dirPath, uploadPath, fileBuffer)
      }
      if (data.type === MESSAGE_TYPE.NOTIFY) {
        const customData = {
          senderID: data.senderID,
          type: data.type,
          message: data.customMessage,
          notify: {
            type: MESSAGE_NOTIFY_TYPE.CHANGE_AVATAR,
            value: imagePath.at(0)
          }
        }
        handleUpdateAvatarConvention({ conventionID, path: imagePath.at(0) })
        handleStoreUploadFileMessage({ conventionID, data: customData, res })
      } else {
        const customData = {
          senderID: data.senderID,
          type: data.type,
          message: imagePath.toString()
        }
        handleStoreUploadFileMessage({ conventionID, data: customData, res })
      }
    }
  }

  updateNotifySettings = async (req, res) => {
    const { userID, conventionID, status, upto } = req.body
    conventionModel
      .updateOne(
        { _id: conventionID, 'members._id': userID },
        {
          $set: {
            'members.$.notify': status,
            'members.$.upto': upto
          }
        }
      )
      .then(data => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: data })
      })
      .catch(error => {
        console.log('error when update notify convention : ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: error })
      })
  }


}
// handleConventionChange()
module.exports = new ConventionController()
