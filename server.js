var logger = require("tracer").console();

const express = require("express");

const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.use(express.json());

// Add CORS headers
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,authorization'
  )
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})


//Home-page
app.get("/", (req, res) => {
  logger.log("Welcome page called");
  res.send("Welcome!");
});

app.listen(port, () => {
  logger.log(`Listening on port http://localhost:${port}`);
});

require("./src/routes/studenthome.routes")(app);

require("./src/routes/meal.routes")(app);

require("./src/routes/authentication.routes")(app);

require("./src/routes/error.routes")(app);

module.exports = app;
