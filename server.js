var logger = require("tracer").console();

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

require("./src/routes/studenthome.routes")(app);

require("./src/routes/meal.routes")(app);

require("./src/routes/user.routes")(app);

require("./src/routes/error.routes")(app);
const port = process.env.PORT || 3000;

app.use(express.json());

//Home-page
app.get("/", (req, res) => {
  logger.log("Welcome page called");
  res.send("Welcome!");
});

app.listen(port, () => {
  logger.log(`Listening on port http://localhost:${port}`);
});

module.exports = app;
