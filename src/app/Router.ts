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
        let cart, regResult

        if (!!req.cookies && !!req.cookies["fs_cart"]) cart = (<any>req).cookies["fs_cart"]
        if (!cart) cart = { created: new Date(), items: [] }
        req['cart'] = cart
        console.log('#cart:')
        console.log(cart)

        if (!!req.cookies && !!req.cookies["fs_reg_result"]) regResult = (<any>req).cookies["fs_reg_result"]
        if (!regResult) regResult = {
          message: "",
          error: {},
          showRegisterButton: true,
          showRegResult: false,
          isError: false
        }
        req['reg_result'] = regResult
        console.log('#reg_result:')
        console.log(regResult)

        next()
      })

      router.post('/registration', (req, res, next) => {
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
          (error, userRes, user) => {
            console.log("(#POST) /registration/registration")
            console.log(error)
            console.log(userRes.statusCode)
            console.log(user)
            let message
            if (error) {
              logger.error(error)
              message = "An error occured during registration!"
            } else {
              message = "Successful registration!"
            }
            req['reg_result'] = {
              message,
              error,
              showRegisterButton: false,
              showRegResult: true,
              isError: (error) ? true : false
            }
            res.cookie('fs_reg_result', req['reg_result']).redirect('/')
          })
      })

      router.get('/register', (req, res, next) => {
        console.log("# GET /registration/register")
        res.render('register', req['reg_result'])
      });

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
          data = { ...data, ...req['reg_result'], isError: (err) ? true : false }
          res.render('registration', data)
        })
      });

      router.get('/registrationresults', (req, res, next) => {
        req['reg_result'] = {
          message: "",
          error: {},
          showRegisterButton: true,
          showRegResult: false
        }
        res.cookie('fs_reg_result', req['reg_result']).redirect('/')
      })

      router.get('/success', (req, res, next) => {
        res.render('error', { message: "Successful registration!" })
      })

      router.get('/error', (req, res, next) => {
        res.render('error', { message: "An error occured during registration!" })
      })

      app.use('/registration/', router)
    }
  }
}