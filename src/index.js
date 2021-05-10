global.fetch = require('node-fetch')
global.FormData = require('form-data')
global.URLSearchParams = require('url').URLSearchParams

const express = require('express')
const api = express()

const { icalWriter } = require('./icalWriter')

api.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  console.log(req.ip, req.originalUrl)
  next()
})

api.get('/ical/:user', (req, res) => {
  const user = req.params['user']
  res.setHeader('Content-Type', 'text/calendar')

  icalWriter(user, string => res.write(string))
    .then(() => res.send())
    .catch(err => {
      console.error(err)
      res.status(500).end('error will parsing')
    })
})

api.listen(8001)