import mongoose from 'mongoose'
import { env } from './environment'
async function CONNECT() {
  await mongoose
    .connect(env.DATABASE_CONNECTION_STRING, { autoIndex: true, appName: env.DATABASE_APPNAME })
    .then(() => console.log('access to database successfully'))
    .catch(error => console.log('error when connect to mongodb: ', error))
}
 export const DATABASE = {
  CONNECT
}
