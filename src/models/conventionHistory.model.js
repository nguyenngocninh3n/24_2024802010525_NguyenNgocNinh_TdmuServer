const mongoose = require('mongoose')
const Schema = mongoose.Schema

const conventionHistoryModel = new Schema({
    _id: {type: String},
    data: {type: Array}
}, {timestamps: true})

module.exports = mongoose.model('ConventionHistory', conventionHistoryModel)
