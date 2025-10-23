import React, { useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Target, BookOpen, Award, TrendingUp, Plus, ChevronRight, DollarSign, Home, Menu, X, Upload, Camera, FileText, AlertCircle, Download } from 'lucide-react';

const FinancialLiteracyApp = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [studentName, setStudentName] = useState('');
  const [monthlyStipend, setMonthlyStipend] = useState('');
  const [financialGoals, setFinancialGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', amount: '', deadline: '' });
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ 
    type: 'expense', 
    amount: '', 
    category: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [workshops, setWorkshops] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadedReceipts, setUploadedReceipts] = useState([]);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);

  const categories = ['Food', 'Transportation', 'School Supplies', 'Clothing', 'Personal Care', 'Entertainment', 'Savings', 'Other'];
  
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
  ];

  const workshopsList = [
    "Money Foundations & Budget Setup",
    "Goal Setting & Saving Smart",
    "Banking & Credit",
    "Budgeting for School, Fun & Life",
    "Cost of College & Scholarships",
    "Smart Spending & Mental Health"
  ];

  const processReceiptWithAI = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const merchants = ['Target', 'Walmart', 'McDonalds', 'Metro Transit', 'CVS Pharmacy'];
        const merchant = merchants[Math.floor(Math.random() * merchants.length)];
        const amount = (Math.random() * 50 + 5).toFixed(2);
        
        let category = 'Other';
        if (merchant.includes('Target') || merchant.includes('Walmart')) {
          category = Math.random() > 0.5 ? 'Food' : 'Personal Care';
        } else if (merchant.includes('McDonald')) {
          category = 'Food';
        } else if (merchant.includes('Metro')) {
          category = 'Transportation';
        } else if (merchant.includes('CVS')) {
          category = 'Personal Care';
        }
        
        resolve({
          merchant,
          amount,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          items: [
            { name: 'Item 1', price: (Math.random() * 20).toFixed(2) },
            { name: 'Item 2', price: (Math.random() * 15).toFixed(2) }
          ]
        });
      }, 2000);
    });
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsProcessingReceipt(true);
    
    try {
      const receiptData = await processReceiptWithAI(file);
      
      setUploadedReceipts(prev => [...prev, { 
        ...receiptData, 
        id: Date.now(),
        uploadDate: new Date().toISOString()
      }]);
      
      const newTrans = {
        id: Date.now(),
        type: 'expense',
        amount: parseFloat(receiptData.amount),
        category: receiptData.category,
        description: `${receiptData.merchant} - Auto from receipt`,
        date: receiptData.date,
        receiptId: Date.now(),
        hasReceipt: true
      };
      
      setTransactions(prev => [...prev, newTrans]);
      setIsProcessingReceipt(false);
      
      alert(`Receipt processed! ${receiptData.merchant} - $${receiptData.amount} added to ${receiptData.category}`);
      
    } catch (error) {
      setIsProcessingReceipt(false);
      alert('Error processing receipt. Please try again.');
    }
  };

  const addGoal = () => {
    if (newGoal.name && newGoal.amount) {
      setFinancialGoals([...financialGoals, { ...newGoal, id: Date.now(), progress: 0 }]);
      setNewGoal({ name: '', amount: '', deadline: '' });
    }
  };

  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.category) {
      setTransactions([...transactions, { 
        ...newTransaction, 
        id: Date.now(), 
        amount: parseFloat(newTransaction.amount) 
      }]);
      setNewTransaction({ 
        type: 'expense', 
        amount: '', 
        category: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0] 
      });
    }
  };

  const toggleWorkshop = (workshop) => {
    setWorkshops(prev => 
      prev.includes(workshop) 
        ? prev.filter(w => w !== workshop)
        : [...prev, workshop]
    );
  };

  const completeLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      setCurrentView('dashboard');
    }
  };

  const getCategorySpending = () => {
    const spending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    });
    return Object.entries(spending).map(([name, value]) => ({ name, value }));
  };

  const getTotalSpent = () => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) + (parseFloat(monthlyStipend) || 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalSpent();
  };

  const getSpendingTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySpending = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: daySpending
      });
    }
    return last7Days;
  };

  const getTopSpendingCategories = () => {
    return getCategorySpending()
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  };

  const getAIRecommendations = () => {
    const recommendations = [];
    const totalSpent = getTotalSpent();
    const budget = parseFloat(monthlyStipend) || 0;
    const categoryData = getCategorySpending();
    
    if (totalSpent > budget * 0.9) {
      recommendations.push({
        type: 'warning',
        title: 'Budget Alert',
        message: `You've used ${((totalSpent/budget)*100).toFixed(0)}% of your stipend. Consider reducing non-essential spending.`,
        action: 'Review your Food and Entertainment spending'
      });
    }

    const foodSpending = categoryData.find(c => c.name === 'Food')?.value || 0;
    if (foodSpending > budget * 0.4) {
      recommendations.push({
        type: 'tip',
        title: 'Food Savings Opportunity',
        message: `Food is ${((foodSpending/totalSpent)*100).toFixed(0)}% of your spending. Try meal planning or school meal programs to save $20-30/week.`,
        action: 'Set a weekly food budget of $' + (foodSpending / 4 * 0.7).toFixed(0)
      });
    }

    const receiptCount = transactions.filter(t => t.hasReceipt).length;
    const totalTransactions = transactions.length;
    if (totalTransactions > 0 && receiptCount / totalTransactions < 0.5) {
      recommendations.push({
        type: 'tip',
        title: 'Keep Your Receipts!',
        message: 'Upload receipts for better tracking. Only ' + receiptCount + ' of ' + totalTransactions + ' transactions have receipts.',
        action: 'Upload receipts in the Receipts tab'
      });
    }

    const savingsTransactions = transactions.filter(t => t.category === 'Savings');
    if (savingsTransactions.length === 0 && totalSpent < budget) {
      recommendations.push({
        type: 'success',
        title: 'Great Job!',
        message: `You have $${(budget - totalSpent).toFixed(2)} left this month. Consider saving at least $${Math.min(20, budget - totalSpent).toFixed(2)} for your goals!`,
        action: 'Move money to savings now'
      });
    }

    if (workshops.length < 3) {
      recommendations.push({
        type: 'tip',
        title: 'Build Your Skills',
        message: 'Attending financial workshops can unlock resources and knowledge. You have completed ' + workshops.length + ' workshops.',
        action: 'Check out the Workshops tab'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'You are Doing Great!',
        message: 'Keep tracking your spending and working toward your goals. Small steps lead to big changes!',
        action: 'Keep up the good work'
      });
    }

    return recommendations;
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Has Receipt'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.category,
      t.description || '',
      t.amount.toFixed(2),
      t.hasReceipt ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentName}_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDFReport = () => {
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const categorySpending = getCategorySpending();
    const totalSpent = getTotalSpent();
    const balance = getBalance();
    const budget = parseFloat(monthlyStipend) || 0;
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Financial Report - ${studentName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
    .header h1 { color: #4F46E5; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .summary-card { background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; }
    .summary-card .amount { font-size: 28px; font-weight: bold; color: #1F2937; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
    th { background: #F9FAFB; font-weight: bold; color: #374151; }
    .expense { color: #DC2626; }
    .income { color: #059669; }
    .category-bar { display: flex; align-items: center; margin-bottom: 15px; }
    .category-name { width: 150px; font-weight: 500; }
    .bar-container { flex: 1; height: 25px; background: #E5E7EB; border-radius: 4px; overflow: hidden; margin: 0 10px; }
    .bar-fill { height: 100%; background: linear-gradient(to right, #4F46E5, #7C3AED); }
    .bar-amount { width: 80px; text-align: right; font-weight: bold; }
    .goals-list { list-style: none; padding: 0; }
    .goals-list li { background: #F3F4F6; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
    .goal-name { font-weight: bold; color: #1F2937; }
    .goal-progress { color: #4F46E5; font-size: 14px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${studentName}'s Financial Report</h1>
    <p>School on Wheels - Financial Wellness Tracker</p>
    <p>Report Generated: ${reportDate}</p>
  </div>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>Current Balance</h3>
      <div class="amount">$${balance.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <h3>Total Spent</h3>
      <div class="amount">$${totalSpent.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <h3>Monthly Stipend</h3>
      <div class="amount">$${budget.toFixed(2)}</div>
    </div>
  </div>
  <div class="section">
    <h2>Spending by Category</h2>
    ${categorySpending.map(cat => `
      <div class="category-bar">
        <div class="category-name">${cat.name}</div>
        <div class="bar-container">
          <div class="bar-fill" style="width: ${(cat.value/totalSpent)*100}%"></div>
        </div>
        <div class="bar-amount">$${cat.value.toFixed(2)}</div>
      </div>
    `).join('')}
  </div>
  <div class="section">
    <h2>Recent Transactions</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.slice().reverse().slice(0, 20).map(t => `
          <tr>
            <td>${t.date}</td>
            <td>${t.category}${t.hasReceipt ? ' 📎' : ''}</td>
            <td>${t.description || 'No description'}</td>
            <td class="${t.type}">
              ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ${financialGoals.length > 0 ? `
    <div class="section">
      <h2>Financial Goals</h2>
      <ul class="goals-list">
        ${financialGoals.map(goal => {
          const saved = transactions
            .filter(t => t.category === 'Savings' && t.description.includes(goal.name))
            .reduce((sum, t) => sum + t.amount, 0);
          const progress = ((saved / parseFloat(goal.amount)) * 100).toFixed(0);
          return `
            <li>
              <div class="goal-name">${goal.name}</div>
              <div class="goal-progress">
                $${saved.toFixed(2)} / $${goal.amount} (${progress}% complete)
                ${goal.deadline ? ` • Target: ${goal.deadline}` : ''}
              </div>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  ` : ''}
  <div class="section">
    <h2>Workshops Completed</h2>
    <p><strong>${workshops.length} of ${workshopsList.length}</strong> workshops attended</p>
    ${workshops.length > 0 ? `<p style="color: #059669;">✓ ${workshops.join(', ')}</p>` : ''}
  </div>
  <div class="footer">
    <p>This report was generated by School on Wheels Financial Wellness Tracker</p>
    <p>Keep tracking, keep growing! 🌟</p>
  </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentName}_financial_report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#f43f5e'];

  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Your Financial Journey</h1>
            <p className="text-gray-600">School on Wheels Financial Wellness Tracker</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What's your name?</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly UBI Stipend ($)</label>
              <input
                type="number"
                value={monthlyStipend}
                onChange={(e) => setMonthlyStipend(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>
            
            <button
              onClick={() => setCurrentView('goals')}
              disabled={!studentName || !monthlyStipend}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'goals') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Target className="text-indigo-600 mr-3" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Set Your Financial Goals</h2>
            </div>
            
            <p className="text-gray-600 mb-6">What do you want to save for? Having goals makes it easier to stay motivated!</p>
            
            <div className="space-y-4 mb-6">
              {financialGoals.map(goal => (
                <div key={goal.id} className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                      <p className="text-sm text-gray-600">${goal.amount} {goal.deadline && `by ${goal.deadline}`}</p>
                    </div>
                    <Target className="text-indigo-600" size={24} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-6 space-y-3">
              <input
                type="text"
                placeholder="Goal name (e.g., Emergency Fund, Apartment Deposit)"
                value={newGoal.name}
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newGoal.amount}
                  onChange={(e) => setNewGoal({...newGoal, amount: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={addGoal}
                className="w-full bg-indigo-100 text-indigo-700 py-2 rounded-lg font-semibold hover:bg-indigo-200 transition"
              >
                <Plus className="inline mr-2" size={20} />
                Add Goal
              </button>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setCurrentView('lessons')}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Continue to Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'lessons') {
    const lesson = lessons[currentLesson];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BookOpen className="text-indigo-600 mr-3" size={32} />
                <h2 className="text-2xl font-bold text-gray-800">Financial Literacy</h2>
              </div>
              <span className="text-sm text-gray-600">Lesson {currentLesson + 1} of {lessons.length}</span>
            </div>
            
            <div className="mb-6">
              <div className="flex gap-1 mb-4">
                {lessons.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-2 flex-1 rounded ${idx <= currentLesson ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{lesson.title}</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{lesson.content}</p>
              
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-3">Key Tips:</h4>
                <ul className="space-y-2">
                  {lesson.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <ChevronRight className="text-indigo-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              {currentLesson > 0 && (
                <button
                  onClick={() => setCurrentLesson(currentLesson - 1)}
                  className="flex-1 border border-indigo-600 text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
                >
                  Previous
                </button>
              )}
              <button
                onClick={completeLesson}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                {currentLesson === lessons.length - 1 ? 'Start Tracking!' : 'Next Lesson'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Hi, {studentName}! 👋</h1>
            <p className="text-indigo-200 text-sm">Monthly Stipend: ${monthlyStipend}</p>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`bg-white border-b ${menuOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'spending', label: 'Track Spending', icon: Wallet },
              { id: 'receipts', label: 'Receipts', icon: Camera },
              { id: 'goals', label: 'My Goals', icon: Target },
              { id: 'workshops', label: 'Workshops', icon: Award },
              { id: 'lessons', label: 'Learn', icon: BookOpen }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => { setCurrentView(nav.id); setMenuOpen(false); }}
                className={`flex items-center px-4 py-2 rounded-lg transition ${
                  currentView === nav.id 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <nav.icon size={18} className="mr-2" />
                {nav.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Export Your Data</h3>
                  <p className="text-sm text-gray-600">Download your budget and spending records</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={downloadPDFReport}
                  disabled={transactions.length === 0}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={20} />
                  Download PDF Report
                </button>
                <button
                  onClick={downloadCSV}
                  disabled={transactions.length === 0}
                  className="flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={20} />
                  Download CSV Data
                </button>
              </div>
              {transactions.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-3">Add transactions to enable downloads</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100 text-sm font-medium">Balance</span>
                  <DollarSign size={24} />
                </div>
                <p className="text-3xl font-bold">${getBalance().toFixed(2)}</p>
                <p className="text-green-100 text-xs mt-1">Available to spend</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-100 text-sm font-medium">Spent</span>
                  <TrendingUp size={24} />
                </div>
                <p className="text-3xl font-bold">${getTotalSpent().toFixed(2)}</p>
                <p className="text-red-100 text-xs mt-1">{((getTotalSpent()/(parseFloat(monthlyStipend)||1))*100).toFixed(0)}% of stipend</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 text-sm font-medium">Goals</span>
                  <Target size={24} />
                </div>
                <p className="text-3xl font-bold">{financialGoals.length}</p>
                <p className="text-purple-100 text-xs mt-1">Active goals</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Receipts</span>
                  <FileText size={24} />
                </div>
                <p className="text-3xl font-bold">{uploadedReceipts.length}</p>
                <p className="text-blue-100 text-xs mt-1">Uploaded this month</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm mr-3">AI Powered</span>
                Your Personal Financial Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {getAIRecommendations().slice(0, 2).map((rec, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        rec.type === 'warning' ? 'bg-red-500/20' :
                        rec.type === 'success' ? 'bg-green-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        <AlertCircle size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-white/90 mb-2">{rec.message}</p>
                        <p className="text-xs text-white/70 italic">→ {rec.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h3>
                {getCategorySpending().length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getCategorySpending()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getCategorySpending().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {getTopSpendingCategories().map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{cat.name}</span>
                          <span className="font-semibold text-gray-800">${cat.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No spending data yet</p>
                    <p className="text-sm text-gray-400">Start tracking to see insights</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">7-Day Spending Trend</h3>
                {transactions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={getSpendingTrend()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No trend data yet</p>
                    <p className="text-sm text-gray-400">Track spending to see patterns</p>
                  </div>
                )}
              </div>
            </div>

            {financialGoals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Goals</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {financialGoals.map(goal => {
                    const saved = transactions
                      .filter(t => t.category === 'Savings' && t.description.includes(goal.name))
                      .reduce((sum, t) => sum + t.amount, 0);
                    const progress = (saved / parseFloat(goal.amount)) * 100;
                    
                    return (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                            <p className="text-sm text-gray-600">${saved.toFixed(2)} / ${goal.amount}</p>
                          </div>
                          <Target className="text-indigo-600" size={24} />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{progress.toFixed(0)}% complete</span>
                          {goal.deadline && <span>Due: {goal.deadline}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">All AI Recommendations</h3>
              <div className="space-y-3">
                {getAIRecommendations().map((rec, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'warning' ? 'bg-red-50 border-red-500' :
                    rec.type === 'success' ? 'bg-green-50 border-green-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                    <p className="text-gray-700 text-sm mb-2">{rec.message}</p>
                    <p className="text-xs text-gray-600 italic">💡 Action: {rec.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'receipts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Camera className="mr-3 text-indigo-600" size={28} />
                Upload Receipt
              </h3>
              
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-indigo-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                  id="receipt-upload"
                  disabled={isProcessingReceipt}
                />
                <label 
                  htmlFor="receipt-upload" 
                  className={`cursor-pointer ${isProcessingReceipt ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessingReceipt ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-indigo-700 font-semibold">Processing receipt with AI...</p>
                      <p className="text-sm text-gray-600 mt-2">Extracting details and categorizing</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="text-indigo-600 mb-4" size={48} />
                      <p className="text-lg font-semibold text-gray-800 mb-2">Click to upload receipt</p>
                      <p className="text-sm text-gray-600">AI will automatically extract and categorize the transaction</p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Auto-detect merchant
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Extract amount
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Smart categorization
                        </div>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Receipt History</h3>
              {uploadedReceipts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedReceipts.slice().reverse().map(receipt => (
                    <div key={receipt.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img 
                          src={receipt.fileUrl} 
                          alt="Receipt" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{receipt.merchant}</h4>
                          <span className="text-lg font-bold text-indigo-600">${receipt.amount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                            {receipt.category}
                          </span>
                          <span className="text-gray-500">{receipt.date}</span>
                        </div>
                        {receipt.items && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-600 mb-1">Items detected:</p>
                            {receipt.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-700">
                                <span>{item.name}</span>
                                <span>${item.price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No receipts uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload your first receipt to track spending easily</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
                <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs mr-2">TIP</span>
                Why Upload Receipts?
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <ChevronRight className="text-indigo-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                  <span>AI automatically categorizes and tracks your spending</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-indigo-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                  <span>Keep digital records for warranty claims and returns</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-indigo-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                  <span>Better insights into your spending patterns</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {currentView === 'spending' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Transaction</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      newTransaction.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      newTransaction.type === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Income
                  </button>
                </div>
                
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                
                <button
                  onClick={addTransaction}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Add Transaction
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.slice().reverse().map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Wallet className={t.type === 'income' ? 'text-green-600' : 'text-red-600'} size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">{t.category}</p>
                          {t.hasReceipt && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              📎 Receipt
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{t.description || 'No description'}</p>
                        <p className="text-xs text-gray-500">{t.date}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No transactions yet. Start tracking!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'workshops' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Workshop Attendance</h3>
            <p className="text-gray-600 mb-6">Track the workshops you attend to build your financial knowledge and unlock resources!</p>
            <div className="space-y-3">
              {workshopsList.map(workshop => (
                <div
                  key={workshop}
                  onClick={() => toggleWorkshop(workshop)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    workshops.includes(workshop)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className={workshops.includes(workshop) ? 'text-green-600' : 'text-gray-400'} size={24} />
                      <span className="ml-3 font-semibold text-gray-800">{workshop}</span>
                    </div>
                    {workshops.includes(workshop) && (
                      <span className="text-green-600 font-semibold">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-900 font-semibold">Workshops Completed: {workshops.length} / {workshopsList.length}</p>
              <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(workshops.length / workshopsList.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialLiteracyApp;
