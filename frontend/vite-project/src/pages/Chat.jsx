import { useEffect, useMemo, useRef, useState, Fragment } from "react";
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
  Chip,
} from "@mui/material";
import {
  getRooms,
  getMessagesForRoom,
  sendMessageToRoom,
  logout,
} from "../api/api";
import { connectWebSocket, disconnectWebSocket } from "../wsClient";

export default function Chat({ user, onLogout }) {
  const messagesContainerRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [stompClient, setStompClient] = useState(null);

  const handleLogout = async () => {
    try {
      await logout(user.id);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      onLogout(null);
    }
  };

  // načítanie roomiek
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const data = await getRooms();
        setRooms(data || []);
        if (!selectedRoom && data && data.length > 0) {
          setSelectedRoom(data[0]);
        }
      } catch (e) {
        console.error("Failed to load rooms", e);
      }
    })();
  }, [user?.id]);

  // WebSocket connect
  useEffect(() => {
    if (!user) return;

    const client = connectWebSocket((stomp) => {
      setStompClient(stomp);
    });

    return () => {
      disconnectWebSocket(client);
    };
  }, [user?.id]);

  // WebSocket – subscribe na aktuálnu roomku
  useEffect(() => {
    if (!stompClient || !selectedRoom) return;

    const sub = stompClient.subscribe(
      `/topic/rooms/${selectedRoom.id}`,
      (msg) => {
        const message = JSON.parse(msg.body);
        setMessages((prev) => [...prev, message]);
      }
    );

    return () => sub.unsubscribe();
  }, [stompClient, selectedRoom?.id]);

  // načítanie správ pre roomku
  useEffect(() => {
    if (!user || !selectedRoom) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getMessagesForRoom(selectedRoom.id, user.id);
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
  }, [user?.id, selectedRoom?.id]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]);
  };

  const parseTags = (input) =>
    input
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

  const handleSend = async () => {
    if (!text.trim() || !selectedRoom) return;

    const payload = {
      fromUserId: user.id,
      content: text.trim(),
      tags: parseTags(tagsInput),
    };

    try {
      setText("");

      if (stompClient) {
        stompClient.publish({
          destination: `/app/rooms/${selectedRoom.id}/send`,
          body: JSON.stringify(payload),
        });
      } else {
        await sendMessageToRoom(selectedRoom.id, payload);
        const data = await getMessagesForRoom(selectedRoom.id, user.id);
        setMessages(data || []);
      }
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => {
        if (!a.sentAt || !b.sentAt) return 0;
        return new Date(a.sentAt) - new Date(b.sentAt);
      }),
    [messages]
  );

  const shouldShowTimestamp = (prev, current) => {
    if (!current?.sentAt) return false;
    if (!prev?.sentAt) return true;

    const prevTime = new Date(prev.sentAt).getTime();
    const curTime = new Date(current.sentAt).getTime();

    return curTime - prevTime >= 10 * 60 * 1000;
  };

  const formatTime = (isoString) =>
    !isoString
      ? ""
      : new Date(isoString).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    el.scrollTop = el.scrollHeight;
  }, [sortedMessages.length, selectedRoom?.id]);

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
        {/* LEFT – rooms */}
        <Box
          sx={{
            width: 260,
            borderRight: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={600}>
              Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logged in as <strong>{user.username}</strong>
            </Typography>
          </Box>

          <List dense sx={{ flex: 1, overflowY: "auto" }}>
            {rooms.map((r) => (
              <ListItemButton
                key={r.id}
                selected={selectedRoom?.id === r.id}
                onClick={() => handleSelectRoom(r)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "#eef2ff",
                  },
                }}
              >
                <ListItemText primary={r.name} />
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
              {selectedRoom
                ? `Room: ${selectedRoom.name}`
                : "Select a room to start chatting"}
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
            {sortedMessages.length === 0 && selectedRoom && (
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
                        <Typography
                          variant="body2"
                          sx={{ mb: m.tags?.length ? 0.5 : 0 }}
                        >
                          {m.content}
                        </Typography>

                        {m.tags && m.tags.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {m.tags.map((t) => (
                              <Chip
                                key={t}
                                label={t}
                                size="small"
                                sx={{ fontSize: 10 }}
                              />
                            ))}
                          </Stack>
                        )}
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
                disabled={!selectedRoom}
              />
              <TextField
                placeholder="tags (comma separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                size="small"
                sx={{ width: 220 }}
                disabled={!selectedRoom}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!selectedRoom || !text.trim()}
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
