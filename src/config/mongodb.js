

const uri = ''

// Mongoose
const mongoose = require('mongoose')
async function mongooseConnect() {
  await mongoose.connect(uri, {autoIndex: true}).then(()=> console.log('success')).catch(error => console.log(error))
} 
module.exports = {mongooseConnect }
