const WS = require("ws");

// Initialize the websocket server
const wssInit = (server) => new WS.Server({ server }).on("connection", onConn);

// If a new connection is established, the onConnection function is called
const onConn = (ws) => {
  jsonSend(ws, "New websocket connection");
  ws.on("message", onMessage(ws));
};

const { stringify, parse } = JSON;

// If a new message is received, the onMessage function is called
const onMessage = (ws) => (message) => {
  jsonSend(ws, message);
};

const jsonSend = (ws, json) => {
  let result = "";
  try {
    result = parse(json);
  } catch {
    result = json.toString();
  }
  ws.send(stringify(result));
};

module.exports = wssInit;
