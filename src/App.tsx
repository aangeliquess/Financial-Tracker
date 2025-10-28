import React from 'react';
import FinancialLiteracyApp from './FinancialLiteracyApp';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">
          💰 Financial Tracker
        </h1>

        <form className="space-y-3">
          <input
            type="text"
            placeholder="Description"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <input
            type="number"
            placeholder="Amount"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white rounded-lg py-2 font-medium"
          >
            Add Transaction
          </button>
        </form>

        <ul className="divide-y divide-slate-200">
          <li className="flex justify-between py-2">
            <span>Coffee</span>
            <span className="text-slate-600">$4.50</span>
          </li>
          {/* Example item — you’ll map real data here */}
        </ul>

        <p className="text-right text-lg font-semibold text-slate-800">
          Total: $24.50
        </p>
      </div>
    </div>
  )
}

