const { log, getUploadFileAndFolderPath, storeFile, storeMultiFile } = require('../../helper')
const userModel = require('../../models/user.model')
const { FOLDER_NAME, POST_ATTACHMENT, RESPONSE_STATUS } = require('../../utils/constants')
const fs = require('fs')
const https = require('https')
const FriendController = require('../FriendController')
const friendModel = require('../../models/friend.model')
const groupHelper = require('../GroupController/groupHelper')
const helper = require('../../helper')
const friendSuggestModel = require('../../models/friend.suggest.model')
const SocketServer = require('../../socket')
const userHelper = require('./userHelper')
const convertDataToUser = data => {
  const newUser = {
    _id: data.id ?? data._id,
    userName: data.name,
    searchName: helper.removeVietnameseTones(data?.name ?? ''),
    email: data.email,
    phone: null,
    avatar: data.photo,
    followerNum: 0,
    followingNum: 0,
    sex: null,
    age: null,
    fcmToken: data.fcmToken
  }
  return new userModel(newUser)
}

async function getUserDataById(uid) {
  return await userModel.findById(uid)
}

async function handleActiveUser(userID) {
  return userModel.findByIdAndUpdate(userID, { active: true })
}
async function handleInActiveUser(userID) {
  return userModel.findByIdAndUpdate(userID, { active: false })
}

async function addUser(data) {
  const convertData = convertDataToUser(data)
  const newUser = await userModel
    .create(convertData)
    .then(newUser => {
      return newUser
    })
    .catch(error => log({ error }))
  return newUser
}

class userController {
  helper = {
    getUserDataById: getUserDataById,
    handleActiveUser,
    handleInActiveUser
  }

  async getUser(req, res) {
    const idUser = req.params.id
    getUserDataById(idUser)
      .then(data => {
        res.status(200).json(data)
      })
      .catch(error => res.status(500).json({ error }))
  }
  async getAllUser(req, res) {
    userModel
      .find({})
      .then(data => {
        res.status(200).json(data)
      })
      .catch(error => res.status(500).json({ error }))
  }

  // async createUser(req, res) {
  //   console.log(req.body)
  // }

  async createUser(req, res) {
    console.log('start create user: ', req.body?._id)
    const userData = convertDataToUser(req.body)
    let newUser = await getUserDataById(userData?._id)
    if (newUser) {
      console.log('update fcmToken: ', req.body.fcmToken)
      const updateUser = await userModel
        .findByIdAndUpdate(
          newUser._id,
          { fcmToken: req.body.fcmToken },
          { returnDocument: 'after' }
        )
        
      res.json(updateUser)
    } else {
      const clientData = req.body
      const [relativeFilePaths, staticFilePaths, dirPath] = getUploadFileAndFolderPath(
        __dirname,
        FOLDER_NAME.USERS,
        userData._id,
        [{ type: POST_ATTACHMENT.IMAGE }]
      )
      fs.mkdir(dirPath + relativeFilePaths.at(0).type, { recursive: true }, err => {
        if (err) {
          console.error('Lỗi khi tạo thư mục:', err.message)
          return
        }
      })
      const customData = convertDataToUser({
        ...clientData,
        photo: relativeFilePaths.at(0).source
      })
      console.log('customDAta: ', customData)
      https
        .get(clientData.photo, response => {
          const fileStream = fs.createWriteStream(staticFilePaths.at(0))
          response.pipe(fileStream)

          // Xử lý sự kiện hoàn tất
          fileStream.on('finish', () => {
            fileStream.close()
            console.log('Image downloaded successfully!')
          })

          // Xử lý lỗi
          fileStream.on('error', err => {
            console.error('Error writing to file:', err)
          })
        })
        .on('error', err => {
          console.error('Error fetching URL:', err)
        })
      const newUser = await userModel.create(customData)
      console.log({newUser})
      const newFriend = new friendModel({
        _id: newUser.id,
        data: []
      })
      newFriend.save()
      friendSuggestModel.create({
        _id: newUser.id,
        suggested: []
      })
      groupHelper.createGroupUser(newUser.id)
      res.status(200).json(newUser)
    }
  }

  async activeUser(req, res) {
    const userID = req.params.id
    handleActiveUser(userID)
      .then(data => {
        res.status(200).json({ _id: userID, active: true })
      })
      .catch(error => {
        console.log('Lỗi khi active user: ', error)
        res.status(500).json({ error })
      })
  }

  async inActiveUser(req, res) {
    const userID = req.params.id
    handleInActiveUser(userID)
      .then(data => {
        res.status(200).json({ _id: userID, active: false })
      })
      .catch(error => {
        console.log('Lỗi khi in active user: ', error)
        res.status(500).json({ error })
      })
  }

  async conventionUserInfor(req, res) {
    const userID = req.params.id
    userModel
      .findById(userID)
      .then(data => {
        if (data) {
          const { _id, userName, avatar, active, updatedAt } = data
          const customData = { _id, userName, avatar, active, updatedAt }
          res.json(customData)
        } else {
          res.status(200).json(null)
        }
      })
      .catch(error => {
        console.log('Lỗi khi in get convention user infor: ', error)
        res.status(500).json({ error })
      })
  }

  async handleUpdateBio(req, res) {
    const userID = req.params.id
    userModel
      .findByIdAndUpdate(userID, { bio: req.body.value }, { returnDocument: 'after' })
      .then(data => {
        res.status(200).json(RESPONSE_STATUS.SUCCESS)
        SocketServer.instance.emitBioProfileChange(userID, data.bio)
      })
      .catch(error => {
        console.log('error when update bio: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }

  async handleUpdateAvatar(req, res) {
    const userID = req.params.id
    const { current, avatar } = req.body
    const [relativeFilePaths, staticFilePaths, dirPath] = helper.getUploadFileAndFolderPath(
      __dirname,
      FOLDER_NAME.USERS,
      userID,
      [{ type: POST_ATTACHMENT.IMAGE }]
    )

    helper.storeMultiFile(staticFilePaths, dirPath, [
      { type: POST_ATTACHMENT.IMAGE, source: avatar }
    ])
    helper.deleteFileFromRelativeFilePath(current)
    await userHelper.updateUserAvatarRelationship(userID, relativeFilePaths[0].source)
    userModel
      .findByIdAndUpdate(
        userID,
        { avatar: relativeFilePaths[0].source },
        { returnDocument: 'after' }
      )
      .then(data => {
        console.log('update avatar successfully: ', relativeFilePaths[0].source)
        res.status(200).json(RESPONSE_STATUS.SUCCESS)
        SocketServer.instance.emitAvatarProfileChange(userID, data.avatar)
      })
      .catch(error => {
        console.log('error when update avatar: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }

  async handleUpdateBackground(req, res) {
    const userID = req.params.id
    const { current, avatar } = req.body
    const [relativeFilePaths, staticFilePaths, dirPath] = helper.getUploadFileAndFolderPath(
      __dirname,
      FOLDER_NAME.USERS,
      userID,
      [{ type: POST_ATTACHMENT.IMAGE }]
    )

    helper.storeMultiFile(staticFilePaths, dirPath, [
      { type: POST_ATTACHMENT.IMAGE, source: avatar }
    ])
    helper.deleteFileFromRelativeFilePath(current)
    userModel
      .findByIdAndUpdate(
        userID,
        { background: relativeFilePaths[0].source },
        { returnDocument: 'after' }
      )
      .then(data => {
        console.log('update background successfully: ', relativeFilePaths[0].source)
        res.status(200).json(RESPONSE_STATUS.SUCCESS)
        SocketServer.instance.emitBackgroundProfileChange(userID, data.background)
      })
      .catch(error => {
        console.log('error when update avatar: ', error)
        res.status(500).json(RESPONSE_STATUS.ERROR)
      })
  }
}

module.exports = new userController()
