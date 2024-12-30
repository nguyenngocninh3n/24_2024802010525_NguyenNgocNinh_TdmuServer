const dotenv = require('dotenv')
const fs = require('fs')
const vision = require('@google-cloud/vision')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

const result = dotenv.config()
if (result.error) {
  console.error('Error loading .env file', result.error)
  process.exit(1)
}

const client = new vision.ImageAnnotatorClient()

async function tagImage(imagePath) {

  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`)
    }
    const [result] = await client.labelDetection(imagePath)
    if (!result.labelAnnotations || result.labelAnnotations.length === 0) {
      console.warn('No labels detected')
      return []
    }

    const labels = result.labelAnnotations.map(label => label.description)
    const transLabels = await translateText(labels)
    console.log('Labels detected:', labels)
    const detectTextString = await detectText(imagePath)

    return [labels, transLabels, detectTextString]
  } catch (error) {
    console.error('Error tagging image:', error)
    throw error
  }
}

async function tagVideo(videoPath) {
  const tempDir = path.join(__dirname, '../temp_frames')
  fs.mkdirSync(tempDir, { recursive: true })

  return new Promise((resolve, reject) => {
    const labels = new Set()


    ffmpeg(videoPath)
      .on('end', async () => {
        const frameFiles = fs.readdirSync(tempDir)

        try {
          for (const file of frameFiles) {
            const framePath = path.join(tempDir, file)
            const tags = await tagImage(framePath)
            tags.forEach(tag => labels.add(tag))
            fs.unlinkSync(framePath) // Xóa frame sau khi xử lý
          }

          fs.rmdirSync(tempDir, { recursive: true }) // Xóa thư mục tạm
          resolve([...labels])
        } catch (error) {
          reject(error)
        }
      })
      .on('error', error => reject(error))
      .screenshots({
        count: 10, // Số frame cần phân tích
        folder: tempDir,
        filename: 'frame-%i.png'
      })
  })
}

async function detectText(imagePath) {
  try {
    const [result] = await client.textDetection(imagePath)
    const detections = result.textAnnotations

    if (detections.length > 0) {
      console.log('Detected text:')
      console.log(detections[0].description)
      return detections[0].description
    } else {
      return ''
    }
  } catch (error) {
    console.error('Error detecting text:', error)
  }
}

async function detectTextType2(imagePath) {
  try {
    // Gửi yêu cầu nhận diện văn bản tài liệu
    const [result] = await client.documentTextDetection(imagePath)
    const fullText = result.fullTextAnnotation

    if (fullText) {
      console.log('Detected document text:')
      console.log(fullText.text) // Toàn bộ văn bản nhận diện
    } else {
      console.log('No document text detected.')
    }
  } catch (error) {
    console.error('Error detecting document text:', error)
  }
}



const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate();


async function translateText(text, source, target ) {
  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  let [translations] = await translate.translate(text, target ?? 'vi');
  const results = Array.isArray(translations) ? translations : [translations];
  console.log('Translations: ', results);
  return results

}



module.exports = { tagImage, tagVideo, detectText, detectTextType2, translateText }
