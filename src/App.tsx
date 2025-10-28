import React, { useEffect, useMemo, useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"

// ---- Types ----
type TxType = "income" | "expense"

type Tx = {
  id: string
  desc: string
  amount: number
  type: TxType
  date: string // ISO yyyy-mm-dd
}

// ---- Helpers ----
const LS_KEY = "financial-tracker:tx"
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function App() {
  // ---- State ----
  const [tx, setTx] = useState<Tx[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? (JSON.parse(raw) as Tx[]) : []
    } catch {
      return []
    }
  })

  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [type, setType] = useState<TxType>("expense")
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState<string | null>(null)

  // ---- Persist ----
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tx))
  }, [tx])

  // ---- Derived totals ----
  const { incomeTotal, expenseTotal, balance } = useMemo(() => {
    const income = tx.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0)
    const expense = tx.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0)
    return { incomeTotal: income, expenseTotal: expense, balance: income - expense }
  }, [tx])

  // ---- Handlers ----
  function addTx(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const val = Number(amount)
    if (!desc.trim()) return setError("Description is required.")
    if (!amount || isNaN(val)) return setError("Enter a valid amount.")
    if (val <= 0) return setError("Amount must be greater than 0.")

    const newItem: Tx = {
      id: crypto.randomUUID(),
      desc: desc.trim(),
      amount: Number(val.toFixed(2)),
      type,
      date,
    }
    setTx(prev => [newItem, ...prev])
    setDesc("")
    setAmount("")
    setType("expense")
    setDate(todayISO())
  }

  function removeTx(id: string) {
    setTx(prev => prev.filter(t => t.id !== id))
  }

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center p-6">
      <div className="w-full max-w-xl space-y-6">
        {/* Header / Summary */}
        <header className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold text-slate-800 text-center">💰 Financial Tracker</h1>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <SummaryCard label="Income" value={currency(incomeTotal)} variant="success" />
            <SummaryCard label="Expenses" value={currency(expenseTotal)} variant="danger" />
            <SummaryCard label="Balance" value={currency(balance)} variant={balance >= 0 ? "success" : "danger"} />
          </div>
        </header>

        {/* Form */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Add Transaction</h2>

          <form onSubmit={addTx} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g., Groceries, Paycheck, Coffee"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as TxType)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-lg py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Add Transaction
              </button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </section>

        {/* List */}
        <section className="bg-white rounded-2xl shadow p-2 sm:p-4">
          <h2 className="sr-only">Transactions</h2>

          {tx.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-slate-200">
              {tx.map(item => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3 px-2 sm:px-1">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                    <p className="font-medium text-slate-800 truncate">{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={
                        "font-semibold " +
                        (item.type === "income" ? "text-emerald-600" : "text-rose-600")
                      }
                    >
                      {item.type === "income" ? "+" : "-"}
                      {currency(item.amount)}
                    </span>

                    <button
                      aria-label="Delete transaction"
                      onClick={() => removeTx(item.id)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-[0.98]"
                    >
                      <Trash2 className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-500">
          Data is stored in your browser only (localStorage). Refresh-safe ✅
        </p>
      </div>
    </div>
  )
}

// ---- Small UI pieces ----
function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string
  value: string
  variant: "success" | "danger"
}) {
  const color =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-rose-50 text-rose-700 border-rose-100"
  return (
    <div className={`rounded-xl border ${color} p-3 text-center`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-slate-500">
      <p className="font-medium text-slate-700 mb-1">No transactions yet</p>
      <p className="text-sm">Add your first one above to get started.</p>
    </div>
  )
}
