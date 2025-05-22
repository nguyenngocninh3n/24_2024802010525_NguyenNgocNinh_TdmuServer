const { response } = require('express')
const helper = require('../../helper')
const groupModel = require('../../models/group.model')
const postModel = require('../../models/post.model')
const userModel = require('../../models/user.model')
const { SCOPE, RESPONSE_STATUS } = require('../../utils/constants')
const friendHelper = require('../FriendController/friendHelper')
const groupHelper = require('../GroupController/groupHelper')
const {
  updateSearchHistory,
  addSearchHistory,
  findSearchHistoryByParams,
  removeSearchHistory,
  findSearchHistoryListByUserID,
  removeSearchHistoryBySearchID,
  removeAllSearchHistoryByUserID
} = require('./updateSearchHistory')

class SearchController {
  async getSearchPost(req, res) {
    const { userID, queryString } = req.params
    console.log('into get search post: ', userID, ' ', queryString)

    const friendIDs = await friendHelper.getListFriendsID(userID).then(response => response.data)
    const groupIDs = await groupHelper
      .getGroupsByUserID(userID)
      .then(response => response.data.map(item => item._id))
    const allgroups = await groupHelper.getAllgroup()
    const publicGroup = allgroups.data
      .filter(item => item.scope === SCOPE.PUBLIC)
      .map(item => item._id)

    postModel
      .find({
        $and: [
          {
            $or: [
              {
                $or: [
                  {
                    scope: SCOPE.PUBLIC
                  },
                  {
                    userID: { $in: friendIDs },
                    scope: SCOPE.FRIEND
                  },
                  {
                    userID: userID,
                    scope: SCOPE.PRIVATE
                  }
                ]
              },
              {
                $or: [
                  {
                    userID: { $in: [...groupIDs, ...publicGroup] }
                  }
                ]
              }
            ]
          },
          { content: { $regex: queryString, $options: 'i' } }
        ]
      })
      .sort({ createdAt: 'desc' })
      .then(data => res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: data }))
      .catch(error => {
        console.log('Error when get serch post')
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  async getSearchUser(req, res) {
    const { userID, queryString } = req.params
    console.log('into get search user: ', userID, ' ', queryString)
    console.log('index: ', await userModel.listIndexes())
    // const response = userModel
    //   .find(
    //     { $text: { $search: queryString, $caseSensitive: false } },
    //     { score: { $meta: 'textScore' } }
    //   )
    //   .sort({ score: { $meta: 'textScore' } })

    userModel
      .find({ searchName: { $regex: queryString, $options: 'i' } })
      .then(data => res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: data }))
      .catch(error => {
        console.log('Error when get serch user: ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  async getSearchGroup(req, res) {
    const { userID, queryString } = req.params
    const customQuery = helper.removeVietnameseTones(queryString)
    groupModel
      .find({ $text: { $search: customQuery } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .then(data => {
        console.log('data group: ', data)
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: data })
      })
      .catch(error => {
        console.log('Error when get serch group: ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  async getSearchVideo(req, res) {}

  async getSearchImage(req, res) {
    const { userID, queryString } = req.params
    console.log('into get search post: ', userID, ' ', queryString)
    const queryWords = queryString
      .split(' ')
      .filter(word => word.trim() !== '')
      .map(word => word.toLowerCase())
    const friendIDs = await friendHelper
      .getListFriendsID(userID)
      .then(response => response.data.data)
    friendIDs.push(userID)
    const groupIDs = await groupHelper
      .getGroupsByUserID(userID)
      .then(response => response.data.map(item => item._id))
    const allgroups = await groupHelper.getAllgroup()
    const publicGroup = allgroups.data
      .filter(item => item.scope === SCOPE.PUBLIC)
      .map(item => item._id)

    postModel
      .find({
        $and: [
          {
            $or: [
              {
                $or: [
                  {
                    scope: SCOPE.PUBLIC
                  },
                  {
                    userID: { $in: friendIDs },
                    scope: SCOPE.FRIEND
                  },
                  {
                    userID: userID,
                    scope: SCOPE.PRIVATE
                  }
                ]
              },
              {
                $or: [
                  {
                    userID: { $in: [...groupIDs, ...publicGroup] }
                  }
                ]
              }
            ]
          },
          {
            $or: [
              { labels: { $in: queryWords } },
              { transLabels: { $in: queryWords } },
              { detectText: { $regex: queryWords.join('|'), $options: 'i' } }
            ]
          }
        ]
      })

      .then(data => {
        // Chấm điểm các bài viết
        const scoredPosts = data.map(post => {
          let score = 0
          if (post.labels) {
            score += post.labels.filter(label => queryWords.includes(label.toLowerCase())).length
          }
          if (post.transLabels) {
            score += post.transLabels.filter(transLabel =>
              queryWords.includes(transLabel.toLowerCase())
            ).length
          }
          if (post.detectText) {
            const detectWords = post.detectText.split(' ').map(word => word.toLowerCase())
            score += detectWords.filter(word => queryWords.includes(word)).length
          }

          return { post, score }
        })

        scoredPosts.sort((a, b) => b.score - a.score)
        const sortedPosts = scoredPosts.map(item => item.post) // Chỉ lấy bài viết
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: sortedPosts })
      })
      .catch(error => {
        console.log('Error when get serch post: ', error)
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  async handleGetSearchHistoryListByUserID (req, res) {
    const {userID} = req.params
    const response = await findSearchHistoryListByUserID(userID)
    res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data: response})
  }

  async handleAddSearchHistory(req, res) {
    const { search, type, userID } = req.params
    const response = await findSearchHistoryByParams(userID, search, type)
    const result = response
      ? await updateSearchHistory(response._id)
      : await addSearchHistory(userID, search, type)
    res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data: result})
  }

  async handleRemoveSearchHistoryByID (req, res) {
    const {searchID} = req.params
    await removeSearchHistoryBySearchID(searchID)
    res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data: {}})
  }

  async handleRemoveSearchHistoryByUserID (req, res) {
    const {userID} = req.params
    await removeAllSearchHistoryByUserID(userID)
    res.status(200).json({status: RESPONSE_STATUS.SUCCESS, data: []})
  }
}

module.exports = new SearchController()
