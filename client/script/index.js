document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("chat_jwt");

  if (!token) return (window.location.href = "/login.html");

  const authorization = "Bearer " + token;

  const socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("open", (event) => {
    console.log("WebSocket connected!");
    socket.send("Hello, server!");
  });

  socket.addEventListener("message", (event) => {
    console.log(`Received message: ${event.data}`);
  });

  socket.addEventListener("close", (event) => {
    console.log("WebSocket closed.");
  });

  socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
  });
});
