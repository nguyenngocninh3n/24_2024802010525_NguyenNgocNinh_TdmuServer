const mongoose = require('mongoose')
const ChatDataModel = require('./chatData.convention.model')
const MemberModel = require('./member.convention.model')
const { RESPONSE_STATUS } = require('../utils/constants')
const Schema = mongoose.Schema


const conventionModel = new Schema({
    type: {type: String, default: 'private'},
    uids: Array,
    members: [MemberModel],
    avatar: {type: String, default: null},
    name: String,
    data: [ChatDataModel],
}, {timestamps: true})

module.exports = mongoose.model('Convention', conventionModel)
