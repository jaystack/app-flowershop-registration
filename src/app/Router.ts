import { static as expressStatic } from 'express'
import path = require('path')
import bodyParser = require('body-parser')
import cookieParser = require('cookie-parser')
import express = require('express')
import * as mongoose from 'mongoose'
//import flash = require('connect-flash')
import request = require('request')

import morganLogger = require('morgan')

export default function Router() {
  return {
    async start({ app, endpoints, logger, mongodb: db }) {
      const { getServiceAddress } = endpoints
      app.use(morganLogger('dev'))
      app.use(bodyParser.json())
      app.use(bodyParser.urlencoded({ extended: false }))
      app.use(cookieParser())
      //app.use(flash())
      app.set('views', path.join('./views'))
      app.set('view engine', 'hbs')
      app.use(express.static('public'))

      const user = db.collection('users')

      function getUserObj(body: any) {
        return {
          userName: body.signupName,
          password: body.signupPassword,
          email: body.signupEmail,
        }
      }

      const getFlowersById = ((ids: Array<string>, clb: Function) => {
        let p = ids.map(flowerId => new Promise((resolv, reject) => {
          request.get({ url: `http://${endpoints.getServiceAddress('localhost:3003')}/data/flower(${flowerId})`, timeout: 4000 },
            (err, catRes, flower) => {
              //console.log(`# flower: ${JSON.stringify(flower)}`)
              if (err) {console.log(err); return reject(err)}
              resolv(JSON.parse(flower))
            })
        }))
        Promise.all(p)
          .then((flowers) => { clb(null, flowers) })
          .catch((err) => { clb(err) })
      })

      const router = express.Router()

      router.use((req, res, next) => {
        let cart
        if (!!req.cookies && !!req.cookies["fs_cart"]) cart = (<any>req).cookies["fs_cart"]
        if (!cart) cart = { created: new Date(), items: [] }
        req['cart'] = cart
        console.log('#cart:')
        console.log(cart)
        next()
      })

      router.post('^(/|/registration)$', (req, res, next) => {
        console.log("# POST /registration/registration")
        const userObj = getUserObj(req.body);
        console.log(userObj)
        request.post(
          {
            url: `http://${endpoints.getServiceAddress('localhost:3003')}/data/user`,
            form: {
              userName: req.body.signupName,
              password: req.body.signupPassword,
              email: req.body.signupEmail
            },
          },
          (err, userRes, user) => {
            console.log("(#POST) /registration/registration")
            console.log(err)
            console.log(userRes.statusCode)
            console.log(user)
            getFlowersById(req['cart'].items, (err, flowers) => {
              console.log(`flowers: ${JSON.stringify(flowers)}`)
              //if (err) { console.log(err); return res.sendStatus(500) }
              let data = (!err || flowers.length > 0)
                ? {
                  cartValue: (flowers.reduce((a, b) => a + (b ? b.Price : 0), 0)).toFixed(2),
                  cartItems: flowers,
                }
                : { cartValue: 0, cartItems:[] }
              //res.render('error', { ...data, message: 'An error occured during registration!', error: err })
              if (err) {
                //return res.redirect('/registration/error') //res.sendStatus(500)
                return res.render('error', { ...data, message: 'An error occured during registration!', error: err })
              }
              //if (userRes.statusCode !== 201) res.sendStatus(userRes.statusCode)
              if (userRes.statusCode !== 201) res.status(userRes.statusCode)
              //res.redirect('/registration/success')
              res.render('error', { ...data, message: "Successful registration!" })
            })
          })
      })

      router.get('^(/|/registration)$', (req, res, next) => {
        console.log("# GET /registration/registration")
        //res.sendFile(path.join(__dirname + '/../../views/registration.html'));
        getFlowersById(req['cart'].items, (err, flowers) => {
          console.log(`flowers: ${JSON.stringify(flowers)}`)
          //if (err) { console.log(err); return res.sendStatus(500) }
          let data = (!err || flowers.length > 0)
            ? {
              cartValue: (flowers.reduce((a, b) => a + (b ? b.Price : 0), 0)).toFixed(2),
              cartItems: flowers,
            }
            : { cartValue: 0, cartItems:[] }
          res.render('registration', data)
        })
      });

      router.get('/success', (req, res, next) => {
        res.render('error', { message: "Successful registration!" })
      })

      router.get('/error', (req, res, next) => {
        res.render('error', { message: "An error occured during registration!" })
      })

      app.use('/registration/', router)


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