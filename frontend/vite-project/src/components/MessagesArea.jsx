import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  Tooltip,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TopicIcon from "@mui/icons-material/Topic";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";

export default function MessagesArea({
  selectedRoom,
  messages,
  currentUserId,
  currentUsername,
  mode,
  onChangeMode,
  topicsCount,
  selectedTopic,
  topicsUnreadTotal,

  // nové:
  usersById, // map id -> user
  searchValue,
  searchMode, // "MESSAGE" | "TAG"
  onSearchChange,
  onSearchModeChange,

  onCreateTopic, // (title) => Promise
  onToggleTopicStatus, // () => Promise
  onOpenExport, // () => void
}) {
  const messagesRef = useRef(null);

  // mini menu
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // create topic dialog mini (inline)
  const [topicTitle, setTopicTitle] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const sortedMessages = useMemo(() => {
    return [...(messages || [])].sort((a, b) => {
      if (!a.sentAt || !b.sentAt) return 0;
      return new Date(a.sentAt) - new Date(b.sentAt);
    });
  }, [messages]);

  // lokálne filtrovanie (message/tag)
  const visibleMessages = useMemo(() => {
    const q = (searchValue || "").trim().toLowerCase();
    if (!q) return sortedMessages;

    if (searchMode === "TAG") {
      return sortedMessages.filter((m) =>
        (m.tags || []).some((t) =>
          String(t || "")
            .toLowerCase()
            .includes(q)
        )
      );
    }
    // MESSAGE
    return sortedMessages.filter((m) =>
      String(m.content || "")
        .toLowerCase()
        .includes(q)
    );
  }, [sortedMessages, searchValue, searchMode]);

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

  const topTitle = useMemo(() => {
    if (!selectedRoom) return "Select a room to start chatting";
    if (mode === "TOPICS" && selectedTopic) return selectedTopic.title;
    return headerTitle;
  }, [selectedRoom, mode, selectedTopic, headerTitle]);

  const topSubtitle = useMemo(() => {
    if (!selectedRoom) return "";
    if (selectedRoom.direct) return "Direct chat";
    if (mode === "TOPICS") return "Topic";
    return "Room";
  }, [selectedRoom, mode]);

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
  }, [visibleMessages.length, selectedRoom?.id, selectedTopic?.id, mode]);

  const isTeamRoom = selectedRoom && !selectedRoom.direct;

  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleCreateTopicOpen = () => {
    closeMenu();
    setTopicTitle("");
    setCreateOpen(true);
  };

  const handleCreateTopic = async () => {
    const title = topicTitle.trim();
    if (!title || !onCreateTopic) return;
    await onCreateTopic(title);
    setCreateOpen(false);
    setTopicTitle("");
  };

  const showSenderName = Boolean(isTeamRoom); // group chat
  const getSenderLabel = (m) => {
    if (m.fromUserId === currentUserId) return "You";
    const u = usersById?.[m.fromUserId];
    if (!u) return "Unknown";
    const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return full || u.username || "User";
  };

  return (
    <>
      {/* HEADER */}
      <Box
        sx={{ p: 2.5, borderBottom: "1px solid #e5e7eb", bgcolor: "#ffffff" }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                {topSubtitle}
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

              {!selectedRoom?.direct && mode === "TOPICS" && selectedTopic && (
                <Chip
                  label={selectedTopic.status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    bgcolor:
                      selectedTopic.status === "CLOSED" ? "#FEE2E2" : "#DCFCE7",
                  }}
                />
              )}
            </Stack>

            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mt: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {topTitle}
            </Typography>

            {!selectedRoom?.direct && (
              <Typography variant="caption" color="text.secondary">
                Topics: {topicsCount ?? 0}
                {mode === "TOPICS" && !selectedTopic ? " • Select a topic" : ""}
              </Typography>
            )}
          </Box>

          {/* Right controls */}
          {selectedRoom && !selectedRoom.direct && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Chat">
                <IconButton
                  onClick={() => onChangeMode("CHAT")}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 2,
                    bgcolor: mode === "CHAT" ? "#EEF2FF" : "#fff",
                  }}
                  size="small"
                >
                  <ChatBubbleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Topics">
                <IconButton
                  onClick={() => onChangeMode("TOPICS")}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 2,
                    bgcolor: mode === "TOPICS" ? "#EEF2FF" : "#fff",
                  }}
                  size="small"
                >
                  <Badge
                    badgeContent={topicsUnreadTotal || 0}
                    color="primary"
                    overlap="circular"
                    invisible={!topicsUnreadTotal}
                  >
                    <TopicIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Menu">
                <IconButton
                  onClick={openMenu}
                  size="small"
                  sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        {/* SEARCH */}
        {selectedRoom && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 1.25 }}
          >
            <Box
              sx={{
                flex: 1,
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                bgcolor: "#F9FAFB",
                px: 1.2,
                py: 0.6,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon fontSize="small" />
              <TextField
                variant="standard"
                placeholder={
                  searchMode === "TAG"
                    ? "Search by tag..."
                    : "Search messages..."
                }
                value={searchValue || ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                fullWidth
                InputProps={{ disableUnderline: true }}
                sx={{ "& input": { fontSize: 13 } }}
              />
            </Box>

            <ToggleButtonGroup
              size="small"
              value={searchMode}
              exclusive
              onChange={(_, v) => v && onSearchModeChange?.(v)}
            >
              <ToggleButton value="MESSAGE">Message</ToggleButton>
              <ToggleButton value="TAG">Tag</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        )}
      </Box>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu}>
        <MenuItem
          onClick={handleCreateTopicOpen}
          disabled={!selectedRoom || selectedRoom.direct}
        >
          <AddIcon fontSize="small" style={{ marginRight: 8 }} />
          Create topic
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();
            onOpenExport?.();
          }}
          disabled={mode !== "TOPICS" || !selectedTopic}
        >
          <DownloadIcon fontSize="small" style={{ marginRight: 8 }} />
          Export issue draft
        </MenuItem>

        <MenuItem
          onClick={async () => {
            closeMenu();
            await onToggleTopicStatus?.();
          }}
          disabled={mode !== "TOPICS" || !selectedTopic}
        >
          {selectedTopic?.status === "CLOSED" ? (
            <>
              <LockOpenIcon fontSize="small" style={{ marginRight: 8 }} />
              Re-open topic
            </>
          ) : (
            <>
              <LockIcon fontSize="small" style={{ marginRight: 8 }} />
              Close topic
            </>
          )}
        </MenuItem>
      </Menu>

      {/* CREATE TOPIC INLINE DIALOG */}
      {createOpen && (
        <Box
          sx={{
            position: "absolute",
            top: 120,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            width: 520,
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
            p: 2,
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Create topic
          </Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Topic title..."
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTopic();
                if (e.key === "Escape") setCreateOpen(false);
              }}
            />
            <IconButton
              onClick={handleCreateTopic}
              disabled={!topicTitle.trim()}
              sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              onClick={() => setCreateOpen(false)}
              sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}
            >
              ✕
            </IconButton>
          </Stack>
        </Box>
      )}

      {/* MESSAGES */}
      <Box
        ref={messagesRef}
        sx={{ flex: 1, p: 3, overflowY: "auto", backgroundColor: "#f9fafb" }}
      >
        {visibleMessages.length === 0 && selectedRoom && (
          <Typography color="text.secondary">
            {mode === "TOPICS" && !selectedTopic
              ? "Select a topic on the left to start."
              : "No messages (or filtered out)."}
          </Typography>
        )}

        <Stack spacing={1.25}>
          {visibleMessages.map((m, index) => {
            const prev = index > 0 ? visibleMessages[index - 1] : null;
            const isMine = m.fromUserId === currentUserId;
            const showTime = shouldShowTimestamp(prev, m);

            const visibleTags = (m.tags || []).filter(
              (t) => t && String(t).toLowerCase() !== "debug"
            );
            const firstTags = visibleTags.slice(0, 2);
            const extraCount =
              visibleTags.length > 2 ? visibleTags.length - 2 : 0;

            return (
              <Fragment key={m.id}>
                {showTime && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}
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
                  <Box sx={{ maxWidth: "70%" }}>
                    {/* sender name */}
                    {showSenderName && !isMine && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1, mb: 0.3, display: "block" }}
                      >
                        {getSenderLabel(m)}
                      </Typography>
                    )}

                    <Paper
                      sx={{
                        p: 1.2,
                        px: 1.6,
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

                      {/* TAGS – zobrazujeme vždy, aj v TOPICS (ty chceš tagy stále) */}
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
                </Box>
              </Fragment>
            );
          })}
        </Stack>
      </Box>
    </>
  );
}
