const jwt = require("./middlewares/jwt");
const { executeSQL } = require("./database");
const { stringify, parse } = JSON;
const WS = require("ws");
let wss;

let active = [];

const everyMin = (min) => Math.round(Date.now() / 1000 / 60 / min);

// Initialize the websocket server
const wssInit = (server) => {
  wss = new WS.Server({ server });
  wss.on("connection", onConn);
};

// If a new connection is established, the onConnection function is called
const onConn = async (ws) => {
  jsonSend(ws, "New websocket connection");

  const chatInit = await executeSQL(
    "SELECT name,message FROM messages,users WHERE users.id=messages.user_id;"
  );

  jsonSend(ws, { chatInit });

  ws.on("message", onMessage(ws));
};

// If a new message is received, the onMessage function is called
const onMessage = (ws) => async (buffer) => {
  const message = buffer.toString();
  const { authorization, value, type } = parse(message);

  const { data, err } = jwt.completeVerify(authorization);
  if (!!err) return jsonSend(ws, { err });
  const { id, name } = data;

  if (type === "message") {
    await executeSQL(`INSERT INTO messages (user_id, message) VALUES
    (${id},"${value}");`);

    return wss.clients.forEach(
      broadcast({
        chat: { name, value },
        active,
      })
    );
  } else if (type === "activate") {
    ws.on("close", onClose(name));
    active = [...active, name];
    wss.clients.forEach(broadcast({ active }));
  }
};

const onClose = (name) => () => {
  active = active.filter((value) => value !== name);
  wss.clients.forEach(broadcast({ active }));
};

const broadcast = (message) => (ws) => {
  jsonSend(ws, message);
};

const jsonSend = (ws, json) => ws.send(stringify(json));

module.exports = wssInit;
