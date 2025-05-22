const groupMemberModel = require('../../models/group.member.model')
const postModel = require('../../models/post.model')
const userModel = require('../../models/user.model')
const { RESPONSE_STATUS, SCOPE } = require('../../utils/constants')
const friendHelper = require('../FriendController/friendHelper')
const groupHelper = require('../GroupController/groupHelper')
const groupUserModel = require('../../models/user.group.model')
async function getNewFeedPosts(userID) {
  const user = await userModel.findById(userID)

  // Lấy danh sách bạn bè và nhóm đã tham gia
  const friendIDs = await friendHelper.getListFriendsID(userID).then(response => {
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      return response.data.data
    }
    return []
  })
  const groupIDs = await groupUserModel.findById(userID) 
  .then(response => {
    if (response) {
      return response.groupIDs
    }
    return []
  })

  console.log('groupIDs: ', groupIDs)
  console.log('friendIDs: ', friendIDs)
  const posts2 = await postModel
    .aggregate([
      {
        $lookup: {
          from: 'postviews', // Tham chiếu collection lưu trạng thái xem
          localField: '_id',
          foreignField: 'postID',
          as: 'postview'
        },
      },
      {
        $lookup: {
          from: 'groups', // Tham chiếu collection nhom
          localField: 'groupID',
          foreignField: '_id',
          as: 'groupview'
        },
      },
      {
        $addFields: {
          // Kiểm tra xem user hiện tại đã xem bài viết hay chưa
          viewedByCurrentUser: {
            $in: [userID, { $ifNull: [{ $map: { input: '$postview', as: 'view', in: '$$view.userID' } }, []] }]

          },

          // Tính toán điều kiện nhóm
          fromAllowedGroup: {
            $or: [
              {$eq: ['$groupID', null]},
              { $eq: ['$groupview.scope', SCOPE.PUBLIC] }, // Nhóm public
              { $in: ['$groupID', groupIDs] } // Hoặc nhóm đã tham gia
            ]
          },
          // Tính toán điều kiện bài viết
          isAccessiblePost: {
            $or: [
              { $eq: ['$scope', SCOPE.PUBLIC] }, // Bài viết public
              {
                $and: [
                  // Hoặc bài viết riêng tư nhưng từ bạn bè
                  { $eq: ['$scope', SCOPE.FRIEND] },
                  { $in: ['$userID', friendIDs] }
                ]
              }
            ]
          },
          // Tính điểm dựa trên các tiêu chí
          score: {
            $add: [
              // Chưa xem: +5 điểm
              { $cond: [{ $eq: ['$viewedByCurrentUser', false] }, 5, 0] },
              // Bài viết từ bạn bè: +3 điểm
              { $cond: [{ $in: ['$userID', friendIDs] }, 3, 1] },
              // Bài viết từ nhóm đã tham gia: +2 điểm
              { $cond: [{ $in: ['$groupID', groupIDs] }, 2, 1] }
            ]
          }
        }
      },
      { $match: { $and: [{ isAccessiblePost: true }, { fromAllowedGroup: true }  ] } },
      { $sort: { score: -1 } }, // Sắp xếp theo điểm
      { $sample: { size: 10 } } // Lấy ngẫu nhiên 10 bài viết từ các bài có điểm cao nhất
    ]).then(response => {
      console.log('response get new feed posts: ', response.length)
      // return  {length: response.length, data: response}
      return response
    })

  return posts2
}

module.exports = {
    getNewFeedPosts
}
