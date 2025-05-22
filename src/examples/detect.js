const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc')
const fs = require('fs')
const path = require('path')

// Khởi tạo Clarifai API với API Key
const stub = ClarifaiStub.grpc()
const metadata = new grpc.Metadata()
metadata.set('authorization', 'Key ca0d8be20b54435d9a6b0b8847b20dfa') // Thay "YOUR_API_KEY" bằng API Key của bạn

// Hàm phân loại ảnh
async function classifyImage(imagePath) {
  try {
    // Đọc dữ liệu ảnh từ local
    const imageBytes = fs.readFileSync(imagePath)

    // Gọi API Clarifai để phân loại ảnh
    const response = await stub.PostModelOutputs(
      {
        user_app_id: {
            "user_id": 'zd9pzz3xjjba',
            "app_id": 'TdmuApp'
        }, // Chọn mô hình nhận diện hình ảnh (ví dụ: general-image-recognition)
        inputs: [
          {
            data: {
              image: {
                base64: imageBytes.toString('base64') // Chuyển ảnh thành dạng base64
              }
            }
          }
        ]
      },
      metadata
    )

    // Kiểm tra kết quả
    if (response.status.code !== 10000) {
      console.error('Lỗi khi phân loại ảnh:', response.status.description)
      return
    }

    console.log('Kết quả nhận diện ảnh:')
    response.outputs[0].data.concepts.forEach(concept => {
      console.log(`${concept.name} (Confidence: ${concept.value})`)
    })
  } catch (error) {
    console.error('Lỗi:', error)
  }
}

// Sử dụng hàm để phân loại ảnh
const detecting = () => {
  const imagePath = path.join(__dirname, '../public/uploads/static/ga.jpg') // Đường dẫn tới ảnh trên máy local
  classifyImage(imagePath)
}

module.exports = {
    detecting
}