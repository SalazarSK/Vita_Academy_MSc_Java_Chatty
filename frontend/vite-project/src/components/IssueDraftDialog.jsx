import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function IssueDraftDialog({
  open,
  onClose,
  topics,
  onGenerate, // (topicId) => draft
}) {
  const [topicId, setTopicId] = useState("");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(null);
    setTopicId(topics?.[0]?.id || "");
  }, [open, topics]);

  const selectedTopic = useMemo(
    () => topics?.find((t) => t.id === topicId),
    [topics, topicId]
  );

  const copy = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleGenerate = async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      const d = await onGenerate(topicId);
      setDraft(d);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Export → GitHub Issue Draft</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Topic
              </Typography>
              <Select
                fullWidth
                size="small"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                {(topics || []).map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.title} ({t.status})
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={!topicId || loading}
              sx={{ mt: 2.1, borderRadius: 2, textTransform: "none" }}
            >
              {loading ? "Generating..." : "Generate draft"}
            </Button>
          </Stack>

          {selectedTopic && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={selectedTopic.status}
                sx={{
                  bgcolor:
                    selectedTopic.status === "CLOSED" ? "#fee2e2" : "#dcfce7",
                  color: "#111827",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Messages: {selectedTopic.messageCount ?? "?"}
              </Typography>
            </Stack>
          )}

          {draft && (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  label="Title"
                  value={draft.title || ""}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant="outlined"
                  onClick={() => copy(draft.title || "")}
                  startIcon={<ContentCopyIcon />}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Copy
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  fullWidth
                  label="Body (Markdown)"
                  value={draft.body || ""}
                  multiline
                  minRows={12}
                  InputProps={{ readOnly: true }}
                />
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => copy(draft.body || "")}
                    startIcon={<ContentCopyIcon />}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    Copy body
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => copy((draft.labels || []).join(", "))}
                    startIcon={<ContentCopyIcon />}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    Copy labels
                  </Button>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(draft.labels || []).map((l) => (
                  <Chip key={l} label={l} size="small" />
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
