import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import ApiError from '~/utils/ApiError'

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    _id: { type: mongoose.Types.ObjectId },
    userName: { type: String },
    searchName: { type: String },
    email: { type: String },
    phone: { type: String },
    avatar: { type: String },
    bio: { type: String, default: null },
    background: { type: String, default: null },
    sex: { type: Boolean },
    age: { type: Number },
    active: { type: Boolean, default: true },
    fcmToken: { type: String, default: null }
  },
  { timestamps: true }
)
userSchema.index({ searchName: 'text' })
const userModelInstance = mongoose.model('User', userSchema)

const loginWithEmail = async email => {
  const user = await userModelInstance.findOne({ email })
  return user
}

const loginWithUserId = async userId => {
  const user = await userModelInstance.findById(userId)
  return user
}

const register = async userData => {
  const user = await userModelInstance.create(userData)
  return user
}

const getUserById = async userId => {
  const user = await userModelInstance.findById(userId)
  return user
}

const update = async (userId, updateData) => {
  const updatedUser = userModelInstance.findByIdAndUpdate(
    userId,
    {
      $set: updateData
    },
    { returnDocument: 'after' }
  )
}

export const userModel = {
  loginWithEmail,
  loginWithUserId,
  register,
  getUserById,
  update
}
