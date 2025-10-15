import { BASE_URL, TOKEN_KEY, USER_KEY } from "../auth/constants";

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, opts);

  if (res.status === 401) {
    // token invalid or expired — clear local auth and redirect to login with flag
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
    // Use location.replace to avoid keeping the protected page in history
    if (typeof window !== "undefined") {
      const returnTo = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.replace(`/login?expired=1&returnTo=${returnTo}`);
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return res.json();
}

export function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
