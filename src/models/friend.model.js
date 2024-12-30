const mongoose = require('mongoose')
const friendDataModel = require('./friendData.model')
const Schema = mongoose.Schema

const friendModel = new Schema({
  _id: {type: String},
  data: [friendDataModel]
}, { timestamps: true })

module.exports = mongoose.model('Friend', friendModel)
