import { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";
import {
  getUsers,
  getRooms,
  createRoom,
  getOrCreatePrivateRoom,
  getMessagesForRoom,
  sendMessageToRoom,
  logout,
} from "../api/api";
import { connectWebSocket, disconnectWebSocket } from "../wsClient";
import LeftSidebar from "../components/LeftSidebar";
import MessagesArea from "../components/MessagesArea";
import MessageInput from "../components/MessageInput";
import CreateRoomDialog from "../components/CreateRoomDialog";

export default function Chat({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(user.id);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      onLogout(null);
    }
  };

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const [usersResp, roomsResp] = await Promise.all([
          getUsers(),
          getRooms(user.id),
        ]);
        setUsers(usersResp || []);
        setRooms(roomsResp || []);
        if (!selectedRoom && roomsResp && roomsResp.length > 0) {
          setSelectedRoom(roomsResp[0]);
        }
      } catch (e) {
        console.error("Failed to load initial data", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const client = connectWebSocket((stomp) => {
      setStompClient(stomp);
    });

    return () => {
      disconnectWebSocket(client);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!stompClient || !selectedRoom) return;

    const sub = stompClient.subscribe(
      `/topic/rooms/${selectedRoom.id}`,
      (msg) => {
        const body = JSON.parse(msg.body);
        setMessages((prev) => [...prev, body]);
      }
    );

    return () => sub.unsubscribe();
  }, [stompClient, selectedRoom?.id]);

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

  const handleCreateRoom = async (name, memberIds) => {
    try {
      const room = await createRoom({
        name: name.trim(),
        creatorId: user.id,
        memberIds,
      });
      setRooms((prev) => [...prev, room]);
      setSelectedRoom(room);
      setCreateOpen(false);
    } catch (e) {
      console.error("Failed to create room", e);
    }
  };

  const handleStartDirectChat = async (u) => {
    try {
      const room = await getOrCreatePrivateRoom(user.id, u.id || u.uid);
      setRooms((prev) => {
        const exists = prev.some((r) => r.id === room.id);
        return exists ? prev : [...prev, room];
      });
      setSelectedRoom(room);
    } catch (e) {
      console.error("Failed to start direct chat", e);
    }
  };

  const handleSendMessage = async (text, tags) => {
    if (!selectedRoom) return;

    const payload = {
      fromUserId: user.id,
      content: text.trim(),
      tags,
    };

    try {
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
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 1200,
          height: "82vh",
          display: "flex",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        <LeftSidebar
          user={user}
          rooms={rooms}
          selectedRoomId={selectedRoom?.id}
          onSelectRoom={handleSelectRoom}
          users={users}
          onStartDirectChat={handleStartDirectChat}
          onOpenCreateRoom={() => setCreateOpen(true)}
          onLogout={handleLogout}
        />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <MessagesArea
            selectedRoom={selectedRoom}
            messages={messages}
            currentUserId={user.id}
          />
          <MessageInput disabled={!selectedRoom} onSend={handleSendMessage} />
        </Box>
      </Paper>

      <CreateRoomDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        users={users}
        currentUserId={user.id}
        onCreate={handleCreateRoom}
      />
    </Box>
  );
}
