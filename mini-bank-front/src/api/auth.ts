import { apiFetch } from "./client";

// POST /auth/login -> returns token (common names normalized below)
export async function login(
  email: string,
  password: string
): Promise<{
  token: string | null;
  user: string | null;
  raw: string | object;
}> {
  const data = await apiFetch(`/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  // normalize token and user fields
  const token =
    data?.token ??
    data?.access_token ??
    data?.accessToken ??
    data?.data?.token ??
    null;
  const user = data?.user ?? data?.username ?? data?.data?.user ?? null;
  return { token, user, raw: data };
}

// POST /auth/register -> register user; backend may return created user or token
export async function register(email: string, password: string, name?: string) {
  const payload: Record<string, string> = { email, password };
  if (name) payload.name = name;
  const data = await apiFetch(`/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const token = data?.token ?? data?.access_token ?? data?.accessToken ?? null;
  const user = data?.user ?? data?.username ?? null;
  return { token, user, raw: data };
}

export async function me(token?: string) {
  return apiFetch(`/auth/me`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
}
