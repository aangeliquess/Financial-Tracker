import React, { useEffect, useMemo, useState } from "react"
import { Moon, Sun, PlusCircle, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

// ---------- types ----------
type TxType = "income" | "expense"
type Tx = {
  id: string
  desc: string
  amount: number
  type: TxType
  date: string // yyyy-mm-dd
}

// ---------- helpers ----------
const LS_TX = "financial-tracker:tx"
const LS_DARK = "financial-tracker:dark"

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" })

const todayISO = () => new Date().toISOString().slice(0, 10)

const setDarkClass = (on: boolean) => {
  const root = document.documentElement
  on ? root.classList.add("dark") : root.classList.remove("dark")
  localStorage.setItem(LS_DARK, on ? "1" : "0")
}

// ---------- ui ----------
export default function App() {
  // theme
  const [dark, setDark] = useState<boolean>(
    typeof window !== "undefined" && localStorage.getItem(LS_DARK) === "1",
  )
  useEffect(() => setDarkClass(dark), [dark])

  // data
  const [tx, setTx] = useState<Tx[]>(() => {
    try {
      const raw = localStorage.getItem(LS_TX)
      return raw ? (JSON.parse(raw) as Tx[]) : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    localStorage.setItem(LS_TX, JSON.stringify(tx))
  }, [tx])

  // form state
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [type, setType] = useState<TxType>("expense")
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState<string | null>(null)

  // derived totals
  const { incomeTotal, expenseTotal, balance } = useMemo(() => {
    const inc = tx.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0)
    const exp = tx.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0)
    return { incomeTotal: inc, expenseTotal: exp, balance: inc - exp }
  }, [tx])

  // chart data: last 7 days net (income - expense)
  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      map.set(key, 0)
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

  // handlers
  function addTx(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const val = Number(amount)
    if (!desc.trim()) return setError("Description is required.")
    if (!amount || isNaN(val) || val <= 0) return setError("Enter a valid amount > 0.")
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
  const removeTx = (id: string) => setTx(prev => prev.filter(t => t.id !== id))

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-6 ${
        dark ? "dark bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"
      }`}
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* header / summary */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              💰 Financial Tracker
            </h1>
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDark(v => !v)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
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

          <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">Last 7 days (net)</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: dark ? "#cbd5e1" : "#475569" }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(226,232,240,1)",
                      background: dark ? "#0f172a" : "#fff",
                      color: dark ? "#e2e8f0" : "#0f172a",
                    }}
                    formatter={(v: number) => [currency(v as number), "Net"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="currentColor" fill="url(#area)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* form */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Add transaction</h2>

          <form onSubmit={addTx} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g., Groceries, Paycheck, Coffee"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as TxType)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-lg py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Add transaction
              </button>
              {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            </div>
          </form>
        </section>

       
