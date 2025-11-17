const API = import.meta.env.VITE_API_URL;

export const login = async (username) =>
  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  }).then((res) => res.json());

export const getUsers = () => fetch(`${API}/users`).then((res) => res.json());

export const sendMessage = (msg) =>
  fetch(`${API}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  }).then((res) => res.json());

export const getMessages = (me, other) =>
  fetch(`${API}/messages?user=${me}&with=${other}`).then((res) => res.json());
