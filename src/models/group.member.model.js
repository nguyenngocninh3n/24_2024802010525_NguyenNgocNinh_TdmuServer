const mongoose = require('mongoose')
const { MEMBER_ROLE, FRIEND_STATUS, MEMBER_STATUS } = require('../utils/constants')
const Schema = mongoose.Schema

const groupMemberModel = new Schema({
   groupID: {type: mongoose.Types.ObjectId, default: null},
   userID: {type:String},
   userName: String,
   avatar: String,
   role: {type: String, default: MEMBER_ROLE.MEMBER},
   status: {type: String, default: MEMBER_STATUS.PENDING}

}, {timestamps:true})

module.exports = mongoose.model('Groupmember', groupMemberModel)