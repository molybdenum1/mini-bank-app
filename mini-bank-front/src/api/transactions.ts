import { apiFetch } from "./client";
import type { TransactionsResponse } from "./types";

// GET /transactions?type=&page=&limit=
export async function getTransactions(
  params: { type?: string; page?: number; limit?: number } = {},
  token?: string
): Promise<TransactionsResponse> {
  const q = new URLSearchParams();
  if (params.limit) q.set("limit", String(params.limit));
  if (params.page) q.set("page", String(params.page));
  if (params.type) q.set("type", params.type);
  const path = `/transactions?${q.toString()}`;
  return apiFetch(path, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  }) as Promise<TransactionsResponse>;
}

// POST /transactions/transfer - body { to, amount, currency }
export async function postTransfer(
  token: string,
  payload: {
    fromAccountId?: number | string;
    toAccountId: number | string;
    amount: number;
  }
) {
  // backend expects body: { fromAccountId, toAccountId, amount }
  return apiFetch(`/transactions/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fromAccountId: payload.fromAccountId,
      toAccountId: payload.toAccountId,
      amount: payload.amount,
    }),
  });
}

// POST /transactions/exchange - body { fromAccountId, toAccountId, amount, fromCurrency, toCurrency }
export async function postExchange(
  token: string,
  payload: {
    fromAccountId?: number | string;
    toAccountId?: number | string;
    amount: number;
    fromCurrency?: string;
    toCurrency?: string;
    rate?: string;
  }
) {
  return apiFetch(`/transactions/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
