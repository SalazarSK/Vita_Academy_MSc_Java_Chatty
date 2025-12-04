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

export const logout = async (userId) => {
  return client.post("/user/logout", null, {
    params: { userId },
  });
};

export const register = async ({ username, password, firstName, lastName }) => {
  const res = await client.post("/user/register", {
    username,
    password,
    firstName,
    lastName,
  });
  return res.data;
};

// --- USERS ---
export const getUsers = async () => {
  const res = await client.get("/user/users");
  return res.data;
};

// --- ROOMS ---
export const getRooms = async () => {
  const res = await client.get("/rooms");
  return res.data;
};

// --- MESSAGES (ROOM-BASED) ---

// GET /rooms/{roomId}/messages?userId=...&tag=...
export const getMessagesForRoom = async (roomId, userId, tag) => {
  const params = { userId };
  if (tag) params.tag = tag;

  const res = await client.get(`/rooms/${roomId}/messages`, { params });
  return res.data;
};

// POST /rooms/{roomId}/messages
// payload: { fromUserId, content, tags: string[] }
export const sendMessageToRoom = async (roomId, msg) => {
  const res = await client.post(`/rooms/${roomId}/messages`, msg);
  return res.data;
};

export default client;
