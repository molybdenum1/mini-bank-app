import { useEffect, useState } from "react";
import type { Balance } from "../api/types";
import "../styles/components.css";

type ErrorMap = { [k: string]: string };

export default function TransferPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const [errors, setErrors] = useState<ErrorMap>({});
  const [success, setSuccess] = useState("");
  const [wallets, setWallets] = useState<Balance[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("mini_bank_token");
    if (!token) {
      setWallets([
        { id: 1, currency: "USD", amount: 1240.5 },
        { id: 2, currency: "EUR", amount: 830.25 },
      ]);
      return;
    }
    let mounted = true;
    import("../api/wallets")
      .then((m) => m.getWallets(token))
      .then((w) => {
        if (!mounted) return;
        setWallets(w);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, []);

  function validate() {
    const e: ErrorMap = {};
    if (!recipient) e.recipient = "Enter recipient id";
    const a = parseFloat(amount);
    if (!amount || isNaN(a) || a <= 0) e.amount = "Enter a valid amount > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess("");
    if (!validate()) return;
    const a = parseFloat(amount);
    const token = localStorage.getItem("mini_bank_token");
    if (token) {
      const recipientId = recipient.trim();
      const maybeNumber = /^\d+$/.test(recipientId)
        ? Number(recipientId)
        : recipientId;
      const maybeFrom = fromAccount
        ? /^\d+$/.test(fromAccount)
          ? Number(fromAccount)
          : fromAccount
        : undefined;
      import("../api/actions")
        .then((m) => m.transfer(token, maybeNumber, a, maybeFrom))
        .then(() => {
          setSuccess(
            `Sent ${currency === "USD" ? "$" : "€"}${a.toFixed(
              2
            )} to ${recipientId}`
          );
          setRecipient("");
          setAmount("");
          setFromAccount("");
        })
        .catch((err) => setErrors({ ...errors, form: String(err) }));
    } else {
      // Demo behaviour
      setSuccess(
        `Sent ${currency === "USD" ? "$" : "€"}${a.toFixed(2)} to ${recipient}`
      );
      setRecipient("");
      setAmount("");
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h1>Transfer</h1>
      <form
        onSubmit={submit}
        className="form"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 480,
        }}
      >
        <label>
          Recipient ID
          <input
            className="transfer-recipient"
            placeholder="enter id or identifier"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          {errors.recipient && (
            <div style={{ color: "red", fontSize: 13 }}>{errors.recipient}</div>
          )}
        </label>

        <label>
          From Account
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            {wallets.length > 0 ? (
              wallets.map((w) => (
                <label
                  key={String(w.id)}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="radio"
                    name="fromAccount"
                    value={String(w.id)}
                    checked={String(w.id) === fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                  />
                  <span>
                    {w.currency} — {w.amount.toFixed(2)} (id: {w.id})
                  </span>
                </label>
              ))
            ) : (
              <input
                className="transfer-from-input"
                placeholder="optional from account id"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
              />
            )}
          </div>
        </label>

        <label>
          Amount
          <input
            className="transfer-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
          {errors.amount && (
            <div style={{ color: "red", fontSize: 13 }}>{errors.amount}</div>
          )}
        </label>

        <label>
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "USD" | "EUR")}
          >
            <option>USD</option>
            <option>EUR</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Send</button>
          <button
            type="button"
            onClick={() => {
              setRecipient("");
              setAmount("");
              setErrors({});
              setSuccess("");
            }}
          >
            Reset
          </button>
        </div>

        {success && (
          <div style={{ color: "green", marginTop: 8 }}>{success}</div>
        )}
      </form>
    </div>
  );
}
