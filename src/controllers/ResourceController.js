const fs = require('fs')
const path = require('path')

class ResourceController {
  getConventionFiles(req, res) {
    console.log('inner get convention files')
    const conventionID = req.params.id
    const fileType = req.query.fileType
    const path = require('path')
    const responsePath = `uploads/conventions/${conventionID}/${fileType}/`
    const folderPath = path.join(__dirname, '../public/' + responsePath)
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.log('Lỗi khi đọc file trong getconventionfiles: ', err)
        res.status(200).json([])
        return
      }
      const newArr = files.map(item => responsePath + item)
      res.status(200).json(newArr)
    })
  }

  getGroupFiles(req, res) {
    console.log('inner get group files')
    const { groupID, type } = req.params
    const path = require('path')
    const responsePath = `uploads/groups/${groupID}/posts/`
    const folderPath = path.join(__dirname, '../public/' + responsePath)
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.log('Lỗi khi đọc file trong getconventionfiles: ', err)
        res.status(200).json([])
        return
      }
      const foldersArr = files.map(item => responsePath + item + '/' + type + '/')
      const filesArr = []
      console.log('folder arr: ', folderPath)
      foldersArr.forEach(item => {
        const customPath = path.join(__dirname, '../public/' + item)
        console.info('custom path: ', customPath)
        const files = fs.readdirSync(customPath)
        filesArr.push(...files.map(file => item + file))
        console.log('push arr: ', filesArr)
      })
      console.log('finish: ', filesArr)

      res.status(200).json(filesArr.reverse())
    })
  }
}

module.exports = new ResourceController()