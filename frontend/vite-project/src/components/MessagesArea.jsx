import { useEffect, useMemo, useRef, Fragment } from "react";
import { Box, Paper, Stack, Typography, Chip, Tooltip } from "@mui/material";

export default function MessagesArea({
  selectedRoom,
  messages,
  currentUserId,
  currentUsername,
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

  const roomTags = useMemo(() => {
    const s = new Set();
    messages.forEach((m) => {
      (m.tags || []).forEach((t) => {
        if (!t) return;
        if (t.toLowerCase() === "debug") return;
        s.add(t);
      });
    });
    return Array.from(s);
  }, [messages]);

  const headerTitle = useMemo(() => {
    if (!selectedRoom) return "";
    if (!selectedRoom.direct) return selectedRoom.name;

    const parts = selectedRoom.name.split("↔").map((p) => p.trim());
    if (parts.length !== 2 || !currentUsername) return selectedRoom.name;

    const me = currentUsername.toLowerCase();
    const [a, b] = parts;
    if (a.toLowerCase() === me) return b;
    if (b.toLowerCase() === me) return a;
    return selectedRoom.name;
  }, [selectedRoom, currentUsername]);

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
      {/* HLAVIČKA */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "#ffffff",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {selectedRoom ? (selectedRoom.direct ? "Direct chat" : "Room") : ""}
          </Typography>

          {selectedRoom?.direct && (
            <Chip
              label="DIRECT"
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                bgcolor: "#eef2ff",
                color: "#4f46e5",
              }}
            />
          )}
        </Stack>

        <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
          {selectedRoom ? headerTitle : "Select a room to start chatting"}
        </Typography>

        {/* súhrn tagov roomky */}
        {roomTags.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            sx={{ mt: 0.75 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mr: 0.5 }}
            >
              Tags:
            </Typography>
            {roomTags.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  fontSize: 10,
                  bgcolor: "#eef2ff",
                  color: "#4338ca",
                  height: 22,
                }}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* SPRÁVY */}
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

            const visibleTags = (m.tags || []).filter(
              (t) => t && t.toLowerCase() !== "debug"
            );
            const firstTags = visibleTags.slice(0, 2);
            const extraCount =
              visibleTags.length > 2 ? visibleTags.length - 2 : 0;

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
                      sx={{ mb: visibleTags.length ? 0.5 : 0 }}
                    >
                      {m.content}
                    </Typography>

                    {visibleTags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {firstTags.map((t) => (
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

                        {extraCount > 0 && (
                          <Tooltip
                            title={visibleTags.join(", ")}
                            arrow
                            placement="top"
                          >
                            <Chip
                              label={`+${extraCount}`}
                              size="small"
                              sx={{
                                fontSize: 10,
                                bgcolor: isMine
                                  ? "rgba(15,23,42,0.28)"
                                  : "#e5e7eb",
                              }}
                            />
                          </Tooltip>
                        )}
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
