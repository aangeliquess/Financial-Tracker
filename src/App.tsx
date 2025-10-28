import React, { useEffect, useMemo, useState } from "react"
import { PlusCircle, Trash2, Sun, Moon, Wallet2 } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"
import { motion, AnimatePresence } from "framer-motion"

type TxType = "income" | "expense"
type Tx = { id: string; desc: string; amount: number; type: TxType; date: string }

const LS_TX = "financial-tracker:tx"
const LS_DARK = "financial-tracker:dark"
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
const todayISO = () => new Date().toISOString().slice(0, 10)
const setDarkClass = (on: boolean) => {
  const root = document.documentElement
  on ? root.classList.add("dark") : root.classList.remove("dark")
  localStorage.setItem(LS_DARK, on ? "1" : "0")
}
const getDarkPref = () => localStorage.getItem(LS_DARK) === "1"

export default function App() {
  const [tx, setTx] = useState<Tx[]>(() => {
    try {
      const raw = localStorage.getItem(LS_TX)
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
  const [dark, setDark] = useState(getDarkPref())
  useEffect(() => setDarkClass(dark), [dark])
  useEffect(() => localStorage.setItem(LS_TX, JSON.stringify(tx)), [tx])

  const { incomeTotal, expenseTotal, balance } = useMemo(() => {
    const income = tx.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0)
    const expense = tx.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0)
    return { incomeTotal: income, expenseTotal: expense, balance: income - expense }
  }, [tx])

  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      map.set(d.toISOString().slice(0, 10), 0)
    }
    tx.forEach(t => {
      if (map.has(t.date)) map.set(t.date, (map.get(t.date) ?? 0) + (t.type === "income" ? t.amount : -t.amount))
    })
    return Array.from(map.entries()).map(([iso, value]) => ({
      date: new Date(iso).toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
      value,
    }))
  }, [tx])

  function addTx(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const val = Number(amount)
    if (!desc.trim()) return setError("Description is required.")
    if (!amount || isNaN(val)) return setError("Enter a valid amount.")
    if (val <= 0) return setError("Amount must be greater than 0.")
    setTx(prev => [
      { id: crypto.randomUUID(), desc: desc.trim(), amount: Number(val.toFixed(2)), type, date },
      ...prev,
    ])
    setDesc("")
    setAmount("")
    setType("expense")
    setDate(todayISO())
  }
  const removeTx = (id: string) => setTx(prev => prev.filter(t => t.id !== id))

  return (
    <div className={`min-h-screen ${dark ? "dark bg-slate-950" : ""}`}>
      {/* BRANDED HERO BAR */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 dark:from-violet-700 dark:via-indigo-800 dark:to-indigo-900">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/15 rounded-xl p-2 ring-1 ring-white/20">
                <Wallet2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/80">School on Wheels</p>
                <h1 className="text-xl font-semibold">Financial Wellness Tracker</h1>
              </div>
            </div>

            <button
              onClick={() => setDark(v => !v)}
              aria-label="Toggle dark mode"
              className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/25 transition"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 bg-amber-400 text-slate-900 rounded-full px-3 py-1 text-xs font-semibold shadow">
            <span className="h-2 w-2 rounded-full bg-slate-900/70" /> UBI Budgeting • Smart Tracking • Simple Insights
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl font-bold text-white leading-tight">
            Welcome to your <span className="underline decoration-amber-300">financial journey</span>
          </h2>
          <p className="mt-2 max-w-2xl text-white/85">
            Track income and spending, see your weekly trend, and make every dollar work for you.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto -mt-10 px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Summary + Chart */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard label="Income" value={currency(incomeTotal)} variant="success" />
              <SummaryCard label="Expenses" value={currency(expenseTotal)} variant="danger" />
              <SummaryCard label="Balance" value={currency(balance)} variant={balance >= 0 ? "success" : "danger"} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Last 7 Days (Net)</p>
                <span className="text-xs bg-amber-400/90 text-slate-900 rounded-full px-2 py-0.5 font-semibold">
                  Preview
                </span>
              </div>
              <div className="h-40 text-violet-700 dark:text-violet-300">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        background: dark ? "#0b1220" : "#ffffff",
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

          {/* Form */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Transaction</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Log a purchase or add income. Tip: set type to <span className="font-semibold">Income</span> for your UBI.
            </p>

            <form onSubmit={addTx} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Groceries, Paycheck, Coffee"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as TxType)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
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
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-violet-700 hover:bg-violet-800 text-white rounded-lg py-2 font-medium transition flex items-center justify-center gap-2 shadow"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Transaction
                </button>
                {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
              </div>
            </form>
          </section>
        </div>

        {/* List */}
        <section className="mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-2 sm:p-4">
          <h4 className="px-2 py-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Activity</h4>
          {tx.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence initial={false}>
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {tx.map(item => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-between gap-4 py-3 px-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white truncate">{item.desc}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={
                          "font-semibold " + (item.type === "income" ? "text-emerald-600" : "text-rose-600")
                        }
                      >
                        {item.type === "income" ? "+" : "-"}
                        {currency(item.amount)}
                      </span>
                      <button
                        aria-label="Delete transaction"
                        onClick={() => removeTx(item.id)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]"
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

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Built for SOW students • Your data stays on your device (localStorage) • © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}

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
      ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/15 dark:text-emerald-300 dark:border-emerald-900/30"
      : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/15 dark:text-rose-300 dark:border-rose-900/30"
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
      <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">No transactions yet</p>
      <p className="text-sm">Add your first one above to get started.</p>
    </div>
  )
}
