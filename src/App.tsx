import React, { useEffect, useMemo, useState } from "react"
import { PlusCircle, Trash2, Sun, Moon } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"

// ---------------- Types ----------------
type TxType = "income" | "expense"
type Tx = {
  id: string
  desc: string
  amount: number
  type: TxType
  date: string // ISO yyyy-mm-dd
}

// ---------------- Helpers ----------------
const LS_TX = "financial-tracker:tx"
const LS_DARK = "financial-tracker:dark"

const currency = (n: number) =>
  n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })

const todayISO = () => new Date().toISOString().slice(0, 10)

const setDarkClass = (on: boolean) => {
  const root = document.documentElement
  on ? root.classList.add("dark") : root.classList.remove("dark")
  localStorage.setItem(LS_DARK, on ? "1" : "0")
}
const getDarkPref = () => localStorage.getItem(LS_DARK) === "1"

// ---------------- Component ----------------
export default function App() {
  // transactions
  const [tx, setTx] = useState<Tx[]>(() => {
    try {
      const raw = localStorage.getItem(LS_TX)
      return raw ? (JSON.parse(raw) as Tx[]) : []
    } catch {
      return []
    }
  })

  // form
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [type, setType] = useState<TxType>("expense")
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState<string | null>(null)

  // theme
  const [dark, setDark] = useState(getDarkPref())
  useEffect(() => setDarkClass(dark), [dark])

  // persist
  useEffect(() => {
    localStorage.setItem(LS_TX, JSON.stringify(tx))
  }, [tx])

  // derived totals
  const { incomeTotal, expenseTotal, balance } = useMemo(() => {
    const income = tx.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0)
    const expense = tx.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0)
    return { incomeTotal: income, expenseTotal: expense, balance: income - expense }
  }, [tx])

  // 7-day net for chart
  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const k = d.toISOString().slice(0, 10)
      map.set(k, 0)
    }
    tx.forEach(t => {
      if (map.has(t.date)) {
        const delta = t.type === "income" ? t.amount : -t.amount
        map.set(t.date, (map.get(t.date) ?? 0) + delta)
      }
    })
    return Array.from(map.entries()).map(([iso, value]) => ({
      date: new Date(iso).toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
      value,
    }))
  }, [tx])

  // actions
  function addTx(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const val = Number(amount)
    if (!desc.trim()) return setError("Description is required.")
    if (!amount || isNaN(val)) return setError("Enter a valid amount.")
    if (val <= 0) return setError("Amount must be greater than 0.")

    const item: Tx = {
      id: crypto.randomUUID(),
      desc: desc.trim(),
      amount: Number(val.toFixed(2)),
      type,
      date,
    }
    setTx(prev => [item, ...prev])
    setDesc("")
    setAmount("")
    setType("expense")
    setDate(todayISO())
  }

  function removeTx(id: string) {
    setTx(prev => prev.filter(t => t.id !== id))
  }

  // ---------------- UI ----------------
  return (
    <div
      className={`min-h-screen ${
        dark ? "dark bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"
      } flex flex-col items-center p-6`}
    >
      <div className="w-full max-w-xl space-y-6">
        {/* Header / Summary */}
        <header className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              💰 Financial Tracker
            </h1>
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDark(v => !v)}
              className="ml-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              title="Toggle theme"
            >
              {dark ? <Sun className="w-5 h-5 text-slate-100" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <SummaryCard label="Income" value={currency(incomeTotal)} variant="success" />
            <SummaryCard label="Expenses" value={currency(expenseTotal)} variant="danger" />
            <SummaryCard label="Balance" value={currency(balance)} variant={balance >= 0 ? "success" : "danger"} />
          </div>

          {/* 7-day net chart */}
          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Last 7 days (net)</p>
            <div className="h-40 text-slate-700 dark:text-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: dark ? "#cbd5e1" : "#475569" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: dark ? "#0f172a" : "#ffffff",
                      color: dark ? "#e2e8f0" : "#0f172a",
                    }}
                    formatter={(v: number) => [
                      currency(v as number),
                      "Net",
                    ]}
                  />
                  <Area type="monotone" dataKey="value" stroke="currentColor" fill="url(#area)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </header>

        {/* Form */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Add Transaction</h2>

          <form onSubmit={addTx} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g., Groceries, Paycheck, Coffee"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as TxType)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
              {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            </div>
          </form>
        </section>

        {/* List */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-2 sm:p-4 border border-slate-200 dark:border-slate-700">
          <h2 className="sr-only">Transactions</h2>

          {tx.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence initial={false}>
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {tx.map(item => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-between gap-4 py-3 px-2 sm:px-1"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                        {item.desc}
                      </p>
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
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98]"
                      >
                        <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </AnimatePresence>
          )}
        </section>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Data is stored in your browser only (localStorage). Refresh-safe ✅
        </p>
      </div>
    </div>
  )
}

// ---------------- Tiny UI bits ----------------
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
      ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40"
      : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/40"
  return (
    <div className={`rounded-xl border ${color} p-3 text-center`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
      <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">
        No transactions yet
      </p>
      <p className="text-sm">Add your first one above to get started.</p>
    </div>
  )
}
