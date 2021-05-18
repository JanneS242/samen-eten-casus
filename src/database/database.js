const mysql = require('mysql')
var logger = require("tracer").console();
const dbconfig = require('./config').dbconfig

const pool = mysql.createPool(dbconfig)

pool.on('connection', function (connection) {
  logger.trace('Database connection established')
})

pool.on('acquire', function (connection) {
  logger.trace('Database connection aquired')
})

pool.on('release', function (connection) {
  logger.trace('Database connection released')
})

module.exports = pool


