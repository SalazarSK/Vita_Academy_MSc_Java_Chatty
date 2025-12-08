import { useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

export default function MessageInput({ disabled, onSend }) {
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const parseTags = (input) =>
    input
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

  const handleSendClick = () => {
    if (!text.trim() || disabled) return;
    const tags = parseTags(tagsInput);
    onSend(text, tags);
    setText("");
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderTop: "1px solid #e5e7eb",
        bgcolor: "#f9fafb",
      }}
    >
      <Box
        sx={{
          borderRadius: 999,
          bgcolor: "#ffffff",
          border: "1px solid #e5e7eb",
          px: 2,
          py: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            size="small"
            variant="standard"
            disabled={disabled}
            InputProps={{
              disableUnderline: true,
            }}
          />
          <TextField
            placeholder="tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            size="small"
            variant="standard"
            sx={{ width: 220 }}
            disabled={disabled}
            InputProps={{
              disableUnderline: true,
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendClick}
            disabled={disabled || !text.trim()}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 2.5,
            }}
          >
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
