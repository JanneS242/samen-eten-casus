const mysql = require('mysql')
const dbconfig = require('./config').dbconfig

const pool = mysql.createPool(dbconfig)

module.exports = pool