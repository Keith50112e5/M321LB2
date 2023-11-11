const api = require("express").Router();
const jwt = require("./middlewares/jwt");
const { executeSQL } = require("./database");

api.post("/login", async (req, res) => {
  const { name } = req.body;

  const user = await executeSQL(`SELECT * FROM users WHERE name="${name}";`);

  if (user.length < 1)
    return res.json({ err: "User doesn't exist" }).status(400);

  const { id } = user[0];
  const token = jwt.sign({ id, name });
  res.json({ token });
});

api.get("/room", (req, res) => {});

module.exports = api;
