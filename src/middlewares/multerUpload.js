const multer = require('multer')

const fileFilter = (req, file, callback) => {
  if (!file) callback(null, false)
  else callback(null, true)
}

const uploadFile = multer({ fileFilter, limits: {} })

const multerUpload = {
  uploadFile
}
module.exports = multerUpload
