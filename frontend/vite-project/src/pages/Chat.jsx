import { useEffect, useState } from "react";
import { getUsers, getMessages, sendMessage } from "../api/api";

export default function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (selected) {
      getMessages(user.id, selected.id).then(setMessages);
    }
  }, [selected]);

  const submit = async () => {
    await sendMessage({
      fromId: user.id,
      toId: selected.id,
      content: text,
    });
    setText("");
    getMessages(user.id, selected.id).then(setMessages);
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div>
        <h3>Users</h3>
        {users.map((u) => (
          <p key={u.id} onClick={() => setSelected(u)}>
            {u.username}
          </p>
        ))}
      </div>

      <div>
        <h3>Chat</h3>
        {messages.map((m) => (
          <p key={m.id}>{m.content}</p>
        ))}

        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={submit}>Send</button>
      </div>
    </div>
  );
}
