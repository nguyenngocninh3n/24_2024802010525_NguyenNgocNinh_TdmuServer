const mongoose = require('mongoose')
const Schema = mongoose.Schema
const reactionModal = new Schema({
    targetID: {type: mongoose.Types.ObjectId},
    type: {type: String},
    userID: {type:String},
    userName: {type: String},
    avatar: {type: String},
    status: {type: Boolean, default: false}
}, {timestamps: true})

module.exports = mongoose.model("Reaction", reactionModal)