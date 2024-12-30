const groupModel = require('../../models/group.model')
const postModel = require('../../models/post.model')
const PostController = require('../PostController')
const groupUserModel = require('../../models/user.group.model')
const groupMemberModel = require('../../models/group.member.model')
const { RESPONSE_STATUS, MEMBER_STATUS, MEMBER_ROLE } = require('../../utils/constants')
const helper = require('../../helper')

const getAllgroup = async () =>
  await groupModel
    .find({})
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when create request join group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

const getGroupByID = async groupID =>
  await groupModel
    .findById(groupID)
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when get group by id : ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

const getGroupsByUserID = async userID => {
  console.log('userID in getGroupsByid: ', userID)
  const groupIDs = await groupUserModel.findById(userID).then(data => {
    if(data) {
      return data.groupIDs
    }
  })
  console.log('groupIDs in getGroupsByid: ', groupIDs)
  const groupData = await groupModel.find({ _id: { $in: groupIDs } })
  return { status: RESPONSE_STATUS.SUCCESS, data: groupData }
}



const getGroupPostsOfUser = async (groupID, userID) =>
  await postModel
    .find({ userID, groupID })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when get group posts of user: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

const getGroupPostsOfGroup = async groupID =>
  await postModel
    .find({ groupID })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when get group post of group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

const getGroupMemberByUserID = async (groupID, userID) =>
  await groupMemberModel
    .findOne({ groupID: groupID, userID: userID })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when get group member by userId: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

const getGroupMembersByID = async groupID =>
  await groupMemberModel
    .find({ groupID: groupID, status: MEMBER_STATUS.ACCEPT })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when get group members by id: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

const getPendingGroupMembersByID = async groupID =>
  await groupMemberModel
    .find({ groupID: groupID, status: MEMBER_STATUS.PENDING })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when get pending group members by id: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

const getBlockingGroupMembersByID = async groupID =>
  await groupMemberModel
    .find({ groupID: groupID, status: MEMBER_STATUS.BLOCK })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when get blocking group members by id: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })    

const getGroupImagesByID = async () => {}

const getGroupVideosByID = async () => {}

//MEMBER ACTION

const requestJoinGroup = async (groupID, userData) => {
  const response = await groupMemberModel
    .create({
      groupID,
      userID: userData._id,
      userName: userData.userName,
      avatar: userData.avatar,
      status: MEMBER_STATUS.PENDING
    })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when create request join group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const cancleRequestJoinGroup = async (groupID, userID) => {
  const response = await groupMemberModel
    .findOneAndDelete({ groupID, userID })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when create request join group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })

    return response
}

const acceptMember = async (groupID, userID) => {
  const response = await groupMemberModel
    .findOneAndUpdate(
      { groupID, userID },
      { status: MEMBER_STATUS.ACCEPT },
      { returnDocument: 'after' }
    )
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when accept member group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const blockMember = async (groupID, userID) => {
  const response = await groupMemberModel
    .findOneAndUpdate(
      { groupID, userID },
      { status: MEMBER_STATUS.BLOCK },
      { returnDocument: 'after' }
    )
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when block member group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const unBlockMember = async (groupID, userID) => {
  const response = await groupMemberModel
    .findOneAndDelete({groupID, userID})
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when unblock member group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const createGroupUser = async userID => {
  const response = await groupUserModel
    .create({ _id: userID })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when create group user: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const storeGroupUser = async (groupID, userID) => {
  const response = await groupUserModel
    .findByIdAndUpdate(userID, { $push: { groupIDs: groupID } }, { returnDocument: 'after' })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when store group user: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const deleteGroupUser = async (groupID, userID) => {
  const response = await groupUserModel
    .findByIdAndUpdate(userID, { $pull: { groupIDs: groupID } }, { returnDocument: 'after' })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when delete group user: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const exitGroup = async (groupID, userID) => {
  const response = await groupMemberModel
    .deleteOne({ groupID, userID })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when accept exit group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const deleteMember = async (groupID, userID) => {
  return await exitGroup(groupID, userID)
}

const storeGroupMember = async (groupID, role, status, userData) => {
  const response = await groupMemberModel.create({
    groupID: groupID,
    userID: userData._id,
    userName: userData.userName,
    avatar: userData.avatar,
    role: role,
    status: status
  }) .then(data => {
    return { status: RESPONSE_STATUS.SUCCESS, data: data }
  })
  .catch(error => {
    console.log('groupHelper: Error when store group member: ', error)
    return { status: RESPONSE_STATUS.ERROR, data: null }
  })

  return response

}

// GROUP ACTION

const createGroup = async (name, bio, scope) => {
  const searchName = helper.removeVietnameseTones(name)
  const newGroup = await groupModel
    .create({ name, bio, scope, searchName, avatar:helper.relativeImage.group_background })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when create group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return newGroup
}

const updateGroupName = async (groupID, name) => {
  const searchName = helper.removeVietnameseTones(name)
  const response = await groupModel
    .findByIdAndUpdate(groupID, { name: name, searchName }, { returnDocument: 'after' })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when update name group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const updateGroupAvatar = async (groupID, avatar) => {
  const response = await groupModel
    .findByIdAndUpdate(groupID, { avatar: avatar }, { returnDocument: 'after' })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when update avatar group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const updateGroupBio = async (groupID, bio) => {
  const response = await groupModel
    .findByIdAndUpdate(groupID, { bio: bio }, { returnDocument: 'after' })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when update bio group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const updateMemberGroupLengthForIncrease = async groupID => {
  const response = await groupModel
    .findByIdAndUpdate(groupID, { $inc: { memberLength: 1 } }, { returnDocument: 'after' })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when update increase member length group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const updateMemberGroupLengthForDecrease = async groupID => {
  const response = await groupModel
    .findByIdAndUpdate(groupID, { $inc: { memberLength: -1 } }, { returnDocument: 'after' })
    .then(data => {
      return { status: RESPONSE_STATUS.SUCCESS, data: data }
    })
    .catch(error => {
      console.log('groupHelper: Error when update decrease member length group: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const groupHelper = {
    getAllgroup,
    getGroupByID,
    getGroupsByUserID,
    getGroupPostsOfUser,
    getGroupPostsOfGroup,
    getGroupMemberByUserID,
    getGroupMembersByID,
    getPendingGroupMembersByID,
    getBlockingGroupMembersByID,
    getGroupImagesByID,
    getGroupVideosByID,



    requestJoinGroup,
    cancleRequestJoinGroup,
    acceptMember,
    blockMember,
    unBlockMember,
    exitGroup,
    storeGroupMember,
    deleteMember,

    createGroupUser,
    storeGroupUser,
    deleteGroupUser,



    createGroup,
    updateGroupName,
    updateGroupAvatar,
    updateGroupBio,
    updateMemberGroupLengthForIncrease,
    updateMemberGroupLengthForDecrease


}

module.exports = groupHelper
