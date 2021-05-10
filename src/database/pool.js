const mysql = require('mysql')

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'studenthome_user',
  password: 'secret',
  database: 'studenthome'
})

pool.getConnection((err, connection) => {
  if (err) throw err // not connected!

  // Use the connection
  connection.query('SELECT * FROM studenthome', (error, results, fields) => {
    // When done with the connection, release it.
    connection.release()

    // Handle error after the release.
    if (error) throw error

    console.log('results: ', results)
    // Don't use the connection here, it has been returned to the pool.
  })
})