import { Schema, model } from 'mongoose';

const ObjectId = Schema.ObjectId;

const User = new Schema({
  userName: String,
  password: String,
  email: String
});

export default model('User', User);