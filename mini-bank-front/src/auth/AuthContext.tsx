import React, { useEffect, useState } from "react";
import { TOKEN_KEY, USER_KEY } from "./constants";
import { AuthContext } from "./context";

// AuthContext is provided from ./context

// constants are imported from ./constants

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<string | null>(() =>
    localStorage.getItem(USER_KEY)
  );

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, user);
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  async function login(username: string, password: string) {
    // use api wrapper
    const data = await import("../api/auth").then((m) =>
      m.login(username, password)
    );

    // normalize common token fields returned by various backends
    const tokenValue = data?.token;

    if (!tokenValue) {
      // Log the response to help debugging why token wasn't returned

      console.warn("login() response did not include a token:", data);
      throw new Error(
        "Authentication succeeded but server did not return a token"
      );
    }

    setToken(tokenValue);
    setUser(username);
  }

  async function register(username: string, password: string, name?: string) {
    await import("../api/auth").then((m) =>
      m.register(username, password, name)
    );
    setUser(username);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth and RequireAuth moved to ./useAuth.tsx to keep this file focused on the provider
