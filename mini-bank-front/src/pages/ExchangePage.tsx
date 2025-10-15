import { useEffect, useMemo, useState } from "react";
import { getWallets } from "../api/wallets";
import { exchange as apiExchange } from "../api/actions";
import type { Balance } from "../api/types";
import "../styles/components.css";

const RATE_USD_TO_EUR = 0.92;

export default function ExchangePage() {
  const [wallets, setWallets] = useState<Balance[]>([]);
  const [fromAccountId, setFromAccountId] = useState<number | string | "">("");
  const [toAccountId, setToAccountId] = useState<number | string | "">("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("mini_bank_token");
    if (token) {
      getWallets(token)
        .then(setWallets)
        .catch(() => {
          // fallback demo wallets
          setWallets([
            { id: 1, currency: "USD", amount: 1100 },
            { id: 2, currency: "EUR", amount: 450 },
          ]);
        });
    } else {
      setWallets([
        { id: 1, currency: "USD", amount: 1100 },
        { id: 2, currency: "EUR", amount: 450 },
      ]);
    }
  }, []);

  // try to preselect accounts when wallets load
  useEffect(() => {
    if (wallets.length >= 2) {
      if (!fromAccountId) setFromAccountId(wallets[0].id);
      if (!toAccountId)
        setToAccountId(
          wallets.find((w) => w.id !== wallets[0].id)?.id ?? wallets[1].id
        );
    }
  }, [wallets, fromAccountId, toAccountId]);

  const fromCurrency = useMemo(
    () =>
      wallets.find((w) => String(w.id) === String(fromAccountId))?.currency ??
      "",
    [wallets, fromAccountId]
  );
  const toCurrency = useMemo(
    () =>
      wallets.find((w) => String(w.id) === String(toAccountId))?.currency ?? "",
    [wallets, toAccountId]
  );

  const computedRate = useMemo(() => {
    if (fromCurrency === "USD" && toCurrency === "EUR") return RATE_USD_TO_EUR;
    if (fromCurrency === "EUR" && toCurrency === "USD")
      return 1 / RATE_USD_TO_EUR;
    return 1;
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    // set default rate input when currencies change
    if (!rate) setRate(String(computedRate.toFixed(4)));
  }, [computedRate, rate]);

  async function handleExchange() {
    setError("");
    setResult(null);
    const a = parseFloat(amount);
    if (!fromAccountId || !toAccountId) {
      setError("Select both source and target accounts");
      return;
    }
    if (String(fromAccountId) === String(toAccountId)) {
      setError("Choose different accounts");
      return;
    }
    if (isNaN(a) || a <= 0) {
      setError("Enter a valid amount > 0");
      return;
    }
    if (!rate || isNaN(parseFloat(rate))) {
      setError("Enter a valid rate");
      return;
    }

    const token = localStorage.getItem("mini_bank_token");
    const payload = {
      fromAccountId:
        typeof fromAccountId === "string"
          ? isNaN(Number(fromAccountId))
            ? fromAccountId
            : Number(fromAccountId)
          : fromAccountId,
      toAccountId:
        typeof toAccountId === "string"
          ? isNaN(Number(toAccountId))
            ? toAccountId
            : Number(toAccountId)
          : toAccountId,
      amount: a,
      rate: String(rate),
    };

    if (token) {
      try {
        type ExchangePayload = {
          fromAccountId?: number | string;
          toAccountId?: number | string;
          amount: number;
          rate?: string;
        };
        const res: unknown = await apiExchange(
          token,
          payload as ExchangePayload
        );
        // prefer backend-provided converted value or refreshed balances
        if (res && typeof res === "object" && "converted" in res) {
          const r = res as { converted?: number };
          if (typeof r.converted === "number") setResult(r.converted);
        }
        // refresh wallets from server if possible
        const refreshed = await getWallets(token);
        setWallets(refreshed);
      } catch (err) {
        let msg = String(err);
        if (err && typeof err === "object") {
          const e = err as Record<string, unknown>;
          if (typeof e.message === "string") msg = e.message;
        }
        setError(msg);
      }
    } else {
      // compute locally using provided rate
      const numericRate = parseFloat(rate);
      const converted = Math.round(a * numericRate * 100) / 100;
      setResult(converted);
      // update local demo wallets amounts
      setWallets((prev) =>
        prev.map((w) => {
          if (String(w.id) === String(fromAccountId))
            return { ...w, amount: Math.round((w.amount - a) * 100) / 100 };
          if (String(w.id) === String(toAccountId))
            return {
              ...w,
              amount: Math.round((w.amount + converted) * 100) / 100,
            };
          return w;
        })
      );
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h1>Exchange</h1>
      <div
        className="form"
        style={{
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <label>
          From account
          <select
            className="exchange-account"
            value={String(fromAccountId)}
            onChange={(e) => setFromAccountId(e.target.value)}
          >
            <option value="">-- select --</option>
            {wallets.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {String(w.id)} — {w.currency} — {w.amount.toFixed(2)}
              </option>
            ))}
          </select>
        </label>

        <label>
          To account
          <select
            className="exchange-account"
            value={String(toAccountId)}
            onChange={(e) => setToAccountId(e.target.value)}
          >
            <option value="">-- select --</option>
            {wallets.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {String(w.id)} — {w.currency} — {w.amount.toFixed(2)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Amount
          <input
            className="exchange-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </label>

        <label>
          <div style={{ color: "#475569" }}>
            Computed rate: {computedRate.toFixed(4)}
          </div>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExchange}>Exchange</button>
          <button
            onClick={() => {
              setAmount("");
              setRate("");
              setResult(null);
              setError("");
            }}
          >
            Reset
          </button>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {result !== null && (
          <div style={{ marginTop: 8 }}>
            Converted: {result.toFixed(2)} {toCurrency || ""}
          </div>
        )}
      </div>
    </div>
  );
}
