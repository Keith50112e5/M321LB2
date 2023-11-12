document.addEventListener("DOMContentLoaded", async () => {
  const byId = (id) => document.getElementById(id);
  const inputMessage = byId("msg");
  const messageBox = byId("msgs");
  const sendMessage = byId("send");

  const { log, error } = console;
  const token = sessionStorage.getItem("chat_jwt");

  if (!token) return (window.location.href = "/login.html");

  const authorization = "Bearer " + token;

  const socket = new WebSocket("ws://localhost:3000");

  sendMessage.addEventListener("click", () => {
    const { value } = inputMessage;
    log({ authorization, value });
    socket.send(JSON.stringify({ authorization, value }));
  });

  socket.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data?.err) {
      sessionStorage.clear();
      return (window.location.href = "/login.html");
    }
    log(data);
    const html = data
      .map(
        (entry) => `
    <div id="message">
    <div>${entry.name}</div><div>${entry.message}</div>
    </div>
    `
      )
      .join("");
    messageBox.innerHTML = html;
  });

  socket.addEventListener("open", (e) => log("WS connected!"));

  socket.addEventListener("close", (e) => log("WS closed."));

  socket.addEventListener("error", (e) => error("WS error:", e));
});
