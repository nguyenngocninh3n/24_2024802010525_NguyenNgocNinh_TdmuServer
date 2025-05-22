const friendModel = require('../../models/friend.model')
const friendSuggestModel = require('../../models/friend.suggest.model')
const userModel = require('../../models/user.model')
const { FRIEND_STATUS, RESPONSE_STATUS } = require('../../utils/constants')

const getFriendStatus = async (ownerID, userID) => {
  const data = await friendModel
    .findById(ownerID)
    .then(data => {
      const customData = data.data.find(item => item._id === userID)
      console.log('friend data: ', data)
      return customData?.status ?? FRIEND_STATUS.NONE
    })
    .catch(error => {
      console.log('errror get friend status at friendHelp: ', error)
      return null
    })
  return data
}

const checkFriendStatus = status => {
  switch(status) {
    case FRIEND_STATUS.FRIEND: return true
    case FRIEND_STATUS.PENDING: return true
    case FRIEND_STATUS.ACCEPTING: return true
    default: return false
  }
}

const getListFriendsID = async userID => {
  const response = await friendModel
    .findById(userID)
    .then(data => {
      const customData = {
        _id: data._id,
        data: data.data.filter(item => item.status === FRIEND_STATUS.FRIEND ).map(item => item._id)
      }
      return { status: RESPONSE_STATUS.SUCCESS, data: customData }
    })
    .catch(error => {
      console.log('errror get list friends id in friendHelper: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const getRequestFriends = async userID => {
  const response = await friendModel
    .findById(userID)
    .then(data => {
      const customData = {
        _id: data._id,
        data: data.data.filter(item => item.status === FRIEND_STATUS.ACCEPTING )
      }
      return { status: RESPONSE_STATUS.SUCCESS, data: customData }
    })
    .catch(error => {
      console.log('errror get list friends id in friendHelper: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}


const getPendingFriends = async userID => {
  const response = await friendModel
    .findById(userID)
    .then(data => {
      const customData = {
        _id: data._id,
        data: data.data.filter(item => item.status === FRIEND_STATUS.PENDING )
      }
      return { status: RESPONSE_STATUS.SUCCESS, data: customData }
    })
    .catch(error => {
      console.log('errror get list friends id in friendHelper: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: null }
    })
  return response
}

const getSuggestFriend = async userID => {
  // Lấy danh sách bạn bè của userID1
  const currentUserFriends = await friendModel
    .findOne({ _id: userID })
    .then(data =>
      data.data.filter(item => checkFriendStatus(item.status)).map(item => item._id)
    )
  console.info('current userFriend and pending,accepting ID: ', currentUserFriends)
  const suggestedData = await friendSuggestModel.findById(userID).then(data => data.suggested) 
 console.log('suggested ids: ', suggestedData)
  // console.log('current user friend: ', currentUserFriends.map(item => item.userName))
  // Truy vấn danh sách ứng viên
  const suggestFriends = await userModel
    .aggregate([
      // Bước 1: Loại bỏ chính người dùng
      { $match: { _id: { $ne: userID } } },
      // Bước 2: Lookup danh sách bạn bè của ứng viên
      {
        $lookup: {
          from: 'friends',
          localField: '_id',
          foreignField: '_id',
          as: 'friendData'
        }
      },
      // Bước 3: Loại bỏ bạn bè hiện tại
      {
        $addFields: {
          isFriend: {
            $in: ['$_id', currentUserFriends] // So sánh với danh sách bạn bè của userID1
          }
        }
      },
      { $match: { isFriend: false } }, // Chỉ lấy những người chưa là bạn
      // Bước 4: Lookup trạng thái đề xuất
      {
        $addFields: {
          isSuggested: { $in: ['$_id', suggestedData ] }
        }
      },
      { $match: { isSuggested: false } }, // Loại bỏ người đã được đề xuất
      // Bước 5: Lookup nhóm của ứng viên
      {
        $lookup: {
          from: 'groupmembers',
          localField: '_id',
          foreignField: 'userID',
          as: 'userGroups'
        }
      },
      // Bước 6: Lookup nhóm của userID1
      {
        $lookup: {
          from: 'groupmembers',
          let: { userID: userID },
          pipeline: [
            { $match: { $expr: { $eq: ['$userID', '$$userID'] } } },
            { $project: { groupID: 1 } }
          ],
          as: 'currentUserGroups'
        }
      },
      // Bước 7: Tính số nhóm chung
      {
        $addFields: {
          commonGroups: {
            $size: {
              $setIntersection: [
                { $map: { input: '$userGroups', as: 'group', in: '$$group.groupID' } },
                { $map: { input: '$currentUserGroups', as: 'group', in: '$$group.groupID' } }
              ]
            }
          }
        }
      },
      // Bước 8: Tính điểm
      {
        $addFields: {
          score: {
            $sum: [
              { $multiply: [{ $size: { $ifNull: ['$friendData.data', []] } }, 5] }, // Điểm bạn chung
              { $multiply: ['$commonGroups', 3] } // Điểm nhóm chung
              // { $cond: [{ $eq: ['$province', 'Hà Nội'] }, 2, 0] }, // Điểm cùng tỉnh
              // { $cond: [{ $eq: ['$class', '10A1'] }, 4, 0] } // Điểm cùng lớp
            ]
          }
        }
      },
      // Bước 9: Sắp xếp theo điểm
      { $sort: { score: -1 } }
      // Bước 10: Chỉ lấy các trường cần thiết
      // { $project: { _id: 1, province: 1, class: 1, score: 1 } }
    ])
    .catch(error => {
      console.log('error when get suggest friends: ', error)
      return error
    })

  return suggestFriends
}

const removeSuggestFriend = async (ownerID, userID) => {
  const result = await friendSuggestModel
    .findOneAndUpdate({_id:ownerID}, { $push: { suggested: userID } })
    .then(response => {
      return { status: RESPONSE_STATUS.SUCCESS, data: response }
    })
    .catch(error => {
      console.log('error when removeSuggestFriend: ', error)
      return { status: RESPONSE_STATUS.ERROR, data: error }
    })
    return result
}


const handleGetListFriend = async userID => {
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

const friendHelper = {
  getFriendStatus,
  getSuggestFriend,
  getListFriendsID,
  getRequestFriends,
  getPendingFriends,
  removeSuggestFriend,
  handleGetListFriend
}

module.exports = friendHelper