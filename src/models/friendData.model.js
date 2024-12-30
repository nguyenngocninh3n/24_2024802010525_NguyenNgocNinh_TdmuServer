const mongoose = require('mongoose')
const Schema = mongoose.Schema

const friendDataModel = new Schema({
    _id: String,
    userName: String,
    avatar: String,
    status: String,

  }, {timestamps: true})

module.exports = friendDataModel
