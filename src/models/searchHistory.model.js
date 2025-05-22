const mongoose = require('mongoose')
const Schema = mongoose.Schema



const searchHistoryModal = new Schema({
    userID: String,
    search: String,
    type: String,
    createdAt: Date,
    updatedAt: Date,
}, {timestamps:true})

module.exports = mongoose.model('Searchistory', searchHistoryModal)