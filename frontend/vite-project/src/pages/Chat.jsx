import { useEffect, useMemo, useState } from "react";
import { Box, Paper } from "@mui/material";
import {
  getUsers,
  getRooms,
  createRoom,
  getOrCreatePrivateRoom,
  getMessagesForRoom,
  getMessagesForRoomByTopic,
  sendMessageToRoom,
  logout,
  getTopics,
  createTopic,
  closeTopic,
  reopenTopic,
  exportIssueDraft,
} from "../api/api";
import { connectWebSocket, disconnectWebSocket } from "../wsClient";

import LeftSidebar from "../components/LeftSidebar";
import MessagesArea from "../components/MessagesArea";
import MessageInput from "../components/MessageInput";
import CreateRoomDialog from "../components/CreateRoomDialog";
import TopicsArea from "../components/TopicsArea";
import IssueDraftDialog from "../components/IssueDraftDialog";

export default function Chat({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [users, setUsers] = useState([]);
  const usersById = useMemo(() => {
    const map = {};
    (users || []).forEach((u) => (map[u.id] = u));
    return map;
  }, [users]);

  const [messages, setMessages] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const [topics, setTopics] = useState([]);
  const [mode, setMode] = useState("CHAT"); // CHAT | TOPICS
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [draftOpen, setDraftOpen] = useState(false);
  const [topicUnread, setTopicUnread] = useState({}); // { topicId: number }

  // search
  const [searchValue, setSearchValue] = useState("");
  const [searchMode, setSearchMode] = useState("MESSAGE"); // MESSAGE | TAG
  const [roomTagQuery, setRoomTagQuery] = useState(""); // pre backend tag fetch v CHAT mode

  // ✅ to je fix na “kliknem 2x a nič”
  const [viewTick, setViewTick] = useState(0);

  const handleLogout = async () => {
    try {
      await logout(user.id);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      onLogout(null);
    }
  };

  // Load users + rooms
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

        if (!selectedRoom && roomsResp?.length) {
          setSelectedRoom(roomsResp[0]);
        }
      } catch (e) {
        console.error("Failed to load initial data", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // WS connect
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

  // Load topics on room change (team room)
  useEffect(() => {
    if (!selectedRoom || selectedRoom.direct) {
      setTopics([]);
      setSelectedTopic(null);
      setMode("CHAT");
      setTopicUnread({});
      return;
    }

    (async () => {
      try {
        const t = await getTopics(selectedRoom.id);
        setTopics(t || []);
        setSelectedTopic(null);
        setTopicUnread({});
      } catch (e) {
        console.error("Failed to load topics", e);
        setTopics([]);
      }
    })();
  }, [selectedRoom?.id]);

  // Subscribe to room
  useEffect(() => {
    if (!stompClient || !selectedRoom) return;

    const sub = stompClient.subscribe(
      `/topic/rooms/${selectedRoom.id}`,
      (msg) => {
        const body = JSON.parse(msg.body);
        const msgTopicId = body.topicId || null;

        const isTopicsView = mode === "TOPICS";
        const isChatView = mode === "CHAT";

        const shouldAppend =
          (isChatView && msgTopicId === null) ||
          (isTopicsView &&
            selectedTopic?.id &&
            msgTopicId === selectedTopic.id);

        if (shouldAppend) {
          setMessages((prev) => [...prev, body]);
        } else {
          if (msgTopicId) {
            setTopicUnread((prev) => ({
              ...prev,
              [msgTopicId]: (prev[msgTopicId] || 0) + 1,
            }));
          }
        }
      }
    );

    return () => sub.unsubscribe();
  }, [stompClient, selectedRoom?.id, mode, selectedTopic?.id]);

  // Load messages when view changes
  useEffect(() => {
    if (!user || !selectedRoom) return;

    let cancelled = false;

    (async () => {
      try {
        let data;

        if (mode === "TOPICS" && selectedTopic?.id) {
          data = await getMessagesForRoomByTopic(
            selectedRoom.id,
            user.id,
            selectedTopic.id
          );
        } else {
          // CHAT view
          // ✅ tag search v CHAT mode – použijeme backend filter tag=...
          const tag = roomTagQuery?.trim() ? roomTagQuery.trim() : undefined;
          data = await getMessagesForRoom(selectedRoom.id, user.id, tag);
        }

        if (!cancelled) setMessages(data || []);
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    selectedRoom?.id,
    mode,
    selectedTopic?.id,
    viewTick,
    roomTagQuery,
  ]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setSelectedTopic(null);
    setMode("CHAT");
    setTopicUnread({});
    setSearchValue("");
    setRoomTagQuery("");
    setViewTick((x) => x + 1);
  };

  const handleSelectTopic = async (t) => {
    // keď klikneš 2x na rovnaký topic, reload
    setSelectedTopic(t);
    setTopicUnread((prev) => ({ ...prev, [t.id]: 0 }));
    setSearchValue("");
    setViewTick((x) => x + 1);
  };

  const handleChangeMode = (newMode) => {
    if (!selectedRoom || selectedRoom.direct) return;

    // ✅ keď klikneš 2x na to isté, reload
    if (newMode === mode) {
      setViewTick((x) => x + 1);
      return;
    }

    setMode(newMode);
    setMessages([]);
    setSearchValue("");

    if (newMode === "CHAT") {
      setSelectedTopic(null);
      setRoomTagQuery(""); // reset server tag filter
    }

    setViewTick((x) => x + 1);
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

      setMode("CHAT");
      setSelectedTopic(null);
      setTopicUnread({});
      setSearchValue("");
      setRoomTagQuery("");
      setViewTick((x) => x + 1);
    } catch (e) {
      console.error("Failed to create room", e);
    }
  };

  const handleStartDirectChat = async (u) => {
    try {
      console.log(user);
      const room = await getOrCreatePrivateRoom(user.id, u.uid);

      setRooms((prev) => {
        const exists = prev.some((r) => r.id === room.id);
        return exists ? prev : [...prev, room];
      });

      setSelectedRoom(room);
      setMessages([]);
      setMode("CHAT");
      setSelectedTopic(null);
      setSearchValue("");
      setRoomTagQuery("");
      setViewTick((x) => x + 1);
    } catch (e) {
      console.error("Failed to start direct chat", e);
    }
  };

  const handleSendMessage = async (text, tags) => {
    if (!selectedRoom) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    const topicIdToSend =
      mode === "TOPICS" && selectedTopic?.id ? selectedTopic.id : null;

    // nepovoľ posielať do CLOSED topicu
    if (topicIdToSend && selectedTopic?.status === "CLOSED") return;

    const payload = {
      fromUserId: String(user.id),
      roomId: selectedRoom.id,
      content: trimmed,
      tags,
      topicId: topicIdToSend,
    };

    try {
      if (stompClient) {
        stompClient.publish({
          destination: "/app/chat.send",
          body: JSON.stringify(payload),
        });
      } else {
        await sendMessageToRoom(selectedRoom.id, payload);
        setViewTick((x) => x + 1);
      }
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const isTopicMode = mode === "TOPICS" && selectedRoom && !selectedRoom.direct;

  const topicsUnreadTotal = Object.values(topicUnread || {}).reduce(
    (sum, n) => sum + (Number(n) || 0),
    0
  );

  // create topic from header menu
  const handleCreateTopic = async (title) => {
    if (!selectedRoom?.id) return null;
    const created = await createTopic(selectedRoom.id, title);

    // refresh topics list
    const t = await getTopics(selectedRoom.id);
    setTopics(t || []);

    // auto open
    setMode("TOPICS");
    setSelectedTopic(created);
    setTopicUnread((prev) => ({ ...prev, [created.id]: 0 }));
    setViewTick((x) => x + 1);

    return created;
  };

  // close/open topic
  const handleToggleTopicStatus = async () => {
    if (!selectedTopic?.id) return;

    try {
      const updated =
        selectedTopic.status === "OPEN"
          ? await closeTopic(selectedTopic.id)
          : await reopenTopic(selectedTopic.id);

      // update topics list
      setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      // update selectedTopic
      setSelectedTopic(updated);
    } catch (e) {
      console.error("Failed to toggle topic status", e);
    }
  };

  // export draft
  const handleGenerateDraft = async (topicId) => {
    if (!selectedRoom?.id) return null;
    return exportIssueDraft(selectedRoom.id, topicId);
  };

  // search handling:
  // - MESSAGE search je vždy lokálne (MessagesArea filtruje)
  // - TAG search:
  //    - v CHAT mode: použijeme backend filter (roomTagQuery)
  //    - v TOPICS mode: necháme lokálne (MessagesArea filtruje podľa m.tags)
  const handleSearchChange = (v) => {
    setSearchValue(v);

    if (searchMode === "TAG" && mode === "CHAT") {
      // server filter
      setRoomTagQuery(v);
      setViewTick((x) => x + 1);
    }
  };

  const handleSearchModeChange = (m) => {
    setSearchMode(m);
    setSearchValue("");
    setRoomTagQuery("");
    setViewTick((x) => x + 1);
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

        <Box sx={{ flex: 1, display: "flex" }}>
          {isTopicMode && (
            <TopicsArea
              topics={topics}
              selectedTopicId={selectedTopic?.id}
              onSelectTopic={handleSelectTopic}
              unreadMap={topicUnread}
            />
          )}

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <MessagesArea
              selectedRoom={selectedRoom}
              messages={messages}
              currentUserId={user.id}
              currentUsername={user.username}
              mode={mode}
              onChangeMode={handleChangeMode}
              topicsCount={topics.length}
              selectedTopic={selectedTopic}
              topicsUnreadTotal={topicsUnreadTotal}
              usersById={usersById}
              searchValue={searchValue}
              searchMode={searchMode}
              onSearchChange={handleSearchChange}
              onSearchModeChange={handleSearchModeChange}
              onCreateTopic={handleCreateTopic}
              onToggleTopicStatus={handleToggleTopicStatus}
              onOpenExport={() => setDraftOpen(true)}
            />

            <MessageInput
              disabled={
                !selectedRoom ||
                (mode === "TOPICS" &&
                  (!selectedTopic || selectedTopic.status === "CLOSED"))
              }
              onSend={handleSendMessage}
            />
          </Box>
        </Box>
      </Paper>

      <CreateRoomDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        users={users}
        currentUserId={user.id}
        onCreate={handleCreateRoom}
      />

      <IssueDraftDialog
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        topics={selectedTopic ? [selectedTopic] : []}
        onGenerate={(topicId) => handleGenerateDraft(topicId)}
      />
    </Box>
  );
}
