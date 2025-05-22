const { response } = require('express')
const friendModel = require('../../models/friend.model')
const { FRIEND_STATUS, RESPONSE_STATUS, TYPE_SCREEN } = require('../../utils/constants')
const UserController = require('../UserController')
const userHelper = require('../UserController/userHelper')
const {} = require('../../notify/fcmNotify')
const fcmNotify = require('../../notify/fcmNotify')
const friendHelper = require('./friendHelper')

const helper = {
  createFriend: async (ownerID, userID, status) => {
    const userData = await UserController.helper.getUserDataById(userID)
    const newFriend = new friendModel({
      _id: ownerID,
      data: [
        {
          _id: userID,
          userName: userData.userName,
          avatar: userData.avatar,
          status: status
        }
      ]
    })
    return await newFriend.save()
  },

  initFriend: async ownerID => {
    const newFriend = new friendModel({
      _id: ownerID,
      data: []
    })
    return await newFriend.save()
  },

  addFriend: async (ownerData, userData, status, notify) => {
    const newData = {
      _id: userData._id,
      avatar: userData.avatar,
      userName: userData.userName,
      status
    }
    return await friendModel
      .findByIdAndUpdate(
        ownerData._id,
        {
          $push: {
            data: newData
          }
        },
        {
          returnDocument: 'after'
        }
      )
      .then(response => {
        if (notify) {
          const data = fcmNotify.createNotifyData({
            channelID: userData._id + ownerData._id + 'FRIEND',
            senderID: ownerData._id,
            senderName: ownerData.userName,
            senderAvatar: ownerData.avatar,
            body: `${ownerData.userName} đã gửi lời mời kết bạn`,
            title: 'Yêu cầu kết bạn!',
            type: TYPE_SCREEN.FRIEND
          })
          fcmNotify.sendNotification(userData.fcmToken, data)
        }
        return response
      })
  },
  acceptFriend: async (ownerData, userData, status, notify) => {
    friendModel
      .updateOne(
        { _id: ownerData._id, 'data._id': userData._id },
        {
          $set: {
            'data.$.status': status
          }
        }
      )
      .then(data => {
        if(notify) {
          const data = fcmNotify.createNotifyData({
            channelID: userData._id + ownerData._id + 'FRIEND',
            senderID: ownerData._id,
            senderName: ownerData.userName,
            senderAvatar: ownerData.avatar,
            body: `${ownerData.userName} đã chấp nhận lời mời kết bạn`,
            title: 'Kết bạn thành công!',
            type: TYPE_SCREEN.FRIEND
          })
          fcmNotify.sendNotification(userData.fcmToken, data)
        }
        console.log('accept friend successfully: ', data)
      })
  },

  refuseFriend: async (ownerID, userID) => {
    console.log('refuse Friend id: ', ownerID, ' ', userID)
    friendModel
      .updateOne(
        { _id: ownerID },
        {
          $pull: {
            data: {
              _id: userID
            }
          }
        }
      )
      .then(status => console.log('result after refuse friend: ', status))
  },

  handleGetListFriend: async userID => {
    return await friendModel
      .findById(userID)
      .then(data => {
        if (data) {
          const customData = data.data.filter(item => item.status === FRIEND_STATUS.FRIEND)
          customData.sort((a, b) => {
            const itemA = a.userName.trim().split(' ')
            const itemB = b.userName.trim().split(' ')
            const result = itemA.at(itemA.length - 1).localeCompare(itemB.at(itemB.length - 1))
            return result
          })
          return { data: customData, status: RESPONSE_STATUS.SUCCESS }
        } else {
          return { data: [], status: RESPONSE_STATUS.SUCCESS }
        }
      })
      .catch(error => {
        console.log('error when get list friend: ', error)
        return { data: [], status: RESPONSE_STATUS.ERROR }
      })
  }
}
class FriendController {
  helpers = {
    ...helper
  }

  async getListFriend(req, res) {
    const userID = req.params.id
    console.log('inner getListFriend: ', 'data: ', req.params)
    await helper.handleGetListFriend(userID).then(data => {
      if(data.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(data)
      }
      else {
        res.status(500).json({ error })
      }
    })
  }

  getStatusFriend(req, res) {
    const  {ownerID, userID} = req.query
    console.log('inner getStatus friend: ', 'data: ', ownerID, ' u ', userID)
    friendModel.findById(ownerID).then(data => {
        const userData = data?.data.filter(item => item._id === userID)
        if(userData?.at(0)) {
            res.status(200).json({ownerID, userID, status: userData.at(0).status})
        } else {
            res.status(200).json({ownerID, userID, status: FRIEND_STATUS.NONE})
        }
    }).catch(error => {
        console.log('lỗi khi get status friend: ', error)
        res.status(500).json({error})
    })
  }

  async updateStatusFriend(req, res) {
    const {ownerID, userID, status} = req.query;
    console.log('inner update sgetStatus friend: ', status)
    const ownerData = await userHelper.getUserDataById(ownerID)
    const userData = await userHelper.getUserDataById(userID)

    switch(status) {
        case FRIEND_STATUS.PENDING: {
            await helper.addFriend(ownerData, userData, FRIEND_STATUS.PENDING, 'notify')
            await helper.addFriend(userData, ownerData, FRIEND_STATUS.ACCEPTING)
            res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data:{status: FRIEND_STATUS.PENDING}})
            break
        }
        case FRIEND_STATUS.ACCEPTING: {
            await helper.acceptFriend(ownerData, userData, FRIEND_STATUS.FRIEND, 'notify')
            await helper.acceptFriend(userData, ownerData, FRIEND_STATUS.FRIEND)
            res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data: {status: FRIEND_STATUS.FRIEND}})
            break
        } case FRIEND_STATUS.REFUSING: {
            await helper.refuseFriend(ownerID, userID)
            await helper.refuseFriend(userID, ownerID)
            res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data: {status: FRIEND_STATUS.NONE}})
            break
        }
        case FRIEND_STATUS.CANCELING: {
          console.log('into canceling')
          await helper.refuseFriend(ownerID, userID)
          await helper.refuseFriend(userID, ownerID)
          res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data: {status: FRIEND_STATUS.NONE}})
          break
      }
        default: {
            console.log('status in updatestatus friend invalid')
            res.status(500).json('status in updatestatus friend invalid')
        }
    }
  }

  async getSuggestFriend(req, res) {
    const userID = req.params.userID
    friendHelper.getSuggestFriend(userID).then(response => res.status(200).json(response))
  }

  async getRequestFriends(req, res) {
    const userID = req.params.userID
    friendHelper.getRequestFriends(userID).then(response => res.status(200).json(response))
  }

  async getPendingFriends(req, res) {
    const userID = req.params.userID
    friendHelper.getPendingFriends(userID).then(response => res.status(200).json(response))
  }


  async removeSuggestFriend(req, res) {
    const {ownerID, userID} = req.params
    console.log('into removeSuggestFriend: ', ownerID, ' ', userID)
    friendHelper.removeSuggestFriend(ownerID, userID).then(response => {
      if(response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)

      }
    })
  }
}

module.exports = new FriendController()
