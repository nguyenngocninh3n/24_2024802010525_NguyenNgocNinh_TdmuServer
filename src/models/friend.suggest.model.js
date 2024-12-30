const mongoose = require('mongoose')
const Schema = mongoose.Schema

const suggestModel = new Schema({
  _id: String,
  suggested: Array,
  status: {type:String, default: 'ACTIVE'}
})

module.exports = mongoose.model('Suggest', suggestModel)
