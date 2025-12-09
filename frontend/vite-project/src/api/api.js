import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "chatty_token";
const USER_KEY = "chatty_user";

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const client = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// automaticky pridávame Authorization header
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- AUTH ---

export const login = async (username, password) => {
  const res = await client.post("/user/auth/login", { username, password });
  // backend vracia { token, user: { ... } }
  const { token, user } = res.data;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return user; // frontend dostane usera tak ako doteraz
};

export const register = async ({ username, password, firstName, lastName }) => {
  const res = await client.post("/user/register", {
    username,
    password,
    firstName,
    lastName,
  });
  const { token, user } = res.data;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
};

export const logout = async (userId) => {
  try {
    await client.post("/user/logout", null, {
      params: { userId },
    });
  } finally {
    clearSession();
  }
};

// --- USERS ---

export const getUsers = async () => {
  const res = await client.get("/user/users");
  return res.data;
};

// --- ROOMS ---

// GET /rooms?userId=...
export const getRooms = async (userId) => {
  const res = await client.get("/rooms", { params: { userId } });
  return res.data; // [{id,name,direct}]
};

// POST /rooms { name, creatorId, memberIds }
export const createRoom = async ({ name, creatorId, memberIds }) => {
  const res = await client.post("/rooms", { name, creatorId, memberIds });
  return res.data; // {id, name, direct}
};

// GET /rooms/private?userId=&otherId=
export const getOrCreatePrivateRoom = async (userId, otherId) => {
  const res = await client.get("/rooms/private", {
    params: { userId, otherId },
  });
  return res.data; // {id, name, direct}
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
// payload: { fromUserId, roomId, content, tags: string[] }
export const sendMessageToRoom = async (roomId, msg) => {
  const payload = { ...msg, roomId };
  const res = await client.post(`/rooms/${roomId}/messages`, payload);
  console.log(res);
  return res.data;
};

export default client;
