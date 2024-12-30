const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatgptModel = new Schema({
    userID: String,
    question: String,
    answer: String
}, {timestamps: true})

module.exports = mongoose.model('Chatgpt', chatgptModel)