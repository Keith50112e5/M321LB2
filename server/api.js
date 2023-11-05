const api = require("express").Router();

api.get("/hello", (req, res) => {
  res.json("Hello World!");
});

module.exports = api;
