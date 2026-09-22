import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "./SummaryCards";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "./TransactionForm";

// Helper to resolve human readable category label
export const getCategoryLabel = (category, type) => {
  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const match = list.find((c) => c.value === category);
  if (match) return match.label;
  
  // Fallback check in opposite list
  const fallback = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((c) => c.value === category);
  if (fallback) return fallback.label;

  return category ? category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Uncategorized";
};

// Helper for payment method label
export const getPaymentMethodLabel = (method) => {
  const match = PAYMENT_METHODS.find((m) => m.value === method);
  return match ? match.label : method || "Cash";
};

const TransactionList = ({
  transactions = [],
  loading = false,
  onEdit,
  onDelete,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="transaction-list-container">
        <div className="transaction-table-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-empty-box">
        <div className="empty-icon-wrapper">
          <FileText size={40} />
        </div>
        <h3>No financial records found</h3>
        <p>Start recording your farm income and expenses to track your financial health.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      <div className="transaction-table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Farm & Crop</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === "income";
              const formattedDate = tx.date
                ? new Date(tx.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A";

              const farmName = tx.farm?.name || "General Farm";
              const cropName = tx.crop?.name;

              return (
                <tr key={tx._id || tx.id} className="transaction-row">
                  {/* Date */}
                  <td className="tx-cell-date">
                    <span className="date-text">{formattedDate}</span>
                  </td>

                  {/* Type */}
                  <td className="tx-cell-type">
                    <span className={`type-badge ${isIncome ? "income" : "expense"}`}>
                      {isIncome ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      <span>{isIncome ? "Income" : "Expense"}</span>
                    </span>
                  </td>

                  {/* Category */}
                  <td className="tx-cell-category">
                    <div className="category-wrapper">
                      <span className="category-title">
                        {getCategoryLabel(tx.category, tx.type)}
                      </span>
                      {tx.description && (
                        <span className="tx-description-sub" title={tx.description}>
                          {tx.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Farm & Crop */}
                  <td className="tx-cell-farm">
                    <div className="farm-crop-info">
                      <span className="farm-name-text">{farmName}</span>
                      {cropName && <span className="crop-pill">{cropName}</span>}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="tx-cell-amount">
                    <span className={`amount-text ${isIncome ? "text-income" : "text-expense"}`}>
                      {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="tx-cell-payment">
                    <span className="payment-method-tag">
                      {getPaymentMethodLabel(tx.paymentMethod)}
                    </span>
                    {tx.reference && (
                      <span className="ref-text" title={`Ref: ${tx.reference}`}>
                        Ref: {tx.reference}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="tx-cell-actions">
                    <div className="table-action-btns">
                      <button
                        className="tx-action-btn edit"
                        onClick={() => onEdit(tx)}
                        title="Edit Transaction"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="tx-action-btn delete"
                        onClick={() => handleDeleteClick(tx._id || tx.id)}
                        title="Delete Transaction"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="scheme-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="scheme-modal-container confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-content">
              <div className="warning-icon-box">
                <AlertTriangle size={32} />
              </div>
              <h3>Delete Transaction?</h3>
              <p>This will permanently remove this financial record from your farm ledger.</p>
              <div className="confirmation-actions">
                <button
                  className="modal-close-action-btn"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="official-link-btn primary"
                  style={{ background: "#dc2626" }}
                  onClick={() => handleConfirmDelete(confirmDeleteId)}
                  disabled={deletingId === confirmDeleteId}
                >
                  {deletingId === confirmDeleteId ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
