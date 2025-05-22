import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import path from 'path'
import socket, { Server } from 'socket.io'
import http from 'http'
import firebaseAdmin from 'firebase-admin'
import { DATABASE } from './config/mongodb'
import serviceAccount from './config/firebase-admin-account-key.json'
import SocketServer from './socket'
import { HOST, PORT } from './utils/constants'
// import { v1Router } from './routes/v1'
import router from './routes'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
// app.use('/v1', v1Router)
DATABASE.CONNECT()

const httpServer = http.createServer(app)
const socketServerInstance = new Server(httpServer, { cors: {} })
// SocketServer.runSocketServer(socketServerInstance)
SocketServer.runSocketServer(httpServer)
app.use(router)

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
})

httpServer.listen(PORT, HOST, async () => {
  console.log(`Server is running on: http://${HOST}:${PORT}`)
})
