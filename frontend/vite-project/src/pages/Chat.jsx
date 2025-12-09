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
  const [createOpen, setCreateOpen] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const handleLogout = async () => {
    try {
      await logout(user.id);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      onLogout(null);
    }
  };

  // 1) načítanie userov a roomiek
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

  // 2) pripojenie na WebSocket
  useEffect(() => {
    if (!user) return;

    const client = connectWebSocket((stomp) => {
      setStompClient(stomp);
    });

    return () => {
      disconnectWebSocket(client);
      setStompClient(null);
    };
  }, [user?.id]);

  // 3) subscribe na vybranú roomku
  useEffect(() => {
    if (!stompClient || !selectedRoom) return;

    const sub = stompClient.subscribe(
      `/topic/rooms/${selectedRoom.id}`,
      (msg) => {
        const body = JSON.parse(msg.body);
        setMessages((prev) => [...prev, body]);
      }
    );

    return () => {
      sub.unsubscribe();
    };
  }, [stompClient, selectedRoom?.id]);

  // 4) načítanie histórie pri zmene roomky
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
      setMessages([]);
      setCreateOpen(false);
    } catch (e) {
      console.error("Failed to create room", e);
    }
  };

  // direct chat = len špeciálna roomka
  const handleStartDirectChat = async (u) => {
    try {
      const room = await getOrCreatePrivateRoom(user.id, u.id || u.uid);

      setRooms((prev) => {
        const exists = prev.some((r) => r.id === room.id);
        return exists ? prev : [...prev, room];
      });

      setSelectedRoom(room);
      setMessages([]);
    } catch (e) {
      console.error("Failed to start direct chat", e);
    }
  };

  // 5) posielanie správ – WS + fallback na REST
  const handleSendMessage = async (text, tags) => {
    if (!selectedRoom) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    const payload = {
      fromUserId: String(user.id),
      roomId: selectedRoom.id,
      content: trimmed,
      tags,
    };

    try {
      if (stompClient) {
        stompClient.publish({
          destination: "/app/chat.send",
          body: JSON.stringify(payload),
        });
      } else {
        // fallback
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
            currentUsername={user.username}
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
