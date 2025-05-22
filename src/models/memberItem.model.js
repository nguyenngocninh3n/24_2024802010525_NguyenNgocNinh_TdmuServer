const mongoose = require('mongoose')
const Schema = mongoose.Schema

const memberItem = new Schema({
    _id: String,
    userName: {type: String},
    avatar: {type: String, default: null},

} {timestamps:true})

module.exports = memberItem