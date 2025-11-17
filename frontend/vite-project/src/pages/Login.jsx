import { useState } from "react";
import { login } from "../api/api";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");

  const handleLogin = async () => {
    const res = await login(name);
    onLogin(res);
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleLogin}>Enter</button>
    </div>
  );
}
