import React, { useEffect, useMemo, useState } from "react"
import { PlusCircle, Trash2, Sun, Moon, Wallet2, Target, BookOpen, Award, Camera, Download, Upload, AlertCircle, ChevronRight, TrendingUp, DollarSign } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"
import { motion, AnimatePresence } from "framer-motion"

type TxType = "income" | "expense"
type Tx = { id: string; desc: string; amount: number; type: TxType; date: string; category: string; hasReceipt?: boolean }
type Goal = { id: string; name: string; amount: number; deadline: string }
type Receipt = { id: string; merchant: string; amount: number; date: string; category: string; fileUrl: string; items: Array<{ name: string; price: number }> }

const LS_TX = "financial-tracker:tx"
const LS_DARK = "financial-tracker:dark"
const LS_GOALS = "financial-tracker:goals"
const LS_WORKSHOPS = "financial-tracker:workshops"
const LS_RECEIPTS = "financial-tracker:receipts"
const LS_STIPEND = "financial-tracker:stipend"
const LS_NAME = "financial-tracker:name"

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
const todayISO = () => new Date().toISOString().slice(0, 10)
const setDarkClass = (on: boolean) => {
  const root = document.documentElement
  on ? root.classList.add("dark") : root.classList.remove("dark")
  localStorage.setItem(LS_DARK, on ? "1" : "0")
}
const getDarkPref = () => localStorage.getItem(LS_DARK) === "1"

const categories = ['Food', 'Transportation', 'School Supplies', 'Clothing', 'Personal Care', 'Entertainment', 'Savings', 'Other']

const lessons = [
  {
    title: "Understanding Your Money",
    content: "Money is a tool that helps you get what you need and want. With your UBI stipend, you have a regular income - this is money you can count on each month. The key is making it work for you!",
    tips: ["Track every dollar", "Needs come before wants", "Small savings add up"]
  },
  {
    title: "Creating a Budget",
    content: "A budget is your spending plan. It helps you decide where your money goes BEFORE you spend it. The 50/30/20 rule is a great start: 50% for needs, 30% for wants, 20% for savings and goals.",
    tips: ["List your monthly expenses", "Prioritize essentials first", "Leave room for unexpected costs"]
  },
  {
    title: "Smart Spending Strategies",
    content: "Every purchase is a choice. Before buying, ask: Do I need this? Can I afford it? Is there a cheaper option? Waiting 24 hours before non-essential purchases can save you money.",
    tips: ["Compare prices", "Use student discounts", "Buy generic when possible"]
  },
  {
    title: "Building Your Future",
    content: "Even small savings create big opportunities. Saving $20/month = $240/year. That could be a security deposit, emergency fund, or stepping stone to your dreams.",
    tips: ["Start with any amount", "Automate your savings", "Celebrate small wins"]
  }
]

const workshopsList = [
  "Financial Basics Workshop",
  "Budgeting 101",
  "Banking & Credit",
  "Job Readiness & Income",
  "Housing & Independent Living",
  "College Financial Planning"
]

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1']

export default function App() {
  const [view, setView] = useState<'welcome' | 'dashboard' | 'goals' | 'lessons' | 'workshops' | 'receipts'>(() => {
    const hasName = localStorage.getItem(LS_NAME)
    return hasName ? 'dashboard' : 'welcome'
  })
  
  const [studentName, setStudentName] = useState(() => localStorage.getItem(LS_NAME) || '')
  const [monthlyStipend, setMonthlyStipend] = useState(() => localStorage.getItem(LS_STIPEND) || '')
  
  const [tx, setTx] = useState<Tx[]>(() => {
    try {
      const raw = localStorage.getItem(LS_TX)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const raw = localStorage.getItem(LS_GOALS)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  
  const [workshops, setWorkshops] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LS_WORKSHOPS)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  
  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    try {
      const raw = localStorage.getItem(LS_RECEIPTS)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [type, setType] = useState<TxType>("expense")
  const [category, setCategory] = useState("Food")
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(getDarkPref())
  const [currentLesson, setCurrentLesson] = useState(0)
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  
  useEffect(() => setDarkClass(dark), [dark])
  useEffect(() => localStorage.setItem(LS_TX, JSON.stringify(tx)), [tx])
  useEffect(() => localStorage.setItem(LS_GOALS, JSON.stringify(goals)), [goals])
  useEffect(() => localStorage.setItem(LS_WORKSHOPS, JSON.stringify(workshops)), [workshops])
  useEffect(() => localStorage.setItem(LS_RECEIPTS, JSON.stringify(receipts)), [receipts])

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
  
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {}
    tx.filter(t => t.type === "expense").forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + t.amount
    })
    return Object.entries(spending).map(([name, value]) => ({ name, value }))
  }, [tx])
  
  const aiRecommendations = useMemo(() => {
    const recs: Array<{ type: string; title: string; message: string; action: string }> = []
    const budget = parseFloat(monthlyStipend) || 0
    const totalSpent = expenseTotal
    
    if (totalSpent > budget * 0.9 && budget > 0) {
      recs.push({
        type: 'warning',
        title: 'Budget Alert',
        message: `You've used ${((totalSpent/budget)*100).toFixed(0)}% of your stipend.`,
        action: 'Review non-essential spending'
      })
    }
    
    const foodSpending = categorySpending.find(c => c.name === 'Food')?.value || 0
    if (foodSpending > budget * 0.4 && budget > 0) {
      recs.push({
        type: 'tip',
        title: 'Food Savings Opportunity',
        message: `Food is ${((foodSpending/totalSpent)*100).toFixed(0)}% of spending.`,
        action: 'Try meal planning to save $20-30/week'
      })
    }
    
    const receiptCount = tx.filter(t => t.hasReceipt).length
    if (tx.length > 0 && receiptCount / tx.length < 0.5) {
      recs.push({
        type: 'tip',
        title: 'Keep Your Receipts!',
        message: `Only ${receiptCount} of ${tx.length} transactions have receipts.`,
        action: 'Upload receipts in Receipts tab'
      })
    }
    
    if (workshops.length < 3) {
      recs.push({
        type: 'tip',
        title: 'Build Your Skills',
        message: `Complete more workshops (${workshops.length}/6 done).`,
        action: 'Check Workshops tab'
      })
    }
    
    if (recs.length === 0) {
      recs.push({
        type: 'success',
        title: 'You\'re Doing Great!',
        message: 'Keep tracking and working toward your goals.',
        action: 'Keep up the good work'
      })
    }
    
    return recs
  }, [tx, expenseTotal, monthlyStipend, categorySpending, workshops])

  function handleWelcome(e: React.FormEvent) {
    e.preventDefault()
    if (!studentName.trim() || !monthlyStipend) return
    localStorage.setItem(LS_NAME, studentName)
    localStorage.setItem(LS_STIPEND, monthlyStipend)
    setView('dashboard')
  }

  function addTx(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const val = Number(amount)
    if (!desc.trim()) return setError("Description is required.")
    if (!amount || isNaN(val)) return setError("Enter a valid amount.")
    if (val <= 0) return setError("Amount must be greater than 0.")
    setTx(prev => [
      { id: crypto.randomUUID(), desc: desc.trim(), amount: Number(val.toFixed(2)), type, date, category },
      ...prev,
    ])
    setDesc("")
    setAmount("")
    setType("expense")
    setCategory("Food")
    setDate(todayISO())
  }
  
  const removeTx = (id: string) => setTx(prev => prev.filter(t => t.id !== id))
  
  const addGoal = (name: string, amount: number, deadline: string) => {
    setGoals(prev => [...prev, { id: crypto.randomUUID(), name, amount, deadline }])
  }
  
  const toggleWorkshop = (workshop: string) => {
    setWorkshops(prev => 
      prev.includes(workshop) ? prev.filter(w => w !== workshop) : [...prev, workshop]
    )
  }
  
  const processReceipt = (file: File) => {
    return new Promise<Receipt>((resolve) => {
      setTimeout(() => {
        const merchants = ['Target', 'Walmart', 'McDonalds', 'Metro Transit', 'CVS']
        const merchant = merchants[Math.floor(Math.random() * merchants.length)]
        const amt = Math.random() * 50 + 5
        const cat = merchant.includes('Donald') ? 'Food' : 
                    merchant.includes('Metro') ? 'Transportation' : 'Personal Care'
        
        resolve({
          id: crypto.randomUUID(),
          merchant,
          amount: Number(amt.toFixed(2)),
          date: todayISO(),
          category: cat,
          fileUrl: URL.createObjectURL(file),
          items: [
            { name: 'Item 1', price: Number((Math.random() * 20).toFixed(2)) },
            { name: 'Item 2', price: Number((Math.random() * 15).toFixed(2)) }
          ]
        })
      }, 2000)
    })
  }
  
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsProcessingReceipt(true)
    try {
      const receipt = await processReceipt(file)
      setReceipts(prev => [receipt, ...prev])
      setTx(prev => [{
        id: crypto.randomUUID(),
        desc: `${receipt.merchant} - Auto from receipt`,
        amount: receipt.amount,
        type: 'expense',
        date: receipt.date,
        category: receipt.category,
        hasReceipt: true
      }, ...prev])
      alert(`✓ Receipt processed! ${receipt.merchant} - ${currency(receipt.amount)}`)
    } catch {
      alert('Error processing receipt')
    }
    setIsProcessingReceipt(false)
  }
  
  const downloadCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Has Receipt']
    const rows = tx.map(t => [t.date, t.type, t.category, t.desc, t.amount.toFixed(2), t.hasReceipt ? 'Yes' : 'No'])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${studentName}_transactions_${todayISO()}.csv`
    a.click()
  }

  if (view === 'welcome') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? "dark bg-slate-950" : "bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50"}`}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-violet-100 dark:border-slate-800">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Wallet2 className="text-violet-600 dark:text-violet-400" size={36} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Your Financial Journey</h1>
            <p className="text-slate-600 dark:text-slate-400">School on Wheels Financial Wellness Tracker</p>
          </div>
          
          <form onSubmit={handleWelcome} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">What's your name?</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Monthly UBI Stipend ($)</label>
              <input
                type="number"
                step="0.01"
                value={monthlyStipend}
                onChange={(e) => setMonthlyStipend(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="Enter amount"
              />
            </div>
            
            <button
              type="submit"
              disabled={!studentName.trim() || !monthlyStipend}
              className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white py-3 rounded-lg font-semibold transition shadow-lg disabled:shadow-none"
            >
              Get Started
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${dark ? "dark bg-slate-950" : ""}`}>
      {/* HEADER */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 dark:from-violet-700 dark:via-indigo-800 dark:to-indigo-900">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/15 rounded-xl p-2 ring-1 ring-white/20">
                <Wallet2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/80">School on Wheels</p>
                <h1 className="text-xl font-semibold">Hi, {studentName}! 👋</h1>
              </div>
            </div>

            <button
              onClick={() => setDark(v => !v)}
              className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/25 transition"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Wallet2 },
              { id: 'receipts', label: 'Receipts', icon: Camera },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'lessons', label: 'Learn', icon: BookOpen },
              { id: 'workshops', label: 'Workshops', icon: Award }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => setView(nav.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  view === nav.id 
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <nav.icon size={18} />
                {nav.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {view === 'dashboard' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-violet-700 dark:to-indigo-900 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">AI</span>
                Your Financial Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {aiRecommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} />
                      <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-violet-700 hover:bg-violet-800 text-white rounded-lg py-2 font-medium transition flex items-center justify-center gap-2 shadow"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Add Transaction
                  </button>
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                </form>
              </section>
            </div>

            {/* Transactions List */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-4">
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
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {item.desc} {item.hasReceipt && <span className="text-xs">📎</span>}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={"font-semibold " + (item.type === "income" ? "text-emerald-600" : "text-rose-600")}>
                            {item.type === "income" ? "+" : "-"}
                            {currency(item.amount)}
                          </span>
                          <button
                            onClick={() => removeTx(item.id)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
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
          </div>
        )}

        {view === 'receipts' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Camera className="text-violet-600" size={24} />
                Upload Receipt
              </h3>
              
              <div className="border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-xl p-8 text-center bg-violet-50 dark:bg-violet-900/10">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                  id="receipt-upload"
                  disabled={isProcessingReceipt}
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  {isProcessingReceipt ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
                      <p className="text-violet-700 dark:text-violet-300 font-semibold">Processing with AI...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="text-violet-600 dark:text-violet-400 mb-4" size={48} />
                      <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Click to upload receipt</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">AI will extract and categorize automatically</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Receipt History</h3>
              {receipts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No receipts uploaded yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {receipts.map(receipt => (
                    <div key={receipt.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <img src={receipt.fileUrl} alt="Receipt" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{receipt.merchant}</h4>
                          <span className="text-lg font-bold text-violet-600">{currency(receipt.amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs">
                            {receipt.category}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">{receipt.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
              <div className="flex items-center mb-4">
                <Target className="text-violet-600 mr-3" size={28} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Goals</h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">What do you want to save for?</p>
              
              {goals.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No goals set yet. Add your first goal!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {goals.map(goal => {
                    const saved = tx.filter(t => t.category === 'Savings' && t.desc.includes(goal.name)).reduce((sum, t) => sum + t.amount, 0)
                    const progress = (saved / goal.amount) * 100
                    return (
                      <div key={goal.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{goal.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{currency(saved)} / {currency(goal.amount)}</p>
                          </div>
                          <Target className="text-violet-600" size={24} />
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 h-3 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>{progress.toFixed(0)}% complete</span>
                          {goal.deadline && <span>Due: {goal.deadline}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const name = formData.get('name') as string
                  const amount = parseFloat(formData.get('amount') as string)
                  const deadline = formData.get('deadline') as string
                  if (name && amount) {
                    addGoal(name, amount, deadline)
                    e.currentTarget.reset()
                  }
                }} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Goal name (e.g., Emergency Fund)"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-violet-400"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount ($)"
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-violet-400"
                    />
                    <input
                      type="date"
                      name="deadline"
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-violet-700 hover:bg-violet-800 text-white py-2 rounded-lg font-semibold transition"
                  >
                    <Plus className="inline mr-2" size={20} />
                    Add Goal
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {view === 'lessons' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="text-violet-600 mr-3" size={28} />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Literacy</h2>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Lesson {currentLesson + 1} of {lessons.length}</span>
              </div>
              
              <div className="mb-6">
                <div className="flex gap-1 mb-4">
                  {lessons.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-2 flex-1 rounded ${idx <= currentLesson ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{lessons[currentLesson].title}</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{lessons[currentLesson].content}</p>
                
                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-violet-900 dark:text-violet-200 mb-3">Key Tips:</h4>
                  <ul className="space-y-2">
                    {lessons[currentLesson].tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start">
                        <ChevronRight className="text-violet-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3">
                {currentLesson > 0 && (
                  <button
                    onClick={() => setCurrentLesson(currentLesson - 1)}
                    className="flex-1 border border-violet-600 text-violet-600 py-3 rounded-lg font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={() => {
                    if (currentLesson < lessons.length - 1) {
                      setCurrentLesson(currentLesson + 1)
                    } else {
                      setView('dashboard')
                    }
                  }}
                  className="flex-1 bg-violet-700 hover:bg-violet-800 text-white py-3 rounded-lg font-semibold transition"
                >
                  {currentLesson === lessons.length - 1 ? 'Complete!' : 'Next Lesson'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'workshops' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Workshop Attendance</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Track workshops you attend to build financial knowledge</p>
              
              <div className="space-y-3">
                {workshopsList.map(workshop => (
                  <div
                    key={workshop}
                    onClick={() => toggleWorkshop(workshop)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      workshops.includes(workshop)
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className={workshops.includes(workshop) ? 'text-emerald-600' : 'text-slate-400'} size={24} />
                        <span className="ml-3 font-semibold text-slate-900 dark:text-white">{workshop}</span>
                      </div>
                      {workshops.includes(workshop) && (
                        <span className="text-emerald-600 font-semibold">✓ Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                <p className="text-violet-900 dark:text-violet-200 font-semibold">Workshops Completed: {workshops.length} / {workshopsList.length}</p>
                <div className="w-full bg-violet-200 dark:bg-violet-900/40 rounded-full h-2 mt-2">
                  <div 
                    className="bg-violet-600 h-2 rounded-full transition-all"
                    style={{ width: `${(workshops.length / workshopsList.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, variant }: { label: string; value: string; variant: "success" | "danger" }) {
  const color = variant === "success"
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
}  <h4 className="font-semibold">{rec.title}</h4>
                        <p className="text-sm text-white/90 mt-1">{rec.message}</p>
                        <p className="text-xs text-white/70 mt-2 italic">→ {rec.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Export Data</h3>
              <button
                onClick={downloadCSV}
                disabled={tx.length === 0}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Download size={18} />
                Download CSV
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Summary + Chart */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
                <div className="grid grid-cols-3 gap-3">
                  <SummaryCard label="Income" value={currency(incomeTotal)} variant="success" />
                  <SummaryCard label="Expenses" value={currency(expenseTotal)} variant="danger" />
                  <SummaryCard label="Balance" value={currency(balance)} variant={balance >= 0 ? "success" : "danger"} />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Last 7 Days (Net)</p>
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
                
                {categorySpending.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Spending by Category</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySpending}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categorySpending.map((entry, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => currency(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </section>

              {/* Form */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-violet-100 dark:border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Transaction</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Log a purchase or add income
                </p>

                <form onSubmit={addTx} className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Groceries"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                      <input
                        type="number"
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
