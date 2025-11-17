import { useEffect, useMemo, useState, Fragment, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import { getUsers, getMessages, sendMessage, logout } from "../api/api";
import { connectWebSocket, disconnectWebSocket } from "../wsClient";

export default function Chat({ user, onLogout }) {
  const messagesContainerRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [stompClient, setStompClient] = useState(null);

  const handleLogout = async () => {
    try {
      await logout(user.id);
      onLogout(null);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      onLogout(null);
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      try {
        const data = await getUsers();
        const others = data.filter(
          (u) =>
            String(u.id) !== String(user.id) &&
            String(u.uid) !== String(user.id)
        );

        setUsers(others);
        if (!selectedUser && others.length > 0) {
          setSelectedUser(others[0]);
        }
      } catch (e) {
        console.error("Failed to load users", e);
      }
    };

    loadUsers();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const refresh = async () => {
      try {
        const data = await getUsers();
        const others = data.filter(
          (u) =>
            String(u.id) !== String(user.id) &&
            String(u.uid) !== String(user.id)
        );
        setUsers(others);
      } catch (e) {
        console.error("Failed to refresh users", e);
      }
    };

    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const client = connectWebSocket((stomp) => {
      setStompClient(stomp);

      stomp.publish({
        destination: "/app/presence.update",
        body: JSON.stringify({ userId: user.id, online: true }),
      });

      stomp.subscribe("/topic/user-status", (msg) => {
        const status = JSON.parse(msg.body); // { userId, online }

        setUsers((prev) =>
          prev.map((u) =>
            String(u.uid) === String(status.userId) ||
            String(u.id) === String(status.userId)
              ? { ...u, online: status.online }
              : u
          )
        );
      });
    });

    const handleBeforeUnload = () => {
      try {
        client.publish({
          destination: "/app/presence.update",
          body: JSON.stringify({ userId: user.id, online: false }),
        });
      } catch (_) {}
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      try {
        client.publish({
          destination: "/app/presence.update",
          body: JSON.stringify({ userId: user.id, online: false }),
        });
      } catch (_) {}
      disconnectWebSocket(client);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!stompClient || !user || !selectedUser) return;

    const convId = getConversationId(user.id, selectedUser.uid);

    const subscription = stompClient.subscribe(
      `/topic/conversation/${convId}`,
      (msg) => {
        const message = JSON.parse(msg.body);
        setMessages((prev) => [...prev, message]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, user?.id, selectedUser?.uid]);

  useEffect(() => {
    if (!user || !selectedUser) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getMessages(user.id, selectedUser.uid);
        if (!cancelled) {
          setMessages(data || []);
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, selectedUser?.uid]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;

    const payload = {
      fromUserId: user.id,
      toUserId: selectedUser.uid,
      content: text.trim(),
    };

    try {
      setText("");

      if (stompClient) {
        stompClient.publish({
          destination: "/app/chat.send",
          body: JSON.stringify(payload),
        });
      } else {
        await sendMessage(payload);
        const data = await getMessages(user.id, selectedUser.uid);
        setMessages(data || []);
      }
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const getConversationId = (a, b) => {
    const aa = String(a);
    const bb = String(b);
    return aa < bb ? `${aa}_${bb}` : `${bb}_${aa}`;
  };

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      if (!a.sentAt || !b.sentAt) return 0;
      return new Date(a.sentAt) - new Date(b.sentAt);
    });
  }, [messages]);

  const shouldShowTimestamp = (prev, current) => {
    if (!current?.sentAt) return false;
    if (!prev?.sentAt) return true;

    const prevTime = new Date(prev.sentAt).getTime();
    const curTime = new Date(current.sentAt).getTime();

    return curTime - prevTime >= 10 * 60 * 1000;
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;

    el.scrollTop = el.scrollHeight;
  }, [sortedMessages.length, selectedUser?.uid]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4A6CF7 0%, #9B51E0 100%)",
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 1100,
          height: "80vh",
          display: "flex",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "#f3f4f6",
        }}
      >
        {/* LEFT – users */}
        <Box
          sx={{
            width: 280,
            borderRight: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={600}>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logged in as <strong>{user.username}</strong>
            </Typography>
          </Box>

          <List dense sx={{ flex: 1, overflowY: "auto" }}>
            {users.map((u) => (
              <ListItemButton
                key={u.id}
                selected={selectedUser?.id === u.id}
                onClick={() => handleSelectUser(u)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "#eef2ff",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ width: "100%" }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: u.online ? "#22c55e" : "#9ca3af",
                    }}
                  />
                  <ListItemText
                    primary={`${u.firstName} ${u.lastName}`}
                    secondary={u.online ? "online" : "offline"}
                    secondaryTypographyProps={{ sx: { fontSize: 11 } }}
                  />
                </Stack>
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb" }}>
            <Button variant="outlined" fullWidth onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* RIGHT – chat */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              p: 2.5,
              borderBottom: "1px solid #e5e7eb",
              bgcolor: "#ffffff",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {selectedUser
                ? `Chat with ${selectedUser.firstName} ${selectedUser.lastName}`
                : "Select a user to start chatting"}
            </Typography>
          </Box>

          {/* Messages */}
          <Box
            ref={messagesContainerRef}
            sx={{
              flex: 1,
              p: 3,
              overflowY: "auto",
              background:
                "radial-gradient(circle at top left, #eef2ff 0, #ffffff 40%)",
            }}
          >
            {sortedMessages.length === 0 && selectedUser && (
              <Typography color="text.secondary">
                No messages yet. Start the conversation 👋
              </Typography>
            )}

            <Stack spacing={1.5}>
              {sortedMessages.map((m, index) => {
                const prev = index > 0 ? sortedMessages[index - 1] : null;
                const isMine = m.fromUserId === user.id;
                const showTime = shouldShowTimestamp(prev, m);

                return (
                  <Fragment key={m.id}>
                    {showTime && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            px: 1.5,
                            py: 0.3,
                            bgcolor: "#e5e7eb",
                            borderRadius: 10,
                          }}
                        >
                          {formatTime(m.sentAt)}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.3,
                          px: 1.8,
                          maxWidth: "70%",
                          bgcolor: isMine ? "#4A6CF7" : "#f3f4f6",
                          color: isMine ? "#ffffff" : "inherit",
                          borderRadius: 3,
                          borderTopRightRadius: isMine ? 4 : 3,
                          borderTopLeftRadius: isMine ? 3 : 4,
                          boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
                        }}
                      >
                        <Typography variant="body2">{m.content}</Typography>
                      </Paper>
                    </Box>
                  </Fragment>
                );
              })}
            </Stack>
          </Box>

          <Divider />

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e5e7eb",
              bgcolor: "#ffffff",
            }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                size="small"
                disabled={!selectedUser}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!selectedUser || !text.trim()}
              >
                Send
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
