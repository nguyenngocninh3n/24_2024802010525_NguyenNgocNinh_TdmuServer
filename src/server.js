const express = require('express')
const app = express()

//connect database
const database = require('./config/mongodb')
database.mongooseConnect()

//cor
const cors = require('cors')
app.use(cors())

//xử lý form post - send data in body
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
//**??? */
const bodyParser = require('body-parser')
// Middleware để phân tích dữ liệu JSON
app.use(bodyParser.json({limit: '50mb'}));


//static file
const path = require('path')
app.use(express.static(path.join(__dirname,"public")))
console.log('static path: ', __dirname)

// middleware for resfull api
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//router
const routes =  require('./routes/')
const { HOST, PORT, TYPE_SCREEN } = require('./utils/constants')
routes(app)

//socket
const SocketServer = require('./socket')
const {createServer} = require('http')
const server = createServer(app)
SocketServer.runSocketServer(server)

//firebase cloud messaging
const admin = require('firebase-admin');
const serviceAccount = require('./config/server-account-key.json');
const { detectImage } = require('./examples')
const { detecting } = require('./examples/detect')
const { detectLabel } = require('./examples/detect copy')
const { translate, translateText } = require('./controllers/vision')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



server.listen(PORT, HOST,async  () => {
  console.log(`Server is running on: http://${HOST}:${PORT}`)
})