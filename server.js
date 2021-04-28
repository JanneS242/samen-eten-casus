var logger = require('tracer').console()

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const importInfoData = require("./infoData.json");

const port = process.env.PORT || 3000

app.use(express.json());

require('./routes/studenthome.routes')(app)

//Error message
app.use("*", (error, req, res, next) => {
  console.log("Errorhandler called!")
  logger.error(error);

  res.status(error.errCode).send({
    error: "Some error occurred",
    message : error.message
  })

})

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

//General error message
app.all("*", (req, res) => {
  logger.log("Catch-all endpoint aangeroepen")
  res.status(400).send("Endpoint " +req.url+ " does not exists")
})

app.listen(port, () => {
  logger.log("Example app is listening on port 3000")
})