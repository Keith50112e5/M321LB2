document.addEventListener("DOMContentLoaded", async () => {
  const byId = (id) => document.getElementById(id);
  const inputName = byId("name");
  const buttonLogin = byId("submit");
  const errorBox = byId("err");

  const method = "POST";
  const headers = { "Content-Type": "application/json" };

  buttonLogin.addEventListener("click", async () => {
    const name = inputName.value;

    const body = JSON.stringify({ name });
    const res = await fetch("/api/login", {
      method,
      headers,
      body,
    });

    const { token, err } = await res.json();
    if (err) return (errorBox.innerHTML = err);
    sessionStorage.setItem("chat_jwt", token);
    window.location.href = "/";
  });
});
