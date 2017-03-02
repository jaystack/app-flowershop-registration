import mongoose = require('mongoose')
import { userSchema } from './userSchema'

export const users = mongoose.model('users', userSchema)