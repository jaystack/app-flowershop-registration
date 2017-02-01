import * as express from 'express';
import * as path from 'path';
import { getServiceAddress } from 'system-endpoints';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as config from 'config';

import User from './user';

declare var __dirname;
declare var process;

function getUserObj(body: any) {
  return {
    userName: body.signupName,
    password: body.signupPassword,
    email: body.signupEmail
  }
}

function insertToDb(userObj):void {
  const user = new User(userObj);

  user.save((error: Error) => {
    if (error) return console.log("Error", error);
    return console.log("successful save");
  });
}

function createMongoConnetionString({host, port, db}, endpointAddress: string) {
  const address = endpointAddress || `${host}:${port}`;
  return `mongodb://${address}/${db}`;
}

function createMongoConnection(mongoConfig) {
  const endpointAddress = getServiceAddress('localhost:27017');
  const connectionUri = createMongoConnetionString(mongoConfig, endpointAddress);
  mongoose.connect(connectionUri);
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/registration', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/../views/registration.html'));
});

app.post('/registration', (req, res, next) => {
  insertToDb(getUserObj(req.body));
  return res.send('Successful registration!')
});

app.listen(3007, () => {
  console.log('Registration service has started! Port: 3007');
  const mongoConfig = config.get('mongodb')
  createMongoConnection(mongoConfig)
});