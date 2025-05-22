const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userModel = new Schema({
  _id: {type: String},
  userName: { type: String},
  searchName: {type: String},
  email: { type: String },
  phone: { type: String },
  avatar: { type: String },
  bio: {type: String, default: null},
  background: {type: String, default: null},
  followerNum: { type: Number },
  followingNum: { type: Number },
  sex: { type: Boolean },
  age: { type: Number },
  active: {type: Boolean, default: true},
  fcmToken: {type: String, default: null}
}, { timestamps: true })
userModel.index({'searchName': 'text'})

module.exports = mongoose.model('User', userModel)
