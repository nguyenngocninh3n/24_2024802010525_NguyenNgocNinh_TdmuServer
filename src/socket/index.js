const { Server } = require('socket.io')

const fcmNotify = require('../notify/fcmNotify')
const userHelper = require('../controllers/UserController/userHelper')
const conventionHelper = require('../controllers/ConventionController/conventionHelper');
const friendHelper = require('~/controllers/FriendController/friendHelper');
let io;
const runSocketServer = server => {
  io = new Server(server)
  var conventions = []
  io.on('connection', client => {
    var userData = { _id: '' }

    client.on('connection', async data => {
      userData._id = data.data.userID
      await userHelper.handleActiveUser(userData._id)
      const conventionIDs = await conventionHelper
        .handleGetConventionIDs(userData._id)
        .then(data => data.data)
      const friendIDs = await friendHelper.handleGetListFriend(userData._id)
        .then(data => data.data.map(item => 'friend_' + item._id))
      for (const item of conventionIDs) {
        await client.join(item)
      }
      for (const item of friendIDs) {
        await client.join(item)
      }
      client
        .in('friend_' + userData._id)
        .emit('friendActive', { userID: userData._id, active: true, updatedAt: new Date() })
    })
    client.on('disconnect', data => {
      userHelper.handleInActiveUser(userData._id)
      io.in('friend_' + userData._id).emit('friendActive', {
        userID: userData._id,
        active: false,
        updatedAt: new Date()
      })
    })
    client.on('disconnection', data => {
      userHelper.handleInActiveUser(userData._id)
      io.in('friend_' + userData._id).emit('friendActive', {
        userID: userData._id,
        active: false,
        updatedAt: new Date()
      })
    })



    // JOIN ROOM
    client.on('joinChatRoom', data => {
      client.join(data)
    })

    client.on('joinChatRooms', data => {
      console.log('joinChatRooms: ', data)
      data.forEach(item => client.join(item))
    })

    client.on('exitRooms', data => {
      data.forEach(item => {
        console.log('exit rooms: ', item)
        client.rooms.delete(item)
      })
    })



    // CONVENTION ACTION
    client.on('convention', value => {
      const { conventionID } = value
      console.log('valie in on convention at server: ', value)
      io.in(conventionID).emit('convention', value)
    })

    client.on('conventionStored', receivedData => {
      console.log('prepare emit convention: ', receivedData)
      const { uids, data, conventionID } = receivedData
      const orders = uids.filter(item => item !== data.senderID)
      io.in(uids).emit('conventionStored', conventionID)
    })

    client.on('call', data => {
      const { targetID, meetingId, senderID, senderName, senderAvatar, members } = data
      console.log('call event - received data: ', data)
      const customMember = members.filter(item => item._id !== senderID)
      customMember.forEach(item => {
        userHelper.getUserDataById(item._id).then(userSender => {
          console.log('user sender next: ', userSender)
          const newData = fcmNotify.createNotifyData({
            channelID: Math.random().toString(),
            body: 'Cuộc gói đến từ ' + senderName,
            title: 'Cuộc gọi đến',
            senderName: senderName,
            senderAvatar: senderAvatar,
            senderID: senderID,
            type: 'CALL',
            targetID: targetID,
            ownerID: item._id,
            meetingId
          })
          console.log('ownername will receive notify: ', newData)
          fcmNotify.sendNotification(userSender.fcmToken, newData)
        })
      })
    })

    client.on('changeConventionName', data => {
      const {conventionID} = data
      client.in(conventionID).emit('changeConventionName', data)
    })

    client.on('changeConventionAvatar', data => {
      const {conventionID} = data
      client.in(conventionID).emit('changeConventionAvatar', data)
    })

    client.on('changeConventionAka', data => {
      const {conventionID} = data
      client.in(conventionID).emit('changeConventionAka', data)
    })

    //

    // POLL ACTION
    client.on('addPolling', data => {
      const targetID = data.targetID
      const customData = { data: data.data, pollID: data.pollID }
      console.log('listion add Polling in server: ', data)
      io.to(targetID).emit('client_addPolling', customData)
    })

    client.on('updatePolling', data => {
      const customData = { data: data.data, pollID: data.pollID }
      console.info('listen update Polling in server: ', data.targetID)

      io.in(data.targetID).emit('client_updatePolling', customData)
    })

    // REACTION ACTION
    client.on('reaction', data => {
      const { type, targetID, status } = data
      const event_name = type + 'reaction'
      io.in(targetID).emit(event_name, { postID: targetID, number: status ? -1 : 1 })
    })

    // COMMENT COUNT ACTION
    client.on('comment_count', data => {
      const { postID, number } = data
      io.in(postID).emit('comment_count', { postID, number })
    })
  })
}

class instance  {
  
  // CONVENTION
  emitChangeConventionAka = (conventionID, userID, aka) => {
    io.in(conventionID).emit('emitChangeConventionAka', {conventionID, userID, value: aka})
  }
  emitChangeConventionAvatar = (conventionID, avatar) => {
    io.in(conventionID).emit('emitChangeConventionAvatar', {conventionID, value: avatar})
  }
  emitChangeConventionName = (conventionID, name) => {
      io.in(conventionID).emit('emitChangeConventionName', {conventionID, value: name})
  }


  // COMMENT
  emitAddComment = (postIdString, comment) => {
    const postID = postIdString.toString()
    io.in(postID).emit('emitAddComment', {postID, comment} )
  }

  emitEditComment = (postIdString, comment) => {
    const postID = postIdString.toString()
    io.in(postID).emit('emitEditComment', {postID, comment} )
  }

  emitDeleteComment = (postIdString, commentIdString) => {
    const postID = postIdString.toString()
    const commentID = commentIdString.toString()
    io.in(postID).emit('emitDeleteComment', {postID, commentID} )
  }

  emitReactionComment = (postIdString, commentIdString, reactions) => {
    const postID = postIdString.toString()
    const commentID = commentIdString.toString()
    io.in(postID).emit('emitReactionComment', {postID, commentID, reactions})
  }

  // POST

  emitAddPost = (userID, post) => {
    io.in(userID).emit('emitAddPost', {post})
  }

  emitEditPost = (postIdString, post) => {
    const postID = postIdString.toString()
    io.in(postID).emit('emitEditPost', {post})
  }

  emitRemovePost = postIdString => {
    const postID = postIdString.toString()
    io.in(postID).emit('emitRemovePost', {postID})
  }


  emitReactionPostChange = (postIdString, post) => {
    const postID = postIdString.toString()
    io.in(postID).emit('emitReactionPostChange', {post})
  }

  emitCommentPostChange = (postIdString, post) => {
    const postID = postIdString.toString()
    io.in(postID).emit('emitCommentPostChange', {post})
  }


  // PROFILE
  emitBioProfileChange = (userID, aka) => {
    const customID = userID.toString()
    io.in(customID).emit('emitBioProfileChange', {aka})
  }

  emitAvatarProfileChange = (userID, avatar) => {
    const customID = userID.toString()
    io.in(customID).emit('emitAvatarProfileChange', {avatar})
  }

  emitBackgroundProfileChange = (userID, background) => {
    const customID = userID.toString()
    io.in(customID).emit('emitBackgroundProfileChange', {background})
  }
}

const SocketServer = { runSocketServer, instance: new instance() }
module.exports = SocketServer