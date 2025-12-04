import { useState } from "react";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { getStoredUser } from "./api/api";

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());

  return user ? (
    <Chat user={user} onLogout={() => setUser(null)} />
  ) : (
    <Login onLogin={setUser} />
  );
}
