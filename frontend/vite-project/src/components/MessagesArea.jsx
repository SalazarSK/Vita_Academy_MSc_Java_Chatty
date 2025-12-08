import { useEffect, useMemo, useRef, Fragment } from "react";
import { Box, Paper, Stack, Typography, Chip } from "@mui/material";

export default function MessagesArea({
  selectedRoom,
  messages,
  currentUserId,
}) {
  const messagesRef = useRef(null);

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
    if (!messagesRef.current) return;
    const el = messagesRef.current;
    el.scrollTop = el.scrollHeight;
  }, [sortedMessages.length, selectedRoom?.id]);

  return (
    <>
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {selectedRoom ? (selectedRoom.direct ? "Direct chat" : "Room") : ""}
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {selectedRoom
            ? `${selectedRoom.name}`
            : "Select a room to start chatting"}
        </Typography>
      </Box>

      <Box
        ref={messagesRef}
        sx={{
          flex: 1,
          p: 3,
          overflowY: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        {sortedMessages.length === 0 && selectedRoom && (
          <Typography color="text.secondary">
            No messages yet. Start the conversation 👋
          </Typography>
        )}

        <Stack spacing={1.25}>
          {sortedMessages.map((m, index) => {
            const prev = index > 0 ? sortedMessages[index - 1] : null;
            const isMine = m.fromUserId === currentUserId;
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
                      p: 1.2,
                      px: 1.6,
                      maxWidth: "65%",
                      bgcolor: isMine ? "#4f46e5" : "#ffffff",
                      color: isMine ? "#ffffff" : "inherit",
                      borderRadius: 3,
                      borderTopRightRadius: isMine ? 8 : 3,
                      borderTopLeftRadius: isMine ? 3 : 8,
                      boxShadow: "0 2px 6px rgba(15,23,42,0.06)",
                      border: isMine ? "none" : "1px solid #e5e7eb",
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
                            sx={{
                              fontSize: 10,
                              bgcolor: isMine
                                ? "rgba(15,23,42,0.18)"
                                : "#f3f4f6",
                              color: isMine ? "#e5e7eb" : "inherit",
                            }}
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
    </>
  );
}
