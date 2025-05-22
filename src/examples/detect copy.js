//index.js file

////////////////////////////////////////////////////////////////////////////////////
// In this section, we set the user authentication, app ID, and input URL.
// Change these strings to run your own example.
////////////////////////////////////////////////////////////////////////////////////
const path = require('path')
const fs = require('fs')

const USER_ID = 'TdmuApp'
// Your PAT (Personal Access Token) can be found in the Account's Security section
const PAT = 'ca0d8be20b54435d9a6b0b8847b20dfa'
const APP_ID = 'TdmuApp'
// Change this to whatever image input you want to add
const IMAGE_URL = path.join(__dirname, '../public/uploads/static/ga.jpg') // Đường dẫn tới ảnh trên máy local
// const IMAGE_URL = 'https://sylvanlearning.edu.vn/wp-content/uploads/2021/10/3-1.jpg'

///////////////////////////////////////////////////////////////////////////////////
// YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
///////////////////////////////////////////////////////////////////////////////////

const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc')

const stub = ClarifaiStub.grpc()

// This will be used by every Clarifai endpoint call
const metadata = new grpc.Metadata()
metadata.set('authorization', 'Key ' + PAT)
const imageBytes = fs.readFileSync(IMAGE_URL)

const delectLabel = async () => {
      const inputs = [{ data: { base64: imageBytes.toString('base64') } }]
  predictImage(inputs)
}


function predictImage(inputs) {
      stub.PostModelOutputs(
          {
              // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
              model_id: "aaa03c23b3724a16a56b629203edc62c",
              inputs: inputs
          },
          metadata,
          (err, response) => {
              if (err) {
                  console.log("Error: " + err);
                  return;
              }

              if (response.status.code !== 10000) {
                  console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                  return;
              }

              let results = [];
              for (const c of response.outputs[0].data.concepts) {
                  results.push({
                      name: c.name,
                      value: c.value
                  })
              }
          }
  )
}

module.exports = {
  detectLabel: delectLabel
}
