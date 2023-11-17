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
    "SELECT users.name,messages.message FROM messages LEFT JOIN users ON messages.user_id=users.id;"
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
  if (type === "activate") {
    ws.on("close", onClose(name));
    active = [...active, name];
    wss.clients.forEach(broadcast({ active }));
  } else if (type === "message") {
    await executeSQL(`INSERT INTO messages (user_id, message) VALUES
    (${id},"${value}");`);

    return wss.clients.forEach(
      broadcast({
        chat: { name, value },
        active,
      })
    );
  } else if (type === "rename") {
    await executeSQL(`UPDATE users SET name="${value}" WHERE id=${id};`);
    const data = { id, name: value };
    const token = jwt.sign({ data });

    active = active.map((user) => (user === name ? value : user));

    const chatInit = await executeSQL(
      "SELECT users.name,messages.message FROM messages LEFT JOIN users ON messages.user_id=users.id;"
    );

    return wss.clients.forEach(
      broadcast({
        chatInit,
        active,
        token,
      })
    );
  }
};

const onClose = (name) => () => {
  active = active.filter((user) => user !== name);
  wss.clients.forEach(broadcast({ active }));
};

const broadcast = (message) => (ws) => {
  jsonSend(ws, message);
};

const jsonSend = (ws, json) => ws.send(stringify(json));

module.exports = wssInit;
