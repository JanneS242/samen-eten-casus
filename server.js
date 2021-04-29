var logger = require('tracer').console()

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

require('./routes/studenthome.routes')(app)

require('./routes/error.routes')(app)

require('./routes/meal.routes')(app)

require('./routes/user.routes')(app)

const port = process.env.PORT || 3000

app.use(express.json());

//Home-page
app.get("/", (req,res) => {
  logger.log("Welcome page called")
  res.send("Welcome!");
})

app.listen(port, () => {
  logger.log(`Listening on port http://localhost:${port}`)
})