const path = require('path')
module.exports = {
  "systemEndpoints": {
    "sync": true,
    "host": path.normalize(__dirname + "/../system-endpoints.json")
  },
  "mongodb": {
    "host": "localhost",
    "port": 27017,
    "db": "flowershop"
  }
}