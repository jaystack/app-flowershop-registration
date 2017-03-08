import { static as expressStatic } from 'express'
import path = require('path')
import bodyParser = require('body-parser');
import express = require('express');
import * as mongoose from 'mongoose';
//import flash = require('connect-flash')
import request = require('request')

export default function Router() {
  return {
    async start({ app, endpoints, logger, mongodb: db }) {
      const { getServiceAddress } = endpoints
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      //app.use(flash())
      app.set('views', path.join('./views'));
      app.set('view engine', 'hbs');
      app.use(express.static('public'));

      const user = db.collection('users')

      function getUserObj(body: any) {
        return {
          userName: body.signupName,
          password: body.signupPassword,
          email: body.signupEmail,
        }
      }

      app.get('/registration/register', (req, res, next) => {
        console.log("# GET /registration/register")
        //res.sendFile(path.join(__dirname + '/../../views/registration.html'));
        res.render('registration')
      });

      app.post('/registration/register', (req, res, next) => {
        console.log("# POST /registration/register")
        const userObj = getUserObj(req.body);
        console.log(userObj)
        // user.insertOne(userObj)
        //   .then(result => {
        //     console.log(`then: Successful registration!`)
        //     res.redirect('/registration/success')
        //   })
        //   .catch(err => {
        //     console.log(`catch: An error occured during registration!`)
        //     console.log(err)
        //     res.redirect('/registration/error')
        //   })
        request.post(
          {
            url: `http://${endpoints.getServiceAddress('localhost:3003')}/data/user`,
            form: {
              userName: req.body.signupName,
              password: req.body.signupPassword,
              email: req.body.signupEmail
            },
          },
          (err, registrationRes, account) => {
            if (err) return res.redirect('/registration/error') //res.sendStatus(500)
            //if (registrationRes.statusCode !== 201) res.sendStatus(registrationRes.statusCode)
            if (registrationRes.statusCode !== 201) res.status(registrationRes.statusCode)
            res.redirect('/')
          })
      })

      app.get('/registration/success', (req, res, next) => {
        res.render('error', { message: "Successful registration!"})
      })

      app.get('/registration/error', (req, res, next) => {
        res.render('error', { message: "An error occured during registration!"})
      })



      app.post('/registration_wrk', (req, res, next) => {
        console.log("# POST /registration")
        const userObj = getUserObj(req.body);
        console.log(userObj)
        user.insertOne(userObj)
          .then(result => {
            console.log(`then: Successful registration!`)
            request.post(
              {
                url: `http://${endpoints.getServiceAddress('localhost:3000')}/regsuccess`,
                form: {
                  message: 'Successful registration!',
                  error: {}
                },
              }
            )
          })
          .catch(err => {
            console.log(`catch: An error occured during registration!`)
            console.log(err)
            request.post(
              {
                url: `http://${endpoints.getServiceAddress('localhost:3000')}/regerror`,
                form: {
                  message: 'An error occured during registration!',
                  error: err
                },
              }
            )
          })
      })

      app.post('/registration_wrk0', (req, res, next) => {
        console.log("# POST /registration")
        const userObj = getUserObj(req.body);
        console.log(userObj)
        user.insertOne(userObj)
          .then(result => {
            console.log(`then: Successful registration!`)
            //req.flash('message', 'Successful registration!')
            //return res.render('error', { message: req.flash('message') })
            return res.render('error', { message: 'Successful registration!', error: {} })
            //return res.redirect(`http://${getServiceAddress('localhost:9000')}/`)
          })
          .catch(err => {
            console.log(`catch: An error occured during registration!`)
            console.log(err)
            //req.flash('message', 'An error occured during registration! ' + err.message)
            //return res.render('error', { message: req.flash('message') })
            return res.render('error', { message: 'An error occured during registration!', error: err })
            //return res.redirect(`http://${getServiceAddress('localhost:9000')}/`)
          })
      })

      app.post('/registration_old', (req, res, next) => {
        const userObj = getUserObj(req.body);
        user.insertOne(userObj)
          .then(result => {
            //return res.send('Successful registration!')
            // console.log(`then: http://${getServiceAddress('localhost:9000')}/`)
            // res.writeHead(201, {Location: `http://${getServiceAddress('localhost:9000')}/`})
            // return res.end()
            return res.redirect(`http://${getServiceAddress('localhost:9000')}/`)
          })
          .catch(err => {
            //return res.sendStatus(500)
            // console.log(`catch: http://${getServiceAddress('localhost:9000')}/`)
            // console.log(err)
            // res.writeHead(500, {Location: `http://${getServiceAddress('localhost:9000')}/`})
            // return res.end()
            return res.redirect(`http://${getServiceAddress('localhost:9000')}/`)
          })
      });
    }
  }
}