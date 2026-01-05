import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Stack,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function TopicsArea({
  topics,
  selectedTopicId,
  onSelectTopic,
  unreadMap, // { [topicId]: number }
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL"); // ALL | OPEN | CLOSED

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return (topics || [])
      .filter((t) => {
        const st = (t.status || "").toUpperCase();
        if (status !== "ALL" && st !== status) return false;
        if (!query) return true;
        return (t.title || "").toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const da = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const db = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return db - da;
      });
  }, [topics, q, status]);

  return (
    <Box
      sx={{
        width: 320,
        borderRight: "1px solid #E5E7EB",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #E5E7EB" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography fontWeight={700}>Topics</Typography>
            <Typography variant="caption" color="text.secondary">
              Click to open the topic
            </Typography>
          </Box>
          <Chip
            size="small"
            label={filtered.length}
            sx={{ height: 22, fontSize: 11, bgcolor: "#F3F4F6" }}
          />
        </Stack>

        {/* Search */}
        <Box
          sx={{
            mt: 1.5,
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
            placeholder="Search topics..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{ disableUnderline: true }}
            sx={{ "& input": { fontSize: 13 } }}
          />
        </Box>

        {/* Filter */}
        <Box sx={{ mt: 1.2 }}>
          <ToggleButtonGroup
            size="small"
            value={status}
            exclusive
            onChange={(_, v) => v && setStatus(v)}
          >
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="OPEN">Open</ToggleButton>
            <ToggleButton value="CLOSED">Closed</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ p: 1.5, overflowY: "auto", flex: 1 }}>
        <Stack spacing={0.8}>
          {filtered.map((t) => {
            const selected = t.id === selectedTopicId;
            const unread = unreadMap?.[t.id] || 0;

            return (
              <Box
                key={t.id}
                onClick={() => onSelectTopic(t)}
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  cursor: "pointer",
                  border: "1px solid #E5E7EB",
                  bgcolor: selected ? "#EEF2FF" : "#fff",
                  "&:hover": { bgcolor: selected ? "#E0E7FF" : "#F9FAFB" },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      lineHeight: 1.2,
                      pr: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {t.title}
                  </Typography>

                  <Stack direction="row" spacing={0.6} alignItems="center">
                    {unread > 0 && (
                      <Chip
                        size="small"
                        label={unread}
                        sx={{
                          height: 20,
                          fontSize: 11,
                          bgcolor: "#4f46e5",
                          color: "#fff",
                        }}
                      />
                    )}

                    <Chip
                      size="small"
                      label={(t.status || "").toUpperCase()}
                      sx={{
                        height: 20,
                        fontSize: 10,
                        bgcolor:
                          (t.status || "").toUpperCase() === "CLOSED"
                            ? "#FEE2E2"
                            : "#DCFCE7",
                      }}
                    />
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 0.6 }}>
                  <Typography variant="caption" color="text.secondary">
                    msgs: {t.messageCount ?? 0}
                  </Typography>
                  {t.lastMessageAt && (
                    <Typography variant="caption" color="text.secondary">
                      last: {new Date(t.lastMessageAt).toLocaleString()}
                    </Typography>
                  )}
                </Stack>
              </Box>
            );
          })}

          {filtered.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              No topics found.
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
