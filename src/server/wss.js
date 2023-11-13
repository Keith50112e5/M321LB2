const jwt = require("./middlewares/jwt");
const { executeSQL } = require("./database");
const { stringify, parse } = JSON;
const WS = require("ws");
let wss;

const all10min = () => Math.round(Date.now() / 1000 / 60 / 2);

// Initialize the websocket server
const wssInit = (server) => {
  wss = new WS.Server({ server });
  wss.on("connection", onConn);
};

const userInit = async () =>
  await executeSQL(`SELECT name FROM users WHERE active > ${all10min()};`);

// If a new connection is established, the onConnection function is called
const onConn = async (ws) => {
  jsonSend(ws, "New websocket connection");

  const chatInit = await executeSQL(
    "SELECT name,message FROM messages,users WHERE users.id=messages.user_id;"
  );
  jsonSend(ws, { chatInit, userInit: await userInit() });

  ws.on("message", onMessage(ws));
};

// If a new message is received, the onMessage function is called
const onMessage = (ws) => async (buffer) => {
  const message = buffer.toString();
  const { authorization, value } = parse(message);

  const { data, err } = jwt.completeVerify(authorization);
  if (!!err) return jsonSend(ws, { err });
  const { id, name } = data;

  if (!!value) {
    await executeSQL(`INSERT INTO messages (user_id, message) VALUES
    (${id},"${value}");`);

    wss.clients.forEach(
      broadcast({ chat: { name, value }, userInit: await userInit() })
    );
  }
  await executeSQL(`UPDATE users SET active=${all10min() + 2} WHERE id=${id}`);
  wss.clients.forEach(broadcast({ userInit: await userInit() }));
};

const broadcast = (message) => async (ws) => {
  jsonSend(ws, message);
};

const jsonSend = (ws, json) => ws.send(stringify(json));

module.exports = wssInit;
