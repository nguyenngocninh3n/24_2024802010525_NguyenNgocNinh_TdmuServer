const { v2: cloudinary } = require('cloudinary')
const streamifier = require('streamifier')
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

const uploadFile = (folderName, bufferFile) => {
  return new Promise((resolve, reject) => {
    const fileUpdating = cloudinary.uploader.upload_stream({ folder: folderName }, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
    streamifier.createReadStream(bufferFile).pipe(fileUpdating)
  })
}

const uploadMultiFiles = (folderName, listBufferFiles) => {
  return new Promise((resolve, reject) => {
    const listFilesUpdating = cloudinary.uploader.upload_stream({ folder: folderName }, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
    streamifier.createReadStream(listBufferFiles).pipe(listFilesUpdating)
  })
}

const CloudinaryProvider = {
  uploadFile,
  uploadMultiFiles
}

module.exports = CloudinaryProvider
