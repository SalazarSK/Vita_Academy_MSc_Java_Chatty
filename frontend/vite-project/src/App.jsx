import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { getStoredUser } from "./api/api";

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  return user ? (
    <Chat user={user} onLogout={() => setUser(null)} />
  ) : (
    <Login onLogin={setUser} />
  );
}
