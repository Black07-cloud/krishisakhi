import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  AlertCircle,
  Filter,
  Bot,
  Landmark,
  Building,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getFarms } from "../../api/farmApi";
import { getCropsByFarm } from "../../api/cropApi";
import {
  getTransactions,
  getFinanceSummary,
  deleteTransaction,
} from "../../api/financeApi";
import SummaryCards from "../../components/finance/SummaryCards";
import TransactionForm, {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../../components/finance/TransactionForm";
import TransactionList from "../../components/finance/TransactionList";
import FinanceCharts from "../../components/finance/FinanceCharts";
import "./Finance.css";

const Finance = () => {
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Filters state
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [availableCrops, setAvailableCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data states
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [error, setError] = useState(null);

  // Modal controls
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // 1. Fetch user farms
  useEffect(() => {
    let isMounted = true;
    const fetchUserFarms = async () => {
      setLoadingFarms(true);
      try {
        const res = await getFarms();
        if (isMounted) {
          const list = res?.data || res || [];
          setFarms(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Error loading user farms:", err);
      } finally {
        if (isMounted) setLoadingFarms(false);
      }
    };
    fetchUserFarms();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch crops when selected farm changes
  useEffect(() => {
    let isMounted = true;
    const fetchCrops = async () => {
      if (!selectedFarmId) {
        setAvailableCrops([]);
        setSelectedCropId("");
        return;
      }

      try {
        const res = await getCropsByFarm(selectedFarmId);
        if (isMounted) {
          const list = res?.data || res || [];
          setAvailableCrops(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Error loading crops for farm:", err);
      }
    };
    fetchCrops();
    return () => {
      isMounted = false;
    };
  }, [selectedFarmId]);

  // 3. Fetch summary & transactions
  const loadFinanceData = useCallback(async () => {
    setLoadingSummary(true);
    setLoadingTx(true);
    setError(null);

    try {
      const queryParams = {
        farmId: selectedFarmId || undefined,
        cropId: selectedCropId || undefined,
        type: selectedType || undefined,
        category: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      };

      const [summaryRes, txRes] = await Promise.all([
        getFinanceSummary(queryParams),
        getTransactions(queryParams),
      ]);

      if (summaryRes && summaryRes.success) {
        setSummary(summaryRes.data);
      }

      if (txRes && txRes.success) {
        setTransactions(txRes.data.transactions || []);
        setTotalPages(txRes.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError(
        err?.message || "Unable to load financial data. Please try again."
      );
    } finally {
      setLoadingSummary(false);
      setLoadingTx(false);
    }
  }, [
    selectedFarmId,
    selectedCropId,
    selectedType,
    selectedCategory,
    startDate,
    endDate,
    page,
  ]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  // Handlers
  const handleClearFilters = () => {
    setSelectedFarmId("");
    setSelectedCropId("");
    setSelectedType("");
    setSelectedCategory("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleEditTx = (tx) => {
    setEditingTransaction(tx);
    setShowFormModal(true);
  };

  const handleDeleteTx = async (id) => {
    try {
      await deleteTransaction(id);
      loadFinanceData();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert(err?.data?.message || err?.message || "Unable to delete transaction.");
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingTransaction(null);
    loadFinanceData();
  };

  // Determine current categories for filter
  const categoryOptions =
    selectedType === "income"
      ? INCOME_CATEGORIES
      : selectedType === "expense"
      ? EXPENSE_CATEGORIES
      : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const hasActiveFilters =
    Boolean(selectedFarmId) ||
    Boolean(selectedCropId) ||
    Boolean(selectedType) ||
    Boolean(selectedCategory) ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="finance-page">
      {/* Header */}
      <header className="finance-header">
        <div className="finance-header-left">
          <div className="finance-header-icon">
            <Wallet size={26} />
          </div>
          <div>
            <h1>Farm Finance</h1>
            <p>Track farm income, expenses and profitability.</p>
          </div>
        </div>

        <button
          className="add-transaction-btn"
          onClick={() => {
            setEditingTransaction(null);
            setShowFormModal(true);
          }}
        >
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </header>

      {/* Filter Controls Bar */}
      <div className="finance-filter-bar">
        {/* Farm Selector */}
        <div className="filter-item">
          <label htmlFor="fin-farm-select">Farm</label>
          <select
            id="fin-farm-select"
            className="finance-select"
            value={selectedFarmId}
            onChange={(e) => {
              setSelectedFarmId(e.target.value);
              setSelectedCropId("");
              setPage(1);
            }}
          >
            <option value="">All Farms</option>
            {farms.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Crop Selector */}
        <div className="filter-item">
          <label htmlFor="fin-crop-select">Crop</label>
          <select
            id="fin-crop-select"
            className="finance-select"
            value={selectedCropId}
            onChange={(e) => {
              setSelectedCropId(e.target.value);
              setPage(1);
            }}
            disabled={!selectedFarmId}
          >
            <option value="">All Crops</option>
            {availableCrops.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="filter-item">
          <label htmlFor="fin-type-select">Type</label>
          <select
            id="fin-type-select"
            className="finance-select"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-item">
          <label htmlFor="fin-category-select">Category</label>
          <select
            id="fin-category-select"
            className="finance-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="filter-item">
          <label htmlFor="fin-start-date">From Date</label>
          <input
            id="fin-start-date"
            type="date"
            className="finance-input"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* End Date */}
        <div className="filter-item">
          <label htmlFor="fin-end-date">To Date</label>
          <input
            id="fin-end-date"
            type="date"
            className="finance-input"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            <RefreshCw size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* No Farms Banner */}
      {!loadingFarms && farms.length === 0 && (
        <div className="scheme-empty-state" style={{ margin: "0 0 2rem 0" }}>
          <div className="empty-icon-wrapper">
            <Building size={36} />
          </div>
          <h3>No farms registered</h3>
          <p>Register your first farm to start recording farm income and expenses.</p>
          <Link to="/farms" className="official-link-btn primary">
            Add Farm
          </Link>
        </div>
      )}

      {/* Main Error Banner */}
      {error && (
        <div className="scheme-error-state" style={{ marginBottom: "2rem" }}>
          <div className="error-icon-wrapper">
            <AlertCircle size={36} />
          </div>
          <h3>Unable to load financial data</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadFinanceData}>
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards summary={summary} loading={loadingSummary} />

      {/* Financial Charts */}
      <FinanceCharts summary={summary} />

      {/* Transaction List Section */}
      <section className="transaction-list-section">
        <div className="section-title-bar">
          <h2>Financial Ledger</h2>
          <span className="results-count">
            {transactions.length} entries shown
          </span>
        </div>

        <TransactionList
          transactions={transactions}
          loading={loadingTx}
          onEdit={handleEditTx}
          onDelete={handleDeleteTx}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="schemes-pagination">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* AI Assistant Banner */}
      <div className="ai-help-banner" style={{ marginTop: "2rem" }}>
        <div className="ai-help-content">
          <div className="ai-help-icon-wrapper">
            <Bot size={22} />
          </div>
          <div>
            <h4>Need financial insights?</h4>
            <p>Farmio AI can help analyze your farm expenses and financial records.</p>
          </div>
        </div>
        <Link to="/ai" className="ask-ai-btn">
          Ask Farmio AI
        </Link>
      </div>

      {/* Add / Edit Transaction Form Modal */}
      {showFormModal && (
        <TransactionForm
          transaction={editingTransaction}
          farms={farms}
          onClose={() => {
            setShowFormModal(false);
            setEditingTransaction(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Finance;
