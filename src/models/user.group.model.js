const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupUserModel = new Schema({
    _id: String,
    groupIDs: {type: Array, default: []},
}, {timestamps:true})

module.exports = mongoose.model('Groupuser', groupUserModel)