const mongoose = require('mongoose')
const Schema = mongoose.Schema



const notificationModel = new Schema({
    _id: String, //type+targetID
    userID: String,
    targetID: String,
    type: String,
    message: String,
    number: {type: Number, default: 0},
    status: {type: Boolean, default: false},
    uids: {type:Array, default: []},
    senderID: String,
    senderName: String,
    senderAvatar: String
}, {timestamps: true})

module.exports = mongoose.model('Notification', notificationModel)