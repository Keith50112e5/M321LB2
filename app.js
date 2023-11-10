require("dotenv").config();
const express = require("express"),
  app = express(),
  server = require("http").createServer(app), // Create the express server
  env = process.env.NODE_ENV || "development",
  serverPort = process.env.PORT || 3000,
  listenOn = `Express Server started on http://localhost:${serverPort}/ as '${env}' Environment`,
  liveReloadServer = require("livereload").createServer(),
  { initializeDB } = require("./server/database");

// create a livereload server
if (env !== "production") {
  const lrsRefresh = () => setTimeout(() => liveReloadServer.refresh("/"), 100);
  liveReloadServer.server.once("connection", lrsRefresh);
  // use livereload middleware
  app.use(require("connect-livereload")());
}

app.use(express.json());

// deliver static files from the client folder like css, js, images
app.use(express.static("client"));

// route for the homepage
app.get("/", (req, res) => res.sendFile(__dirname + "/client/index.html"));

// Initialize the websocket server
require("./server/wss")(server);

// Initialize the REST api
app.use("/api", require("./server/api"));

// Initialize the database
initializeDB().catch((err) => console.error(err));

//start the web server
server.listen(serverPort, () => console.log(listenOn));
