document.addEventListener("DOMContentLoaded", async () => {
  const byId = (id) => document.getElementById(id);
  const inputMessage = byId("msg");
  const messageBox = byId("msgs");
  const sendMessage = byId("send");
  const chatters = byId("chatters");
  const renameButton = byId("rename");

  const { log, error } = console;
  const { parse, stringify } = JSON;
  const token = sessionStorage.getItem("chat_jwt");

  if (!token) return (window.location.href = "/login.html");

  const authorization = "Bearer " + token;

  const socket = new WebSocket("ws://localhost:3000");

  renameButton.addEventListener("click", () => {
    const name = prompt("What's your new name?");
    if (name.length < 1) return alert("Name can't be empty.");
    const confirmName = confirm("Your new name is " + name);
    if (!confirmName) return alert("Renaming canceled.");
    socket.send(stringify({ type: "rename", authorization, value: name }));
  });

  sendMessage.addEventListener("click", () => {
    const { value } = inputMessage;
    inputMessage.value = "";
    socket.send(stringify({ type: "message", authorization, value }));
  });

  socket.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data?.err) {
      sessionStorage.clear();
      return (window.location.href = "/login.html");
    }
    const { chatInit, active, chat } = data;
    if (!!active) {
      const html =
        "<p>chatters:</p>" +
        active.map((user) => `<div id="message">${user}</div>`).join("");
      chatters.innerHTML = html;
    }
    if (!!chatInit) {
      const html = chatInit
        .map(
          (entry) => `<div id="message">
          <b>${entry.name}</b><div>${entry.message}</div>
          </div>`
        )
        .join("");
      messageBox.innerHTML = html;
    }
    if (!!chat) {
      messageBox.innerHTML += `<div id="message">
      <b>${chat.name}</b><div>${chat.value}</div>
      </div>`;
    }
    if (!!token) {
      sessionStorage.removeItem("chat_jwt");
      sessionStorage.setItem("chat_jwt", token);
    }
  });

  socket.addEventListener("open", (e) => {
    log("WS connected!");
    setTimeout(
      () => socket.send(stringify({ type: "activate", authorization })),
      100
    );
  });

  socket.addEventListener("close", (e) => {
    log("WS closed.");
  });

  socket.addEventListener("error", (e) => error("WS error:", e));
});
