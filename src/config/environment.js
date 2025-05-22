import dotenv from 'dotenv/config'
const environment = {
  DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING,
  DATABASE_APPNAME: process.env.DATABASE_APPNAME,

  CHATGPT_API_KEY: process.env.CHATGPT_API_KEY,

  BUILD_MODE: 'dev',
}

export const env = environment
