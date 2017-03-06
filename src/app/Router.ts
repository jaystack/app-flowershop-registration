import { static as expressStatic } from 'express'
import path = require('path')
import bodyParser = require('body-parser');
import express = require('express');
import * as mongoose from 'mongoose';

export default function Router() {
  return {
    async start({ app, endpoints, logger, mongodb: db }) {
      const { getServiceAddress } = endpoints
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(express.static('public'));

      const user = db.collection('users')

      function getUserObj(body: any) {
        return {
          userName: body.signupName,
          password: body.signupPassword,
          email: body.signupEmail,
        }
      }

      app.get('/registration', (req, res, next) => {
        res.sendFile(path.join(__dirname + '/../../views/registration.html'));
      });

      app.post('/registration', (req, res, next) => {
        const userObj = getUserObj(req.body);
        user.insertOne(userObj)
          .then(result => {
            //return res.send('Successful registration!')
            console.log(`then: http://${getServiceAddress('localhost:9000')}/`)
            // res.writeHead(201, {Location: `http://${getServiceAddress('localhost:9000')}/`})
            // return res.end()
            return res.redirect(`http://${getServiceAddress('localhost:9000')}/`)
          })
          .catch(err => {
            //return res.sendStatus(500)
            console.log(`catch: http://${getServiceAddress('localhost:9000')}/`)
            console.log(err)
            // res.writeHead(500, {Location: `http://${getServiceAddress('localhost:9000')}/`})
            // return res.end()
            return res.redirect(`http://${getServiceAddress('localhost:9000')}/`)
          })
      });
    }
  }
}