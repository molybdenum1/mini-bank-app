import { apiFetch } from "./client";
import type { Balance, Account } from "./types";

// GET /accounts - list user's accounts with balances
// server returns array like: [{ id: 2, currency: 'EUR', balance: '450.00' }, { id: 1, currency: 'USD', balance: '1100.00' }]
export async function getAccounts(token?: string): Promise<Account[]> {
  return apiFetch(`/accounts`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
}

// GET /accounts/:id/balance
export async function getAccountBalance(
  id: string,
  token?: string
): Promise<{ balance: number }> {
  return apiFetch(`/accounts/${encodeURIComponent(id)}/balance`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
}

export async function getWallets(token?: string): Promise<Balance[]> {
  const res = await getAccounts(token);
  const balances = res.map((r) => {
    return {
      id: r.id,
      currency: r.currency,
      amount: Math.round(parseFloat(r.balance) * 100) / 100,
    };
  });
  return balances;
}
