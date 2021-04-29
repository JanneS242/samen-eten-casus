var logger = require('tracer').console()

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const importInfoData = require("./infoData.json");

const port = process.env.PORT || 3000

app.use(express.json());

require('./routes/studenthome.routes')(app)

require('./routes/error.routes')(app)

//Home-page
app.get("/", (req,res) => {
  logger.log("Welcome page called")
  res.send("Welcome!");
})

//Info about maker-page
app.get("/api/info", (req, res) => {
  logger.log("Info page called")
  res.status(200).send(importInfoData);
})


app.listen(port, () => {
  logger.log(`Listening on port http://localhost:${port}`)
})