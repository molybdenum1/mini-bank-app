export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: "USD" | "EUR";
};

export type Balances = { USD: number; EUR: number };
export type Balance = {
  id: number | string;
  currency: "USD" | "EUR";
  amount: number;
};

export type Account = {
  id: number | string;
  currency: "USD" | "EUR";
  balance: string; // server returns balance as string like "450.00"
};

export type LedgerEntry = {
  id: number | string;
  amount: string; // server sends as string like "-100.00" or "100.00"
  description?: string;
  createdAt?: string;
};

export type TransactionItem = {
  id: number | string;
  type: string; // 'transfer' | 'exchange' | etc
  createdAt: string;
  ledgerEntries: LedgerEntry[];
};

export type TransactionsResponse = {
  items: TransactionItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};
