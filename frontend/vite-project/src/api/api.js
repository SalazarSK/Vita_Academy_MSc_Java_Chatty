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
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401 || status === 403) {
      clearSession();
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(err);
  }
);
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- AUTH ---
export const login = async (username, password) => {
  const res = await client.post("/user/auth/login", { username, password });
  const { token, user } = res.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
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
    await client.post("/user/logout", null, { params: { userId } });
  } finally {
    clearSession();
  }
};

// --- USERS ---
export const getUsers = async () => {
  const res = await client.get("/user/users");
  return res.data; // [{id, username, firstName, lastName, online}]
};

// --- ROOMS ---
export const getRooms = async (userId) => {
  const res = await client.get("/rooms", { params: { userId } });
  return res.data; // [{id,name,direct}]
};

export const createRoom = async ({ name, creatorId, memberIds }) => {
  const res = await client.post("/rooms", { name, creatorId, memberIds });
  return res.data;
};

export const getOrCreatePrivateRoom = async (userId, otherId) => {
  const res = await client.get("/rooms/private", {
    params: { userId, otherId },
  });
  return res.data;
};

// --- MESSAGES ---
export const getMessagesForRoom = async (roomId, userId, tag) => {
  const params = { userId };
  if (tag) params.tag = tag;
  const res = await client.get(`/rooms/${roomId}/messages`, { params });
  return res.data;
};

export const getMessagesForRoomByTopic = async (roomId, userId, topicId) => {
  const res = await client.get(`/rooms/${roomId}/messages`, {
    params: { userId, topicId },
  });
  return res.data;
};

export const sendMessageToRoom = async (roomId, msg) => {
  const payload = { ...msg, roomId };
  const res = await client.post(`/rooms/${roomId}/messages`, payload);
  return res.data;
};

// --- TOPICS ---
export const getTopics = async (roomId) => {
  const res = await client.get(`/rooms/${roomId}/topics`);
  return res.data;
};

export const createTopic = async (roomId, title) => {
  const res = await client.post(`/rooms/${roomId}/topics`, { title });
  return res.data;
};

export const closeTopic = async (topicId) => {
  const res = await client.patch(`/topics/${topicId}/close`);
  return res.data;
};

export const reopenTopic = async (topicId) => {
  const res = await client.patch(`/topics/${topicId}/reopen`);
  return res.data;
};

// --- EXPORT ---
export const exportIssueDraft = async (roomId, topicId) => {
  const res = await client.post(
    `/rooms/${roomId}/topics/${topicId}/export/draft`
  );
  return res.data; // {title, body, labels}
};

export default client;
