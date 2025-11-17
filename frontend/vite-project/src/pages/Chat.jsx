import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Button,
} from "@mui/material";

const MOCK_USERS = [
  { id: 1, username: "Alice", online: true },
  { id: 2, username: "Bob", online: true },
  { id: 3, username: "Charlie", online: false },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, from: "Alice", content: "Hi, how are you?" },
    { id: 2, from: "You", content: "All good, working on the assignment. :)" },
  ],
  2: [{ id: 3, from: "Bob", content: "Hey, let's grab a coffee later." }],
  3: [],
};

export default function Chat({ user, onLogout }) {
  const [selectedUser, setSelectedUser] = useState(MOCK_USERS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES[MOCK_USERS[0].id]);
  const [text, setText] = useState("");

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessages(MOCK_MESSAGES[u.id] || []);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    const newMsg = {
      id: Date.now(),
      from: "You",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
  };

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
        elevation={6}
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
            {MOCK_USERS.map((u) => (
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
                  {/* zelená bodka online/offline */}
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: u.online ? "#22c55e" : "#9ca3af",
                    }}
                  />
                  <ListItemText
                    primary={u.username}
                    secondary={u.online ? "online" : "offline"}
                    secondaryTypographyProps={{
                      sx: { fontSize: 11 },
                    }}
                  />
                </Stack>
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb" }}>
            <Button variant="outlined" fullWidth onClick={onLogout}>
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
              Chat with {selectedUser?.username}
            </Typography>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflowY: "auto",
              background:
                "radial-gradient(circle at top left, #eef2ff 0, #ffffff 40%)",
            }}
          >
            {messages.length === 0 && (
              <Typography color="text.secondary">
                No messages yet. Start the conversation 👋
              </Typography>
            )}

            <Stack spacing={1.5}>
              {messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      m.from === "You" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.3,
                      px: 1.8,
                      maxWidth: "70%",
                      bgcolor: m.from === "You" ? "#4A6CF7" : "#f3f4f6",
                      color: m.from === "You" ? "#ffffff" : "inherit",
                      borderRadius: 3,
                      borderTopRightRadius: m.from === "You" ? 4 : 3,
                      borderTopLeftRadius: m.from === "You" ? 3 : 4,
                    }}
                  >
                    <Typography variant="body2">{m.content}</Typography>
                  </Paper>
                </Box>
              ))}
            </Stack>
          </Box>

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
              />
              <Button variant="contained" onClick={handleSend}>
                Send
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
