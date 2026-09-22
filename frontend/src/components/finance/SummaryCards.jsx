import React from "react";
import { Wallet, IndianRupee, TrendingUp, TrendingDown, Receipt } from "lucide-react";

export const formatCurrency = (amount) => {
  const val = Number(amount) || 0;
  return `₹${val.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const SummaryCards = ({ summary, loading }) => {
  const {
    totalIncome = 0,
    totalExpense = 0,
    profit = 0,
    transactionCount = 0,
  } = summary || {};

  const isProfit = profit > 0;
  const isLoss = profit < 0;

  return (
    <div className="finance-summary-grid">
      {/* Total Income */}
      <div className="summary-card income-card">
        <div className="summary-card-header">
          <span className="card-label">Total Income</span>
          <div className="card-icon income-icon">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="card-amount text-income">
          {loading ? "..." : formatCurrency(totalIncome)}
        </div>
        <div className="card-subtext">
          Earned across selected farms & crops
        </div>
      </div>

      {/* Total Expense */}
      <div className="summary-card expense-card">
        <div className="summary-card-header">
          <span className="card-label">Total Expense</span>
          <div className="card-icon expense-icon">
            <TrendingDown size={20} />
          </div>
        </div>
        <div className="card-amount text-expense">
          {loading ? "..." : formatCurrency(totalExpense)}
        </div>
        <div className="card-subtext">
          Spent on seeds, fertilizers, labour & ops
        </div>
      </div>

      {/* Net Profit / Loss */}
      <div className={`summary-card profit-card ${isLoss ? "loss-border" : "profit-border"}`}>
        <div className="summary-card-header">
          <span className="card-label">Net Profit / Loss</span>
          <div className={`card-icon ${isLoss ? "loss-icon" : "profit-icon"}`}>
            <IndianRupee size={20} />
          </div>
        </div>
        <div className={`card-amount ${isLoss ? "text-expense" : "text-income"}`}>
          {loading ? "..." : formatCurrency(profit)}
        </div>
        <div className="card-subtext">
          <span className={`status-badge-pill ${isLoss ? "loss" : isProfit ? "profit" : "breakeven"}`}>
            {isLoss ? "Loss" : isProfit ? "Profit" : "Break-even"}
          </span>
          <span>(Income - Expense)</span>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="summary-card info-card">
        <div className="summary-card-header">
          <span className="card-label">Total Transactions</span>
          <div className="card-icon info-icon">
            <Receipt size={20} />
          </div>
        </div>
        <div className="card-amount text-main">
          {loading ? "..." : transactionCount}
        </div>
        <div className="card-subtext">
          Recorded financial items
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
