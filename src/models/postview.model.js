const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postview = new Schema(
  {
    ownerID: String,
    postID: {type: mongoose.Types.ObjectId},

  },
  { timestamps: true }
)

module.exports = mongoose.model('Postview', postview)
