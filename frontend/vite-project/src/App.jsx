import { useState } from "react";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={setUser} />;

  return <Chat user={user} />;
}
