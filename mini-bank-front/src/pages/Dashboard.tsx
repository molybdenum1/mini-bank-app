import React, { useEffect, useState } from 'react'
import type { Balance, TransactionItem } from '../api/types'
import './Dashboard.css'

export default function Dashboard() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const token = localStorage.getItem('mini_bank_token')
      try {
        if (token) {
          const [{ getWallets }, { getTransactions }] = await Promise.all([
            import('../api/wallets'),
            import('../api/transactions'),
          ])
          const wb = await getWallets(token)
          console.log('wb', wb);
          if (!mounted) return
          setBalances(wb)
          const txResp = await getTransactions({ limit: 5 }, token)
          if (!mounted) return
          setTransactions((txResp as { items?: TransactionItem[] }).items ?? [])
        } else {
          setBalances([{ currency: 'USD', amount: 1240.5, id: 1 }, { currency: 'EUR', amount: 830.25, id: 2 }])
          setTransactions([
            { id: 1, type: 'transfer', createdAt: '2025-10-14T18:57:44.647Z', ledgerEntries: [{ id: 1, amount: '-3.50', description: 'Coffee', createdAt: '2025-10-14T18:57:44.647Z' }] },
            { id: 2, type: 'income', createdAt: '2025-10-13T09:00:00.000Z', ledgerEntries: [{ id: 2, amount: '2000.00', description: 'Salary', createdAt: '2025-10-13T09:00:00.000Z' }] },
            { id: 3, type: 'payment', createdAt: '2025-10-12T15:30:00.000Z', ledgerEntries: [{ id: 3, amount: '-45.20', description: 'Groceries', createdAt: '2025-10-12T15:30:00.000Z' }] },
            { id: 4, type: 'transfer', createdAt: '2025-10-11T12:00:00.000Z', ledgerEntries: [{ id: 4, amount: '150.00', description: 'Transfer from Alex', createdAt: '2025-10-11T12:00:00.000Z' }] },
            { id: 5, type: 'payment', createdAt: '2025-10-10T09:15:00.000Z', ledgerEntries: [{ id: 5, amount: '-29.99', description: 'Gym', createdAt: '2025-10-10T09:15:00.000Z' }] },
          ])
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Transfer form state
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferCurrency, setTransferCurrency] = useState<'USD'|'EUR'>('USD')

  // Exchange form state
  const [fromCurrency, setFromCurrency] = useState<'USD'|'EUR'>('USD')
  const [toCurrency, setToCurrency] = useState<'USD'|'EUR'>('EUR')
  const [exchangeAmount, setExchangeAmount] = useState('')

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(transferAmount)
    if (!transferTo || !amt || amt <= 0) return
    const token = localStorage.getItem('mini_bank_token')
    const transferFrom = balances.find(b => b.currency === transferCurrency)?.id
    if (token) {
      try {
        const { transfer } = await import('../api/actions');
        const res = await transfer(token, +transferTo, amt, transferFrom)
        if (res) {
          setBalances(balances =>
            balances.map(balance =>
              balance.currency === transferCurrency
                ? { ...balance, amount: +(balance.amount - amt).toFixed(2) }
                : balance
            )
          )
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      setBalances(b =>
        b.map(balance =>
          balance.currency === transferCurrency
            ? { ...balance, amount: +(balance.amount - amt).toFixed(2) }
            : balance
        )
      )
    }
    setTransferTo('')
    setTransferAmount('')
  }

  async function handleExchange(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(exchangeAmount)
    if (!amt || amt <= 0 || fromCurrency === toCurrency) return
    const token = localStorage.getItem('mini_bank_token')
    const rate = fromCurrency === 'USD' && toCurrency === 'EUR' ? 0.92 : 1 / 0.92
    const fromAccountId = balances.find(b => b.currency === fromCurrency)?.id;
    const toAccountId = balances.find(b => b.currency === toCurrency)?.id;
    console.log('exchanging', { amt, fromAccountId, toAccountId, rate: String(rate) });
    if (token) {
      try {
        const { exchange } = await import('../api/actions')
        const data = await exchange(token, { amount: amt, fromAccountId, toAccountId, rate: String(rate) })
        // If API returned updated balances use them.
        if (data && (data.USD !== undefined || data.EUR !== undefined)) {
          setBalances(balances =>
            balances.map(balance =>
              balance.currency === 'USD'
                ? { ...balance, amount: data.USD ?? balance.amount }
                : balance.currency === 'EUR'
                ? { ...balance, amount: data.EUR ?? balance.amount }
                : balance
            )
          )
        } else {
          // Fallback: compute converted amount locally and update both balances
          const converted = +(amt * rate).toFixed(2)
          setBalances(balances =>
            balances.map(balance => {
              if (balance.currency === fromCurrency) {
                return { ...balance, amount: +(balance.amount - amt).toFixed(2) }
              }
              if (balance.currency === toCurrency) {
                return { ...balance, amount: +(balance.amount + converted).toFixed(2) }
              }
              return balance
            })
          )
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      setBalances(b =>
        b.map(balance => {
          if (balance.currency === fromCurrency) {
            return { ...balance, amount: +(balance.amount - amt).toFixed(2) }
          }
          if (balance.currency === toCurrency) {
            return { ...balance, amount: +(balance.amount + +(amt * rate).toFixed(2)).toFixed(2) }
          }
          return balance
        })
      )
    }
    setExchangeAmount('')
  }

  const last5 = transactions.slice(0,5)

  return (
    <div className="db-root">
      <header className="db-header">
        <h1>Dashboard</h1>
        <p className="db-sub">Minimalistic overview of wallets</p>
      </header>

      <section className="balances">
        <div className="card small">
          <div className="label">USD Wallet</div>
          <div className="amount">${(balances.find(b => b.currency === 'USD')?.amount ?? 0).toFixed(2)}</div>
        </div>
        <div className="card small">
          <div className="label">EUR Wallet</div>
          <div className="amount">€{(balances.find(b => b.currency === 'EUR')?.amount ?? 0).toFixed(2)}</div>
        </div>
      </section>

      <section className="middle">
        <div className="panel">
          <h2>Last 5 Transactions</h2>
          <ul className="tx-list">
            {last5.map(tx => {
              const entry = tx.ledgerEntries && tx.ledgerEntries[0]
              const amt = entry ? parseFloat(entry.amount ?? '0') : 0
              const dateStr = entry?.createdAt ?? tx.createdAt ?? ''
              const date = dateStr ? new Date(dateStr).toLocaleString() : ''
              return (
                <li key={String(tx.id)} className="tx">
                  <div className="tx-left">
                    <div className="tx-desc">{entry?.description ?? tx.type}</div>
                    <div className="tx-date">{date}</div>
                  </div>
                  <div className={"tx-amt " + (amt < 0 ? 'neg' : 'pos')}>
                    {amt < 0 ? '-' : ''}{Math.abs(amt).toFixed(2)}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="panel">
          <h2>Transfer</h2>
          <form onSubmit={handleTransfer} className="form">
            <label>
              To (id or email)
              <input value={transferTo} onChange={e => setTransferTo(e.target.value)} />
            </label>
            <label>
              Amount
              <input value={transferAmount} onChange={e => setTransferAmount(e.target.value)} inputMode="decimal" />
            </label>
            <label>
              Currency
              <select value={transferCurrency} onChange={e => setTransferCurrency(e.target.value as 'USD'|'EUR')}>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </label>
            <div className="actions">
              <button type="submit">Send</button>
            </div>
          </form>
        </div>
      </section>

      <section className="exchange panel">
        <h2>Exchange</h2>
        <form onSubmit={handleExchange} className="form inline">
          <label>
            From
            <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value as 'USD'|'EUR')}>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </label>
          <label>
            To
            <select value={toCurrency} onChange={e => setToCurrency(e.target.value as 'USD'|'EUR')}>
              <option>EUR</option>
              <option>USD</option>
            </select>
          </label>
          <label>
            Amount
            <input value={exchangeAmount} onChange={e => setExchangeAmount(e.target.value)} inputMode="decimal" />
          </label>
          <div className="actions">
            <button type="submit">Exchange</button>
          </div>
        </form>
      </section>
    </div>
  )
}
