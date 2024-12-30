const mongoose = require('mongoose')
const memberItem = require('./memberItem.model')
const Schema = mongoose.Schema

const adminitratorModel = new Schema({
   _id: {type: mongoose.Types.ObjectId},
   admin: {type: memberItem},
   censor: {type: [memberItem]}

} {timestamps:true})

module.exports = mongoose.model('Group', adminitratorModel)