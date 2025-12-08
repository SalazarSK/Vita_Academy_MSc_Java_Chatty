import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

export default function CreateRoomDialog({
  open,
  onClose,
  users,
  currentUserId,
  onCreate,
}) {
  const [roomName, setRoomName] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);

  useEffect(() => {
    if (!open) {
      setRoomName("");
      setRoomMembers([]);
    }
  }, [open]);

  const handleCreate = () => {
    if (!roomName.trim()) return;
    onCreate(roomName.trim(), roomMembers);
  };

  const handleMembersChange = (event) => {
    const { value } = event.target;
    // MUI multiple select: value môže byť string alebo array
    setRoomMembers(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create room</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Stack spacing={2} padding={2}>
          <TextField
            id="outlined-basic"
            variant="outlined"
            label="Room name"
            fullWidth
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <TextField
            select
            label="Members"
            fullWidth
            value={roomMembers}
            onChange={handleMembersChange}
            SelectProps={{
              multiple: true,
              renderValue: (selectedIds) => {
                const selectedUsers = users.filter((u) =>
                  selectedIds.includes(u.uid)
                );
                return selectedUsers
                  .map((u) => `${u.firstName} ${u.lastName}`)
                  .join(", ");
              },
            }}
          >
            {users
              .filter((u) => u.uid !== currentUserId && u.uid !== currentUserId)
              .map((u) => (
                <MenuItem key={u.uid} value={u.uid}>
                  {u.firstName} {u.lastName}
                  {u.username ? ` (${u.username})` : ""}
                </MenuItem>
              ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
