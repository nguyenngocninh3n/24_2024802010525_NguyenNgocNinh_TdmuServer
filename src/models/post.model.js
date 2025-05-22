const mongoose = require('mongoose')
const { SCOPE, POST_STATUS, POST_TYPE } = require('../utils/constants')
const Schema = mongoose.Schema

const postModal = new Schema(
  {
    childrenID: {type: mongoose.Types.ObjectId, default: null},
    groupID: {type: mongoose.Types.ObjectId, default: null},
    userID: String,
    userName: {type:String, default: null},
    avatar: {type:String, default: null},
    type: {type: String, default: POST_TYPE.PERSONAL},
    attachments: {type: Array, default: []},
    content: {type: String, default: ''},
    scope: {type: String, default: SCOPE.PUBLIC},
    status: {type: String, default: POST_STATUS.ACTIVE},
    sharesCount: {type: Number, default: null},
    reactionsCount: {type: Number, default: 0},
    commentsCount: {type: Number, default: 0},
    pollID: mongoose.Types.ObjectId,
    labels: {type:Array, default: []},
    transLabels: {type: Array, default: []},
    detectText: {type: String, default: ''}
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', postModal)
