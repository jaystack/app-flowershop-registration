import * as mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  email: String,
})
