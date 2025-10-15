import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "../styles/auth.css";

export default function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const params = new URLSearchParams(loc.search);
  const returnTo = params.get("returnTo") ?? "/";
  const expired = params.get("expired") === "1";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await auth.login(username, password);
    nav(returnTo);
  }

  return (
    <div className="auth-root">
      <h1>Login</h1>
      {expired && (
        <div className="auth-error">Session expired — please log in again.</div>
      )}
      <form onSubmit={submit} className="auth-form">
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
          <button type="submit">Login</button>
          <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
