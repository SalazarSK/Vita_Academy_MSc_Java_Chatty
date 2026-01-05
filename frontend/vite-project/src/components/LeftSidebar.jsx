import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupsIcon from "@mui/icons-material/Groups";

export default function LeftSidebar({
  user,
  rooms,
  selectedRoomId,
  onSelectRoom,
  users,
  onStartDirectChat,
  onOpenCreateRoom,
  onLogout,
}) {
  const visibleRooms = (rooms || []).filter((r) => !r.direct);

  const myId = user?.uid ?? user?.id;
  const getUserId = (u) => u?.uid ?? u?.id;

  const getInitials = (u) => {
    if (!u) return "?";
    if (u.firstName || u.lastName) {
      return `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase();
    }
    return (u.username?.[0] || "?").toUpperCase();
  };

  const renderRoomItem = (room) => {
    const selected = room.id === selectedRoomId;

    return (
      <Box
        key={room.id}
        onClick={() => onSelectRoom(room)}
        sx={{
          px: 1.5,
          py: 1,
          mb: 0.5,
          borderRadius: 2,
          cursor: "pointer",
          bgcolor: selected ? "#E0E7FF" : "transparent",
          "&:hover": { bgcolor: selected ? "#D4DCFF" : "#F3F4F6" },
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <GroupsIcon fontSize="small" />
          <Box>
            <Typography
              variant="body2"
              fontWeight={selected ? 600 : 500}
              sx={{ lineHeight: 1.2 }}
            >
              {room.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", fontSize: 10 }}
            >
              Team
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  const renderUserItem = (u) => {
    const isOnline = u.online ?? false;
    const uid = getUserId(u);

    const handleClick = () => {
      if (!uid) {
        console.error("User has no id/uid - cannot start direct chat", u);
        return;
      }
      onStartDirectChat(u);
    };

    return (
      <Box
        key={uid} // ✅ stabilný key
        onClick={handleClick}
        sx={{
          px: 1.5,
          py: 0.8,
          borderRadius: 2,
          cursor: "pointer",
          mb: 0.5,
          "&:hover": { bgcolor: "#F3F4F6" },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{
            width: 30,
            height: 30,
            fontSize: 13,
            bgcolor: "#6366F1",
            mr: 1.2,
          }}
        >
          {getInitials(u)}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={500}>
            {u.firstName || u.lastName
              ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
              : u.username}
          </Typography>

          <Stack direction="row" spacing={0.6} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: isOnline ? "#22C55E" : "#9CA3AF",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {isOnline ? "online" : "offline"}
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: "#F9FAFB",
        borderRight: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          Rooms
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Logged in as{" "}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {user?.username}
          </Box>
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Typography variant="overline" color="text.secondary">
            ROOMS
          </Typography>

          <IconButton size="small" onClick={onOpenCreateRoom} sx={{ p: 0.5 }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>

        {visibleRooms.map(renderRoomItem)}

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ mb: 1, display: "block" }}
        >
          USERS
        </Typography>

        {(users || [])
          .filter((u) => {
            const uid = getUserId(u);
            return uid && uid !== myId;
          })
          .map(renderUserItem)}
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: "1px solid #E5E7EB",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          onClick={onOpenCreateRoom}
          sx={{ borderRadius: 20, textTransform: "none", fontSize: 13 }}
        >
          New Room
        </Button>

        <IconButton
          onClick={onLogout}
          sx={{ borderRadius: 2, border: "1px solid #E5E7EB" }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
