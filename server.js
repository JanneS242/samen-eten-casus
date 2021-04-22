const express = require("express");
const app = express();

const importData = require("./data.json");

const port = process.env.PORT || 3000
app.get("/", (req,res) => {
  res.send("Hello World. YOU BETTER WORK!");
})

app.get("/classes", (req, res) => {
  res.send(importData);
})