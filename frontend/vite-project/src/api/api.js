import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- AUTH ---
export const login = async (username, password) => {
  const res = await client.post("/user/auth/login", { username, password });
  return res.data;
};

// --- USERS ---
export const getUsers = async () => {
  const res = await client.get("/user/users");
  return res.data;
};

// --- MESSAGES ---
export const sendMessage = async (msg) => {
  const res = await client.post("/messages", msg);
  return res.data;
};

export const getMessages = async (me, other) => {
  console.log(me, other);
  const res = await client.get(`/messages/conversation`, {
    params: {
      userId: me,
      otherId: other,
    },
  });
  return res.data;
};

export default client;
