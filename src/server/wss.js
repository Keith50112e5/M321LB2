const jwt = require("./middlewares/jwt");
const { executeSQL } = require("./database");
const { error } = console;
const WS = require("ws");

// Initialize the websocket server
const wssInit = (server) => new WS.Server({ server }).on("connection", onConn);

// If a new connection is established, the onConnection function is called
const onConn = async (ws) => {
  jsonSend(ws, "New websocket connection");

  const messages = await executeSQL(
    "SELECT name, message  FROM messages, users  WHERE users.id = messages.user_id"
  );
  jsonSend(ws, messages);

  ws.on("message", onMessage(ws));
};

const { stringify, parse } = JSON;

// If a new message is received, the onMessage function is called
const onMessage = (ws) => async (buffer) => {
  const message = buffer.toString();
  const { authorization, value } = parse(message);
  if (!authorization) return;
  const [prefix, token] = authorization.split(" ");

  if (prefix !== "Bearer")
    return jsonSend(ws, { err: "Invalid authorization prefix." });

  let user;

  try {
    user = jwt.verify(token);
  } catch {
    return jsonSend(ws, { err: "JWT expired." });
  }

  const { id } = user;

  if (!id) return jsonSend(ws, { err: "Invalid token." });

  await executeSQL(`INSERT INTO messages (user_id, message) VALUES
  (${id},"${value}");`);

  const result = await await executeSQL(
    "SELECT name, message  FROM messages, users  WHERE users.id = messages.user_id"
  );

  return jsonSend(ws, result);
};

const jsonSend = (ws, json) => {
  ws.send(stringify(json));
};

module.exports = wssInit;
