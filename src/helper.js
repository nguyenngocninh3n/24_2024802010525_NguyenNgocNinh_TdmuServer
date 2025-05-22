const fs = require('fs')
const { POST_ATTACHMENT, FILE_EXT, FOLDER_NAME } = require('./utils/constants')
const path = require('path')

const storeFile = (dirPath, filePath, fileData) => {
  fs.mkdir(dirPath, { recursive: true }, err => {
    if (err) {
      console.error('Lỗi khi tạo thư mục:', err.message)
      return
    }

    fs.writeFileSync(filePath, fileData, err => {
      if (err) {
        console.error('Lỗi khi lưu file:', err.message)
      } else {
        console.log('File đã được lưu thành công tại:', filePath)
      }
    })
  })
}

const storeMultiFile = async (staticFilePaths, dirPath, filesData) => {

  fs.mkdir(dirPath + FOLDER_NAME.IMAGE, { recursive: true }, err => {
    if (err) {
      console.error('Lỗi khi tạo thư mục:', err.message)
      return
    }
    fs.mkdir(dirPath + FOLDER_NAME.VIDEO, { recursive: true }, err => {
        if (err) {
          console.error('Lỗi khi tạo thư mục:', err.message)
          return
        }
        filesData.forEach((item, index) => {
          const fileBuffer = Buffer.from(item.source, 'base64') 
            fs.writeFileSync(staticFilePaths.at(index), fileBuffer, err => {
              if (err) {
                console.error('Lỗi khi lưu file:', err.message)
              } else {
                console.log('File đã được lưu thành công tại:', staticFilePaths.at(index))
              }
            })
    })
      })
  })
}

//
const getStaticFilePathFromRelateFilePath = (filepath) => {
  const dirPath = path.join(__dirname, '/public/' + filepath)
  return dirPath
}

const deleteFileFromRelativeFilePath = (filepath) => {
  const staticFilePath = getStaticFilePathFromRelateFilePath(filepath)
  fs.rm(staticFilePath, error => {
    if(error) {
      console.log('error when deleteFile from relative filePath in helper.js: ', error)
      return
    }
    console.log('delete file successfully')
  })
}


//path don't include folder_type: /video/file_name.ext
const getUploadFolderPath = (__dirname, folderType, folderID) => {
  const relativePath = `uploads/${folderType}/${folderID}/`
  const dirPath = path.join(__dirname, '../../public/' + relativePath)
  return [relativePath, dirPath]
}

const getUploadFileAndFolderPath = (__dirname, folderType, folderID, attachments) => {
  const relativePath = `uploads/${folderType}/${folderID}/`
  const dirPath = path.join(__dirname, '../../public/' + relativePath)
  const staticFilePaths = []
  const relativeFilePaths = attachments.map(item => {
    const fileExt = item.type === POST_ATTACHMENT.IMAGE || item.type === 'image/png'  ? FILE_EXT.IMAGE : FILE_EXT.VIDEO
    const fileName = Math.random().toFixed(10) + fileExt
    const fileType = fileExt === FILE_EXT.IMAGE ? FOLDER_NAME.IMAGE : FOLDER_NAME.VIDEO
    staticFilePaths.push(dirPath +  fileType +'/' + fileName )
    return {
      type: fileType.toUpperCase(),
      source: relativePath + fileType +'/' + fileName
    }
  })
  return [relativeFilePaths, staticFilePaths, dirPath]
}

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD') // Tách chữ và dấu thành các thành phần riêng
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu
    .replace(/đ/g, 'd') // Chuyển 'đ' thành 'd'
    .replace(/Đ/g, 'D') // Chuyển 'Đ' thành 'D'
    .toLowerCase(); // Chuyển về chữ thường
};


const relativeImage = {
  avatar_null: '/uploads/static/avatar_null.png',
  convention_group: '/uploads/static/groupchat.png',
  group_background: '/uploads/static/group.png'
}


const helper = {
  storeFile,
  storeMultiFile,
  getUploadFolderPath,
  getUploadFileAndFolderPath,
  getStaticFilePathFromRelateFilePath,
  deleteFileFromRelativeFilePath,
  relativeImage,
  removeVietnameseTones
}
module.exports = helper
