import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "../styles/auth.css";

export default function RegisterPage() {
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await auth.register(username, password, name);
    setMsg("Registered (demo). You can now login.");
    setUsername("");
    setName("");
    setPassword("");
  }

  return (
    <div className="auth-root">
      <h1>Register</h1>
      <form onSubmit={submit} className="auth-form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="auth-actions">
          <button type="submit">Register</button>
          <Link to="/login">Back to login</Link>
        </div>
      </form>
      {msg && <div className="auth-msg">{msg}</div>}
    </div>
  );
}
