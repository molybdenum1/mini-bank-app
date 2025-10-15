import { useContext, type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context";

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const loc = useLocation();
  if (!auth.token)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(loc.pathname + loc.search)}`}
        replace
      />
    );
  return children;
}
