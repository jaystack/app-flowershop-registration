const { transports } = require('winston')

module.exports = {
  "endpoints": {
    "endpointsFilePath": __dirname + "/../system-endpoints.json"
  },
  "logger": {
    "transportFactories": [
      () => new transports.Console(),
      () => new transports.File({ filename: 'all.log' })
    ]
  },
  "server": {
    "port": 3007
  },
  "mongodb": {
    "db": "flowershop"
  }
}