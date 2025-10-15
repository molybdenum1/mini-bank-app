import { useEffect, useMemo, useState } from "react";
import type { TransactionItem, TransactionsResponse } from "../api/types";

export default function TransactionsPage() {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filter by transaction type: all | transfer | exchange
  const [filter, setFilter] = useState<"all" | "transfer" | "exchange">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("mini_bank_token");
      try {
        if (token) {
          const { getTransactions } = await import("../api/transactions");
          const typeFilter = filter === "all" ? undefined : filter;
          const data = (await getTransactions(
            { limit: pageSize, page, type: typeFilter },
            token
          )) as TransactionsResponse;
          setItems(data.items ?? []);
          setTotal(typeof data.total === "number" ? data.total : null);
        } else {
          // fallback demo dataset that matches new server shape
          const demo: TransactionItem[] = Array.from({ length: 12 }).map(
            (_, i) => ({
              id: i + 1,
              type: i % 3 === 0 ? "exchange" : "transfer",
              createdAt: `2025-10-${(i % 30) + 1}T12:00:00.000Z`,
              ledgerEntries: [
                {
                  id: i * 2 + 1,
                  amount: i % 2 === 0 ? "-100.00" : "100.00",
                  description: i % 2 === 0 ? "outgoing" : "incoming",
                  createdAt: `2025-10-${(i % 30) + 1}T12:00:00.000Z`,
                },
                {
                  id: i * 2 + 2,
                  amount: i % 2 === 0 ? "100.00" : "-100.00",
                  description: "counter",
                  createdAt: `2025-10-${(i % 30) + 1}T12:00:00.000Z`,
                },
              ],
            })
          );
          const filtered = demo.filter((t) =>
            filter === "all" ? true : t.type === filter
          );
          setTotal(filtered.length);
          setItems(
            filtered.slice(
              (page - 1) * pageSize,
              (page - 1) * pageSize + pageSize
            )
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter, page, pageSize]);

  const totalPages = useMemo(
    () => (total ? Math.max(1, Math.ceil(total / pageSize)) : 1),
    [total, pageSize]
  );

  return (
    <div style={{ padding: 12 }}>
      <h1>Transactions</h1>

      <div
        className="form"
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
          flexDirection: "row",
        }}
      >
        <label>
          Filter
          <select
            className="inline-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as "all" | "transfer" | "exchange");
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="transfer">Transfer</option>
            <option value="exchange">Exchange</option>
          </select>
        </label>

        <label>
          Page size
          <select
            className="inline-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>

        <div style={{ marginLeft: "auto" }}>
          {total !== null && <small>Total: {total}</small>}
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{ textAlign: "left", borderBottom: "1px solid #e6edf3" }}
            >
              <th style={{ padding: "8px" }}>Date</th>
              <th style={{ padding: "8px" }}>Description</th>
              <th style={{ padding: "8px" }}>Currency</th>
              <th style={{ padding: "8px" }}>Amount</th>
              <th style={{ padding: "8px" }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {items.map((tx) => {
              const entry = tx.ledgerEntries && tx.ledgerEntries[0];
              const amount = entry ? parseFloat(String(entry.amount)) : 0;
              const desc = entry?.description ?? tx.type;
              const date = tx.createdAt;
              return (
                <tr
                  key={String(tx.id)}
                  style={{ borderBottom: "1px dashed #eef2f6" }}
                >
                  <td style={{ padding: "8px" }}>{date}</td>
                  <td style={{ padding: "8px" }}>{desc}</td>
                  <td style={{ padding: "8px" }}>
                    {amount < 0 ? "Out" : "In"}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      color: amount < 0 ? "#ef4444" : "#059669",
                    }}
                  >
                    {amount < 0 ? "-" : ""}
                    {Math.abs(amount).toFixed(2)}
                  </td>
                  <td style={{ padding: "8px" }}>{tx.type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div
        style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <div>
          Page {page} of {totalPages}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
