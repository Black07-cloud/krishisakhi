import React from "react";
import { BarChart3, PieChart } from "lucide-react";
import { formatCurrency } from "./SummaryCards";
import { getCategoryLabel } from "./TransactionList";

const CATEGORY_COLORS = [
  "#16a34a",
  "#2563eb",
  "#d97706",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#ca8a04",
  "#059669",
  "#4f46e5",
  "#e11d48",
  "#65a30d",
  "#0284c7",
];

const FinanceCharts = ({ summary }) => {
  const expenseByCategory = summary?.expenseByCategory || {};
  const monthlySummary = summary?.monthlySummary || [];

  const categoryEntries = Object.entries(expenseByCategory).filter(
    ([_, val]) => val > 0
  );

  const totalExpenseVal = categoryEntries.reduce(
    (acc, [_, val]) => acc + val,
    0
  );

  const hasExpenseData = categoryEntries.length > 0;
  const hasMonthlyData = monthlySummary.length > 0;

  // Calculate maximum for monthly bar chart scaling
  const maxMonthlyVal = Math.max(
    ...monthlySummary.map((m) => Math.max(m.income || 0, m.expense || 0)),
    100
  );

  return (
    <div className="finance-charts-grid">
      {/* Category Breakdown Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-row">
            <PieChart size={18} className="chart-icon" />
            <h3>Expense Breakdown by Category</h3>
          </div>
          <span className="chart-subtitle">Where farm capital was spent</span>
        </div>

        {!hasExpenseData ? (
          <div className="chart-empty-state">
            <p>Not enough data for this chart.</p>
          </div>
        ) : (
          <div className="category-breakdown-list">
            {categoryEntries.map(([catKey, amount], index) => {
              const percentage =
                totalExpenseVal > 0
                  ? ((amount / totalExpenseVal) * 100).toFixed(1)
                  : 0;
              const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

              return (
                <div key={catKey} className="category-bar-item">
                  <div className="bar-label-row">
                    <span className="cat-name">
                      {getCategoryLabel(catKey, "expense")}
                    </span>
                    <span className="cat-amount">
                      {formatCurrency(amount)} ({percentage}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Trend Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-row">
            <BarChart3 size={18} className="chart-icon" />
            <h3>Monthly Financial Overview</h3>
          </div>
          <span className="chart-subtitle">Income vs Expenses over time</span>
        </div>

        {!hasMonthlyData ? (
          <div className="chart-empty-state">
            <p>Not enough data for this chart.</p>
          </div>
        ) : (
          <div className="monthly-chart-wrapper">
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-box income-box" />
                <span>Income</span>
              </div>
              <div className="legend-item">
                <span className="legend-box expense-box" />
                <span>Expense</span>
              </div>
            </div>

            <div className="monthly-bars-container">
              {monthlySummary.map((m) => {
                const incomePct = ((m.income || 0) / maxMonthlyVal) * 100;
                const expensePct = ((m.expense || 0) / maxMonthlyVal) * 100;

                // Format "YYYY-MM" -> "MMM YYYY"
                const [year, month] = m.month.split("-");
                const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
                const monthName = dateObj.toLocaleDateString("en-IN", {
                  month: "short",
                });

                return (
                  <div key={m.month} className="monthly-bar-group">
                    <div className="bars-pair">
                      <div
                        className="monthly-bar income-bar"
                        style={{ height: `${Math.max(incomePct, 4)}%` }}
                        title={`Income: ${formatCurrency(m.income)}`}
                      />
                      <div
                        className="monthly-bar expense-bar"
                        style={{ height: `${Math.max(expensePct, 4)}%` }}
                        title={`Expense: ${formatCurrency(m.expense)}`}
                      />
                    </div>
                    <span className="month-label">{monthName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceCharts;
