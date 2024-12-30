const mongoose = require('mongoose')
const { POLL_STATUS } = require('../utils/constants')
const Schema = mongoose.Schema

const pollOptionModel = new Schema({
    value: String
}, {timestamps:true})

const pollResultModel = new Schema({
    userID: String,
    optionIDs: Array
})

const pollModel = new Schema({
    targetID: mongoose.Types.ObjectId,
    userID: String,
    question: String,
    options: [pollOptionModel],
    results: [pollResultModel],
    type: String,
    status: {type: String, default: POLL_STATUS.DOING},
    editable: {type: Boolean, default: false},
})

module.exports = mongoose.model('Poll', pollModel)