const Clarifai = require('clarifai')
const app = new Clarifai.App({ apiKey: '' })

const detectImage = () => {
    app.models
  .predict(Clarifai.GENERAL_MODEL, '../public/uploads/static/ga.jpg')
  .then(response => {
    response.outputs[0].data.concepts.forEach(concept => {
      console.log('ket qua label detecting: ', concept.name, concept.value)
    })
  })
  .catch(err => console.error(err))

}

module.exports = {
    detectImage
}