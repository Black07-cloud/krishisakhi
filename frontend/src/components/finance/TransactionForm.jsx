import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Plus, IndianRupee } from "lucide-react";
import { createTransaction, updateTransaction } from "../../api/financeApi";
import { getCrops } from "../../api/cropApi";

export const EXPENSE_CATEGORIES = [
  { value: "seeds", label: "Seeds & Planting" },
  { value: "fertilizer", label: "Fertilizers & Nutrients" },
  { value: "pesticide", label: "Pesticides & Chemicals" },
  { value: "labour", label: "Labour & Wages" },
  { value: "irrigation", label: "Irrigation & Water" },
  { value: "equipment", label: "Equipment & Tools" },
  { value: "machinery", label: "Machinery & Fuel" },
  { value: "transport", label: "Transport & Logistics" },
  { value: "electricity", label: "Electricity & Power" },
  { value: "water", label: "Water Charges" },
  { value: "land_preparation", label: "Land Preparation" },
  { value: "maintenance", label: "Maintenance & Repairs" },
  { value: "other", label: "Other Expense" },
];

export const INCOME_CATEGORIES = [
  { value: "crop_sale", label: "Crop Harvest Sale" },
  { value: "livestock_sale", label: "Livestock & Product Sale" },
  { value: "government_support", label: "Government Subsidy / Support" },
  { value: "other_income", label: "Other Income" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI / Digital" },
  { value: "bank", label: "Bank Transfer" },
  { value: "credit", label: "Credit / Loan" },
  { value: "other", label: "Other" },
];

const TransactionForm = ({
  transaction = null,
  farms = [],
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(transaction);

  const [farmId, setFarmId] = useState(
    transaction?.farm?._id || transaction?.farm || (farms[0]?._id || "")
  );
  const [cropId, setCropId] = useState(
    transaction?.crop?._id || transaction?.crop || ""
  );
  const [type, setType] = useState(transaction?.type || "expense");
  const [category, setCategory] = useState(
    transaction?.category || (type === "expense" ? "fertilizer" : "crop_sale")
  );
  const [amount, setAmount] = useState(transaction?.amount || "");
  const [date, setDate] = useState(
    transaction?.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction?.paymentMethod || "cash"
  );
  const [description, setDescription] = useState(transaction?.description || "");
  const [reference, setReference] = useState(transaction?.reference || "");

  const [farmCrops, setFarmCrops] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Load crops for selected farm
  useEffect(() => {
    let isMounted = true;
    const fetchCropsForFarm = async () => {
      if (!farmId) {
        setFarmCrops([]);
        return;
      }
      try {
        const res = await getCrops(farmId);
        if (isMounted) {
          const list = res?.data || res || [];
          setFarmCrops(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to load crops for farm:", err);
      }
    };
    fetchCropsForFarm();
    return () => {
      isMounted = false;
    };
  }, [farmId]);

  // Adjust default category when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === "expense" ? "fertilizer" : "crop_sale");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!farmId) {
      setFormError("Please select a farm.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) < 0) {
      setFormError("Please enter a valid non-negative amount.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        farmId,
        cropId: cropId || undefined,
        type,
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        description: description.trim(),
        reference: reference.trim(),
      };

      if (isEditing) {
        await updateTransaction(transaction._id || transaction.id, payload);
      } else {
        await createTransaction(payload);
      }

      onSuccess();
    } catch (err) {
      console.error("Submit transaction error:", err);
      setFormError(
        err?.data?.message || err?.message || "Unable to save transaction. Please check your inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="scheme-modal-overlay" onClick={onClose}>
      <div
        className="scheme-modal-container transaction-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scheme-modal-header">
          <div className="scheme-modal-header-top">
            <h2 className="scheme-modal-title">
              {isEditing ? "Edit Transaction" : "Add New Transaction"}
            </h2>
            <button
              className="scheme-modal-close-btn"
              onClick={onClose}
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
            Record an income or expense entry for your farm management records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="scheme-modal-body">
          {formError && (
            <div className="form-error-banner">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {/* Type Selector (Income vs Expense) */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn expense ${type === "expense" ? "active" : ""}`}
                onClick={() => handleTypeChange("expense")}
              >
                Expense (Money Out)
              </button>
              <button
                type="button"
                className={`type-toggle-btn income ${type === "income" ? "active" : ""}`}
                onClick={() => handleTypeChange("income")}
              >
                Income (Money In)
              </button>
            </div>
          </div>

          {/* Farm & Crop Selection */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="tx-farm-select" className="form-label">
                Farm <span className="required-star">*</span>
              </label>
              <select
                id="tx-farm-select"
                className="form-select"
                value={farmId}
                onChange={(e) => {
                  setFarmId(e.target.value);
                  setCropId("");
                }}
                required
              >
                <option value="">-- Select Farm --</option>
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tx-crop-select" className="form-label">
                Crop (Optional)
              </label>
              <select
                id="tx-crop-select"
                className="form-select"
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                disabled={!farmId}
              >
                <option value="">-- General Farm Record (No specific crop) --</option>
                {farmCrops.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.variety ? `(${c.variety})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Amount */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="tx-category-select" className="form-label">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="tx-category-select"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {currentCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tx-amount-input" className="form-label">
                Amount (₹) <span className="required-star">*</span>
              </label>
              <div className="amount-input-wrapper">
                <IndianRupee size={16} className="amount-currency-icon" />
                <input
                  id="tx-amount-input"
                  type="number"
                  step="any"
                  min="0"
                  className="form-input amount-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="tx-date-input" className="form-label">
                Date <span className="required-star">*</span>
              </label>
              <input
                id="tx-date-input"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tx-payment-select" className="form-label">
                Payment Method
              </label>
              <select
                id="tx-payment-select"
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="tx-desc-input" className="form-label">
              Description / Notes
            </label>
            <textarea
              id="tx-desc-input"
              className="form-textarea"
              rows="2"
              placeholder="Add details (e.g. Purchased 20kg Urea fertilizer from local dealer)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Reference */}
          <div className="form-group">
            <label htmlFor="tx-ref-input" className="form-label">
              Receipt / Reference No. (Optional)
            </label>
            <input
              id="tx-ref-input"
              type="text"
              className="form-input"
              placeholder="Invoice #, UPI Txn ID, Bill No."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="scheme-modal-footer" style={{ padding: 0, marginTop: "1rem", background: "transparent" }}>
            <button
              type="button"
              className="modal-close-action-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="official-link-btn primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : isEditing ? "Update Transaction" : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
